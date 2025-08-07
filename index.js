const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const Redis = require('redis');
const Stripe = require('stripe');

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const redisUrl = process.env.UPSTASH_REDIS_URL;
const stripeKey = process.env.STRIPE_KEY;
const copyleaksKey = process.env.COPYLEAKS_KEY;
const openaiKey = process.env.OPENAI_KEY;
const claudeKey = process.env.CLAUDE_KEY;

// Initialize clients
const supabase = createClient(supabaseUrl, supabaseKey);
const redisClient = Redis.createClient({ url: redisUrl });
const stripe = Stripe(stripeKey);

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Middleware to authenticate requests using Supabase JWTs.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });
  const token = authHeader.split(' ')[1];
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    req.user = data.user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Route: Magic Link Login (Trigger email from backend for convenience)
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.CLIENT_URL || 'http://localhost:3000'}` }
    });
    if (error) throw error;
    res.json({ message: 'Magic link sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending magic link' });
  }
});

// Document upload (Admin only)
app.post('/api/docs/upload', authenticate, async (req, res) => {
  const user = req.user;
  if (user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });
  // TODO: handle file upload via Supabase storage and Copyleaks moderation
  res.json({ message: 'Upload endpoint stub' });
});

// Document listing (Member or Admin)
app.get('/api/docs', authenticate, async (req, res) => {
  // TODO: retrieve documents by category with RLS enforced at DB level
  res.json({ documents: [] });
});

// Chat thread creation
app.post('/api/chat/thread', authenticate, async (req, res) => {
  // TODO: create chat thread in Supabase DB and broadcast via Realtime
  res.json({ threadId: 'stub-thread-id' });
});

// Messaging
app.get('/api/chat/:threadId/messages', authenticate, async (req, res) => {
  const { threadId } = req.params;
  // TODO: retrieve last 10 messages from Redis cache or Supabase
  res.json({ messages: [] });
});

// Post creation with moderation
app.post('/api/posts', authenticate, async (req, res) => {
  // TODO: accept text/media, call Copyleaks and AI for caption, store in DB
  res.json({ postId: 'stub-post-id', moderationStatus: 'pending' });
});

// Posts listing
app.get('/api/posts', authenticate, async (req, res) => {
  // TODO: fetch posts with pagination, include moderation status
  res.json({ posts: [] });
});

// Stripe subscription
app.post('/api/subscribe', authenticate, async (req, res) => {
  const { priceId } = req.body;
  if (!priceId) return res.status(400).json({ message: 'priceId is required' });
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/?success=true`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/?canceled=true`,
      metadata: { user_id: req.user.id }
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Stripe error' });
  }
});

// Webhook for Stripe events
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // TODO: verify signature and update subscription status in DB
  res.json({ received: true });
});

// AI summarization example
app.post('/api/ai/summarize', authenticate, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'text required' });
  // TODO: call OpenAI/Claude API using openaiKey/claudeKey
  res.json({ summary: 'This is a stub summary.' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
