const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const Redis = require('redis');
const Stripe = require('stripe');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { Server } = require('socket.io');
const http = require('http');

// Environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const redisUrl = process.env.UPSTASH_REDIS_URL;
const stripeKey = process.env.STRIPE_SECRET_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const claudeKey = process.env.CLAUDE_API_KEY;
const copyleaksKey = process.env.COPYLEAKS_API_KEY;

// Initialize clients
const supabase = createClient(supabaseUrl, supabaseKey);
const redisClient = Redis.createClient({ url: redisUrl });
const stripe = Stripe(stripeKey);
const openai = new OpenAI({ apiKey: openaiKey });
const claude = new Anthropic({ apiKey: claudeKey });

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

/**
 * Authentication middleware
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(401).json({ message: 'User profile not found' });
    }

    req.user = user;
    req.userProfile = profile;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
}

/**
 * Role-based authorization middleware
 */
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.userProfile) {
      return res.status(401).json({ message: 'User profile required' });
    }

    if (!roles.includes(req.userProfile.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Magic link login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback`
      }
    });

    if (error) throw error;

    res.json({ message: 'Magic link sent successfully' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to send magic link' });
  }
});

// Generate login code for new users
app.post('/api/auth/generate-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, role, status')
      .eq('email', email)
      .single();

    if (existingUser) {
      // User exists, send magic link instead
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback`
        }
      });

      if (error) throw error;
      return res.json({ message: 'Magic link sent to existing user' });
    }

    // Generate unique login code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Store login code
    const { error } = await supabase
      .from('users')
      .insert({
        email,
        login_code: code,
        login_code_expires_at: expiresAt.toISOString(),
        role: 'Applicant',
        status: 'pending'
      });

    if (error) throw error;

    res.json({ code, message: 'Login code generated successfully' });
  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({ message: 'Failed to generate login code' });
  }
});

// Verify login code
app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    // Verify login code
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('login_code', code)
      .eq('login_code_expires_at', '>', new Date().toISOString())
      .single();

    if (error || !data) {
      return res.status(400).json({ message: 'Invalid or expired login code' });
    }

    // Clear login code
    await supabase
      .from('users')
      .update({
        login_code: null,
        login_code_expires_at: null
      })
      .eq('id', data.id);

    res.json({ 
      success: true, 
      user: data,
      message: 'Code verified successfully' 
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: 'Failed to verify code' });
  }
});

// ============================================================================
// USER MANAGEMENT ROUTES
// ============================================================================

// Get user profile
app.get('/api/users/profile', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        houses (
          id,
          name,
          category,
          description
        )
      `)
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Update user profile
app.put('/api/users/profile', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Submit application
app.post('/api/users/application', authenticate, async (req, res) => {
  try {
    const applicationData = req.body;
    
    const { data, error } = await supabase
      .from('user_applications')
      .insert({
        user_id: req.user.id,
        applicant_data: applicationData,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Update user status
    await supabase
      .from('users')
      .update({ status: 'pending' })
      .eq('id', req.user.id);

    res.json(data);
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

// Get applications (Admin only)
app.get('/api/users/applications', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_applications')
      .select(`
        *,
        users (
          id,
          email,
          first_name,
          last_name,
          display_name
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Failed to get applications' });
  }
});

// Review application (Admin only)
app.put('/api/users/applications/:id', authenticate, requireRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, review_notes } = req.body;

    const { data, error } = await supabase
      .from('user_applications')
      .update({
        status,
        review_notes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: req.user.id
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update user role and status based on application decision
    if (status === 'approved') {
      await supabase
        .from('users')
        .update({ 
          role: 'Member',
          status: 'active'
        })
        .eq('id', data.user_id);
    }

    res.json(data);
  } catch (error) {
    console.error('Review application error:', error);
    res.status(500).json({ message: 'Failed to review application' });
  }
});

// ============================================================================
// DOCUMENT MANAGEMENT ROUTES
// ============================================================================

// Upload document (Admin only)
app.post('/api/documents/upload', authenticate, requireRole(['Admin']), upload.single('file'), async (req, res) => {
  try {
    const { title, description, category, access_level, tags } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Save document metadata
    const { data, error } = await supabase
      .from('documents')
      .insert({
        title,
        description,
        category,
        file_url: publicUrl,
        file_type: file.mimetype,
        file_size: file.size,
        uploader_id: req.user.id,
        access_level: access_level || 'Member',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : []
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Failed to upload document' });
  }
});

// Get documents
app.get('/api/documents', authenticate, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('documents')
      .select(`
        *,
        uploader:users!documents_uploader_id_fkey (
          id,
          display_name,
          first_name,
          last_name
        )
      `)
      .eq('moderation_status', 'approved');

    // Apply role-based filtering
    if (req.userProfile.role === 'Applicant') {
      query = query.eq('access_level', 'Applicant');
    } else if (req.userProfile.role === 'Member') {
      query = query.in('access_level', ['Applicant', 'Member']);
    } else if (req.userProfile.role === 'Leader') {
      query = query.in('access_level', ['Applicant', 'Member', 'Leader']);
    }
    // Admin can see all documents

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Failed to get documents' });
  }
});

// Download document
app.post('/api/documents/:id/download', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Record download
    const { error } = await supabase
      .from('document_downloads')
      .insert({
        document_id: id,
        user_id: req.user.id
      });

    if (error) throw error;

    // Update download count
    await supabase.rpc('increment_download_count', { doc_id: id });

    res.json({ message: 'Download recorded' });
  } catch (error) {
    console.error('Record download error:', error);
    res.status(500).json({ message: 'Failed to record download' });
  }
});

// ============================================================================
// CHAT ROUTES
// ============================================================================

// Get chat threads
app.get('/api/chat/threads', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chat_threads')
      .select(`
        *,
        messages (
          id,
          content,
          sender_id,
          created_at
        )
      `)
      .contains('participants', [req.user.id])
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ message: 'Failed to get chat threads' });
  }
});

// Create chat thread
app.post('/api/chat/threads', authenticate, async (req, res) => {
  try {
    const { name, thread_type, participants } = req.body;

    const { data, error } = await supabase
      .from('chat_threads')
      .insert({
        name,
        thread_type,
        participants: [...participants, req.user.id],
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ message: 'Failed to create chat thread' });
  }
});

// Get messages
app.get('/api/chat/threads/:threadId/messages', authenticate, async (req, res) => {
  try {
    const { threadId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey (
          id,
          display_name,
          first_name,
          last_name
        )
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json(data.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to get messages' });
  }
});

// Send message
app.post('/api/chat/threads/:threadId/messages', authenticate, async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content, message_type = 'text', file_url } = req.body;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        sender_id: req.user.id,
        content,
        message_type,
        file_url
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey (
          id,
          display_name,
          first_name,
          last_name
        )
      `)
      .single();

    if (error) throw error;

    // Update thread last message
    await supabase
      .from('chat_threads')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', threadId);

    // Emit to socket
    io.to(threadId).emit('new_message', data);

    res.json(data);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// ============================================================================
// AI INTEGRATION ROUTES
// ============================================================================

// Generate AI caption
app.post('/api/ai/generate-caption', authenticate, async (req, res) => {
  try {
    const { content, mediaType } = req.body;

    const prompt = `Generate a creative and engaging caption for a ballroom/voguing community post. 
    Content: ${content}
    Media type: ${mediaType || 'text'}
    
    The caption should be:
    - Authentic to ballroom culture
    - Engaging and inclusive
    - Appropriate for a community platform
    - 1-2 sentences maximum`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7
    });

    const caption = completion.choices[0].message.content.trim();
    res.json({ caption });
  } catch (error) {
    console.error('Generate caption error:', error);
    res.status(500).json({ message: 'Failed to generate caption' });
  }
});

// Content moderation
app.post('/api/ai/moderate-content', authenticate, async (req, res) => {
  try {
    const { content, contentType } = req.body;

    const prompt = `Analyze this content for the Haus of Basquiat ballroom community platform.
    
    Content: ${content}
    Type: ${contentType}
    
    Check for:
    1. Hate speech or discrimination
    2. Inappropriate language
    3. Spam or irrelevant content
    4. Personal attacks
    5. Cultural appropriation or disrespect
    
    Respond with:
    - Status: "approved", "flagged", or "rejected"
    - Reason: Brief explanation
    - Confidence: 0-100 score`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.3
    });

    const analysis = completion.choices[0].message.content.trim();
    
    // Parse the response
    const statusMatch = analysis.match(/Status:\s*(approved|flagged|rejected)/i);
    const reasonMatch = analysis.match(/Reason:\s*(.+?)(?:\n|$)/i);
    const confidenceMatch = analysis.match(/Confidence:\s*(\d+)/i);

    const result = {
      status: statusMatch ? statusMatch[1].toLowerCase() : 'pending',
      reason: reasonMatch ? reasonMatch[1].trim() : 'AI analysis completed',
      confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50,
      analysis
    };

    res.json(result);
  } catch (error) {
    console.error('Content moderation error:', error);
    res.status(500).json({ message: 'Failed to moderate content' });
  }
});

// ============================================================================
// SOCKET.IO EVENTS
// ============================================================================

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join chat room
  socket.on('join_thread', (threadId) => {
    socket.join(threadId);
    console.log(`User ${socket.id} joined thread ${threadId}`);
  });

  // Leave chat room
  socket.on('leave_thread', (threadId) => {
    socket.leave(threadId);
    console.log(`User ${socket.id} left thread ${threadId}`);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.threadId).emit('user_typing', {
      userId: data.userId,
      userName: data.userName
    });
  });

  // Stop typing
  socket.on('stop_typing', (data) => {
    socket.to(data.threadId).emit('user_stop_typing', {
      userId: data.userId
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ============================================================================
// START SERVER
// ============================================================================

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`🚀 Haus of Basquiat backend server running on port ${port}`);
  console.log(`📱 Socket.IO server ready for real-time communication`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});