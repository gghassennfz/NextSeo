import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, billingPeriod } = await request.json()

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Price ID and user ID are required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // Get user details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create or retrieve Stripe customer
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name,
        metadata: {
          userId: userId
        }
      })
      customerId = customer.id

      // Update profile with customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${request.headers.get('origin')}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        billingPeriod: billingPeriod
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: {
          userId: userId
        }
      }
    })

    // Log checkout attempt
    await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        action: 'checkout_attempt',
        details: {
          price_id: priceId,
          billing_period: billingPeriod,
          session_id: session.id
        }
      })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // Get user's subscription status
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let subscription = null
    if (profile.stripe_subscription_id) {
      try {
        subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
      } catch (stripeError) {
        console.error('Error fetching subscription:', stripeError)
      }
    }

    return NextResponse.json({
      success: true,
      subscription: {
        tier: profile.subscription_tier,
        status: profile.subscription_status,
        stripeSubscription: subscription
      }
    })

  } catch (error) {
    console.error('Subscription status error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch subscription status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
