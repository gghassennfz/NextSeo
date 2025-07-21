import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createSupabaseClient()

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get the customer to find the user email
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
        
        if (!customer.email) {
          console.error('No email found for customer:', customerId)
          break
        }

        // Update user's subscription status
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_tier: subscription.status === 'active' ? 'pro' : 'free',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            updated_at: new Date().toISOString()
          })
          .eq('email', customer.email)

        if (error) {
          console.error('Error updating subscription:', error)
        } else {
          console.log('Successfully updated subscription for:', customer.email)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get the customer to find the user email
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
        
        if (!customer.email) {
          console.error('No email found for customer:', customerId)
          break
        }

        // Downgrade user to free tier
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            stripe_subscription_id: null,
            subscription_status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('email', customer.email)

        if (error) {
          console.error('Error canceling subscription:', error)
        } else {
          console.log('Successfully canceled subscription for:', customer.email)
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Log successful payment
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
        
        if (customer.email) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', customer.email)
            .single()

          if (profile) {
            await supabase
              .from('usage_logs')
              .insert({
                user_id: profile.id,
                action: 'payment',
                details: {
                  amount: invoice.amount_paid,
                  currency: invoice.currency,
                  invoice_id: invoice.id
                }
              })
          }
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Handle failed payment
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
        
        if (customer.email) {
          console.log('Payment failed for:', customer.email)
          // Optionally, you could send an email notification here
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
