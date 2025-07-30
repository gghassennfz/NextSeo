import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await handleSuccessfulPayment(session)
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(updatedSubscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(deletedSubscription)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(failedInvoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId
    const planName = session.metadata?.planName

    if (!userId) {
      console.error('No userId found in session metadata')
      return
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    
    // Update user's subscription in database
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: planName?.toLowerCase() || 'pro',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_start_date: new Date(subscription.created * 1000).toISOString(),
        subscription_end_date: subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000).toISOString() 
          : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user subscription:', error)
    } else {
      console.log(`Successfully upgraded user ${userId} to ${planName}`)
    }
  } catch (error) {
    console.error('Error handling successful payment:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId

    if (!userId) {
      console.error('No userId found in subscription metadata')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: subscription.status,
        subscription_end_date: subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000).toISOString() 
          : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating subscription:', error)
    } else {
      console.log(`Successfully updated subscription for user ${userId}`)
    }
  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId

    if (!userId) {
      console.error('No userId found in subscription metadata')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'free',
        subscription_status: 'canceled',
        stripe_subscription_id: null,
        subscription_end_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error canceling subscription:', error)
    } else {
      console.log(`Successfully canceled subscription for user ${userId}`)
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    // Handle recurring payment success
    console.log(`Payment succeeded for invoice ${invoice.id}`)
    
    // You could add logic here to send confirmation emails, update payment history, etc.
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    // Handle payment failure
    console.log(`Payment failed for invoice ${invoice.id}`)
    
    // You could add logic here to send payment failure notifications, pause account access, etc.
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}
