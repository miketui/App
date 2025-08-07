import express from 'express';
import Stripe from 'stripe';
import { authenticate, requireRole } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'basic',
        name: 'Basic Member',
        price: 999,
        interval: 'month',
        features: [
          'Access to community feed',
          'Basic document library',
          'Chat with members',
          'Event notifications'
        ]
      },
      {
        id: 'premium',
        name: 'Premium Member',
        price: 1999,
        interval: 'month',
        features: [
          'All Basic features',
          'Advanced document access',
          'Priority support',
          'Event discounts',
          'Exclusive content'
        ]
      },
      {
        id: 'leader',
        name: 'House Leader',
        price: 3999,
        interval: 'month',
        features: [
          'All Premium features',
          'House management tools',
          'Analytics dashboard',
          'Event creation',
          'Member management'
        ]
      },
      {
        id: 'admin',
        name: 'Admin',
        price: 7999,
        interval: 'month',
        features: [
          'All Leader features',
          'Full platform access',
          'Content moderation',
          'User management',
          'System settings'
        ]
      }
    ];

    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch plans' });
  }
});

// Create subscription
router.post('/subscriptions', authenticate, async (req, res) => {
  try {
    const { plan_id, payment_method_id } = req.body;
    const userId = req.user.id;

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Create or get Stripe customer
    let customer;
    if (user.stripe_customer_id) {
      customer = await stripe.customers.retrieve(user.stripe_customer_id);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: userId
        }
      });

      // Update user with Stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customer.id })
        .eq('id', userId);
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: customer.id,
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: plan_id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Store subscription in database
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        plan_id: plan_id,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000)
      });

    if (subError) {
      console.error('Error storing subscription:', subError);
    }

    res.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel subscription
router.delete('/subscriptions/:subscriptionId', authenticate, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;

    // Verify subscription belongs to user
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    // Cancel in Stripe
    await stripe.subscriptions.cancel(subscriptionId);

    // Update in database
    await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        canceled_at: new Date()
      })
      .eq('stripe_subscription_id', subscriptionId);

    res.json({ success: true, message: 'Subscription canceled successfully' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update subscription
router.patch('/subscriptions/:subscriptionId', authenticate, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { plan_id } = req.body;
    const userId = req.user.id;

    // Verify subscription belongs to user
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    // Update in Stripe
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: subscription.stripe_subscription_item_id, price: plan_id }],
      proration_behavior: 'create_prorations'
    });

    // Update in database
    await supabase
      .from('subscriptions')
      .update({ 
        plan_id: plan_id,
        current_period_start: new Date(updatedSubscription.current_period_start * 1000),
        current_period_end: new Date(updatedSubscription.current_period_end * 1000)
      })
      .eq('stripe_subscription_id', subscriptionId);

    res.json({ success: true, data: updatedSubscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get subscription
router.get('/subscriptions/:subscriptionId', authenticate, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;

    // Get from database
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    // Get from Stripe for latest data
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    res.json({ success: true, data: { ...subscription, stripe: stripeSubscription } });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create payment intent
router.post('/payment-intents', authenticate, async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;
    const userId = req.user.id;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        user_id: userId,
        ...metadata
      }
    });

    res.json({ success: true, data: paymentIntent });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Confirm payment
router.post('/payment-intents/:paymentIntentId/confirm', authenticate, async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const { payment_method_id } = req.body;

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: payment_method_id
    });

    res.json({ success: true, data: paymentIntent });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create event ticket
router.post('/event-tickets', authenticate, async (req, res) => {
  try {
    const { event_id, ticket_type, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Calculate total amount
    const ticketPrice = event.ticket_types.find(t => t.id === ticket_type)?.price || 0;
    const totalAmount = ticketPrice * quantity;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      metadata: {
        user_id: userId,
        event_id,
        ticket_type,
        quantity
      }
    });

    res.json({ success: true, data: paymentIntent });
  } catch (error) {
    console.error('Error creating event ticket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Purchase event ticket
router.post('/event-tickets/purchase', authenticate, async (req, res) => {
  try {
    const { event_id, ticket_type, quantity, payment_method_id } = req.body;
    const userId = req.user.id;

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Calculate total amount
    const ticketPrice = event.ticket_types.find(t => t.id === ticket_type)?.price || 0;
    const totalAmount = ticketPrice * quantity;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      payment_method: payment_method_id,
      confirm: true,
      metadata: {
        user_id: userId,
        event_id,
        ticket_type,
        quantity
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Create ticket purchase record
      const { error: ticketError } = await supabase
        .from('event_participants')
        .insert({
          user_id: userId,
          event_id,
          ticket_type,
          quantity,
          payment_intent_id: paymentIntent.id,
          status: 'confirmed'
        });

      if (ticketError) {
        console.error('Error creating ticket purchase:', ticketError);
      }
    }

    res.json({ success: true, data: paymentIntent });
  } catch (error) {
    console.error('Error purchasing event ticket:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create donation
router.post('/donations', authenticate, async (req, res) => {
  try {
    const { amount, cause, message = '' } = req.body;
    const userId = req.user.id;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        user_id: userId,
        type: 'donation',
        cause,
        message
      }
    });

    res.json({ success: true, data: paymentIntent });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get payment history
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const { data: payments, error, count } = await supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get invoices
router.get('/invoices/:subscriptionId', authenticate, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;

    // Verify subscription belongs to user
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      return res.status(404).json({ success: false, error: 'Subscription not found' });
    }

    const invoices = await stripe.invoices.list({
      subscription: subscriptionId,
      limit: 12
    });

    res.json({ success: true, data: invoices.data });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download invoice
router.get('/invoices/:invoiceId/download', authenticate, async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await stripe.invoices.retrieve(invoiceId);
    const pdf = await stripe.invoices.retrievePdf(invoiceId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceId}.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create refund
router.post('/refunds', authenticate, requireRole(['Admin', 'Leader']), async (req, res) => {
  try {
    const { payment_id, amount, reason = '' } = req.body;

    const refund = await stripe.refunds.create({
      payment_intent: payment_id,
      amount,
      reason: 'requested_by_customer',
      metadata: {
        reason,
        refunded_by: req.user.id
      }
    });

    res.json({ success: true, data: refund });
  } catch (error) {
    console.error('Error creating refund:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook handlers
async function handleSubscriptionChange(subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      stripe_subscription_id: subscription.id,
      user_id: subscription.metadata.user_id,
      plan_id: subscription.items.data[0].price.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000)
    });

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionCanceled(subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error canceling subscription:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  // Handle successful payment
  console.log('Payment succeeded:', invoice.id);
}

async function handlePaymentFailed(invoice) {
  // Handle failed payment
  console.log('Payment failed:', invoice.id);
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  // Handle successful payment intent
  console.log('Payment intent succeeded:', paymentIntent.id);
}

export default router;