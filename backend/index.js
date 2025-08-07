require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const Redis = require('redis');
const Stripe = require('stripe');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const redisUrl = process.env.UPSTASH_REDIS_URL;
const stripeKey = process.env.STRIPE_SECRET_KEY;
const copyleaksKey = process.env.COPYLEAKS_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const claudeKey = process.env.CLAUDE_API_KEY;

// Initialize clients
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const redisClient = redisUrl ? Redis.createClient({ url: redisUrl }) : null;
const stripe = stripeKey ? Stripe(stripeKey) : null;

// Connect to Redis
if (redisClient) {
  redisClient.connect().catch(console.error);
}

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});

/**
 * Authentication middleware
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        house:houses(*)
      `)
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    req.user = user;
    req.userProfile = profile;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Role-based authorization middleware
 */
function authorize(roles) {
  return (req, res, next) => {
    if (!req.userProfile) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.userProfile.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ==================== AUTH ROUTES ====================

// Magic link login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback`
      }
    });

    if (error) {
      console.error('Magic link error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Magic link sent successfully' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
app.get('/api/auth/profile', authenticate, async (req, res) => {
  res.json({ user: req.user, profile: req.userProfile });
});

// Update user profile
app.put('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove read-only fields
    delete updates.id;
    delete updates.email;
    delete updates.created_at;
    delete updates.role; // Role changes handled separately

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select(`
        *,
        house:houses(*)
      `)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ profile: data });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit application
app.post('/api/auth/apply', authenticate, async (req, res) => {
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

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Update user profile with application data
    await supabase
      .from('user_profiles')
      .update({
        display_name: applicationData.displayName,
        bio: applicationData.bio,
        pronouns: applicationData.pronouns,
        ballroom_experience: applicationData.ballroomExperience,
        social_links: applicationData.socialLinks,
        status: 'pending'
      })
      .eq('id', req.user.id);

    res.json({ application: data });
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== USER MANAGEMENT ROUTES ====================

// Get houses list
app.get('/api/houses', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('houses')
      .select(`
        *,
        leader:user_profiles!houses_leader_id_fkey(display_name, avatar_url)
      `)
      .order('name');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ houses: data });
  } catch (error) {
    console.error('Houses fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get applications
app.get('/api/admin/applications', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    const { data, error } = await supabase
      .from('user_applications')
      .select(`
        *,
        user_profile:user_profiles(display_name, email, avatar_url)
      `)
      .eq('status', status)
      .order('submitted_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ applications: data });
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Review application
app.put('/api/admin/applications/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, assignedHouse } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update application
    const { data: application, error: appError } = await supabase
      .from('user_applications')
      .update({
        status,
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: req.user.id
      })
      .eq('id', id)
      .select()
      .single();

    if (appError) {
      return res.status(400).json({ error: appError.message });
    }

    // If approved, update user profile
    if (status === 'approved') {
      await supabase
        .from('user_profiles')
        .update({
          role: 'Member',
          status: 'active',
          house_id: assignedHouse || null
        })
        .eq('id', application.user_id);
    }

    res.json({ application });
  } catch (error) {
    console.error('Application review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== DOCUMENT MANAGEMENT ROUTES ====================

// Upload document (Admin only)
app.post('/api/documents/upload', authenticate, authorize(['Admin']), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, category, accessLevel = 'Member', tags = [] } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    // Generate unique filename
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `documents/${category}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      return res.status(400).json({ error: uploadError.message });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Save document metadata
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        title,
        category,
        file_url: publicUrl,
        file_type: req.file.mimetype,
        file_size: req.file.size,
        uploader_id: req.user.id,
        access_level: accessLevel,
        tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()),
        moderation_status: 'approved' // Auto-approve admin uploads
      })
      .select()
      .single();

    if (docError) {
      // Clean up uploaded file
      await supabase.storage.from('documents').remove([filePath]);
      return res.status(400).json({ error: docError.message });
    }

    res.json({ document });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get documents list
app.get('/api/documents', authenticate, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('documents')
      .select(`
        *,
        uploader:user_profiles!documents_uploader_id_fkey(display_name, avatar_url)
      `)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,tags.cs.{${search}}`);
    }

    // Apply role-based access control
    const userRole = req.userProfile.role;
    if (userRole === 'Member') {
      query = query.in('access_level', ['Member', 'Leader', 'Admin']);
    } else if (userRole === 'Leader') {
      query = query.in('access_level', ['Leader', 'Admin']);
    }
    // Admins can see all documents

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ documents: data });
  } catch (error) {
    console.error('Documents fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download document (with tracking)
app.get('/api/documents/:id/download', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Get document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (docError || !document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check access permissions
    const userRole = req.userProfile.role;
    const hasAccess = 
      document.access_level === 'Member' && ['Member', 'Leader', 'Admin'].includes(userRole) ||
      document.access_level === 'Leader' && ['Leader', 'Admin'].includes(userRole) ||
      document.access_level === 'Admin' && userRole === 'Admin';

    if (!hasAccess) {
      return res.status(403).json({ error: 'Insufficient permissions to access this document' });
    }

    // Track download
    await supabase.from('document_downloads').insert({
      document_id: id,
      user_id: req.user.id
    });

    // Increment download count
    await supabase
      .from('documents')
      .update({ download_count: document.download_count + 1 })
      .eq('id', id);

    // Return file URL for client-side download
    res.json({ downloadUrl: document.file_url });
  } catch (error) {
    console.error('Document download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get document categories
app.get('/api/documents/categories', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('category')
      .eq('moderation_status', 'approved')
      .order('category');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const categories = [...new Set(data.map(d => d.category))];
    res.json({ categories });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== MESSAGING ROUTES ====================

// Get user's chat threads
app.get('/api/chat/threads', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chat_threads')
      .select(`
        *,
        participants:user_profiles!inner(id, display_name, avatar_url),
        last_message:messages(content, created_at, sender_id, message_type)
      `)
      .contains('participants', [req.user.id])
      .order('last_message_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Format threads with participant info and last message
    const formattedThreads = data.map(thread => {
      const otherParticipants = thread.participants.filter(p => p.id !== req.user.id);
      const lastMessage = thread.last_message?.[0];
      
      return {
        ...thread,
        other_participants: otherParticipants,
        last_message: lastMessage,
        unread_count: 0 // TODO: Implement unread count
      };
    });

    res.json({ threads: formattedThreads });
  } catch (error) {
    console.error('Threads fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new chat thread
app.post('/api/chat/threads', authenticate, async (req, res) => {
  try {
    const { participantIds, name, threadType = 'direct' } = req.body;
    
    if (!participantIds || participantIds.length === 0) {
      return res.status(400).json({ error: 'Participant IDs are required' });
    }

    // Include current user in participants
    const allParticipants = [...new Set([req.user.id, ...participantIds])];
    
    // For direct messages, check if thread already exists
    if (threadType === 'direct' && allParticipants.length === 2) {
      const { data: existingThread } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('thread_type', 'direct')
        .contains('participants', allParticipants)
        .containedBy('participants', allParticipants)
        .single();

      if (existingThread) {
        return res.json({ thread: existingThread });
      }
    }

    const { data: thread, error } = await supabase
      .from('chat_threads')
      .insert({
        name,
        thread_type: threadType,
        participants: allParticipants,
        created_by: req.user.id
      })
      .select(`
        *,
        participants:user_profiles!inner(id, display_name, avatar_url)
      `)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ thread });
  } catch (error) {
    console.error('Thread creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a thread
app.get('/api/chat/threads/:threadId/messages', authenticate, async (req, res) => {
  try {
    const { threadId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user is participant in thread
    const { data: thread, error: threadError } = await supabase
      .from('chat_threads')
      .select('participants')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    if (!thread.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:user_profiles!messages_sender_id_fkey(display_name, avatar_url),
        reply_to_message:messages!messages_reply_to_fkey(content, sender_id)
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Mark messages as read
    await supabase
      .from('message_reads')
      .upsert({
        user_id: req.user.id,
        thread_id: threadId,
        last_read_at: new Date().toISOString()
      });

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message
app.post('/api/chat/threads/:threadId/messages', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content, messageType = 'text', replyTo } = req.body;

    // Check if user is participant in thread
    const { data: thread, error: threadError } = await supabase
      .from('chat_threads')
      .select('participants')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    if (!thread.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let fileUrl = null;
    
    // Handle file upload
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `chat/${threadId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (uploadError) {
        return res.status(400).json({ error: uploadError.message });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      fileUrl = publicUrl;
    }

    // Insert message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        thread_id: threadId,
        sender_id: req.user.id,
        content: content || null,
        message_type: messageType,
        file_url: fileUrl,
        reply_to: replyTo || null
      })
      .select(`
        *,
        sender:user_profiles!messages_sender_id_fkey(display_name, avatar_url),
        reply_to_message:messages!messages_reply_to_fkey(content, sender_id)
      `)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Update thread's last message timestamp
    await supabase
      .from('chat_threads')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', threadId);

    res.json({ message });
  } catch (error) {
    console.error('Message send error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get users for starting new conversations
app.get('/api/users', authenticate, async (req, res) => {
  try {
    const { search = '', exclude = [] } = req.query;
    let query = supabase
      .from('user_profiles')
      .select('id, display_name, avatar_url, role, house:houses(name)')
      .in('role', ['Member', 'Leader', 'Admin'])
      .neq('id', req.user.id);

    if (search) {
      query = query.ilike('display_name', `%${search}%`);
    }

    if (exclude.length > 0) {
      query = query.not('id', 'in', `(${exclude.join(',')})`);
    }

    const { data, error } = await query.limit(20);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ users: data });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SOCIAL FEED ROUTES ====================

// Get posts feed
app.get('/api/posts', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, houseOnly = false } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:user_profiles!posts_author_id_fkey(display_name, avatar_url, house:houses(name)),
        _count_likes:post_likes(count),
        _count_comments:comments(count),
        user_liked:post_likes!inner(user_id)
      `)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply visibility filters
    if (houseOnly && req.userProfile.house_id) {
      query = query.eq('house_id', req.userProfile.house_id);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Format posts with like status
    const formattedPosts = data.map(post => ({
      ...post,
      likes_count: post._count_likes?.[0]?.count || 0,
      comments_count: post._count_comments?.[0]?.count || 0,
      user_liked: post.user_liked?.some(like => like.user_id === req.user.id) || false
    }));

    res.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Posts fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new post
app.post('/api/posts', authenticate, authorize(['Member', 'Leader', 'Admin']), upload.array('media', 5), async (req, res) => {
  try {
    const { content, visibility = 'public', houseId } = req.body;
    
    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ error: 'Post must have content or media' });
    }

    let mediaUrls = [];
    
    // Handle media uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `posts/${req.user.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('posts-media')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });

        if (uploadError) {
          console.error('Media upload error:', uploadError);
          continue; // Skip failed uploads
        }

        const { data: { publicUrl } } = supabase.storage
          .from('posts-media')
          .getPublicUrl(filePath);

        mediaUrls.push(publicUrl);
      }
    }

    // Create post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        author_id: req.user.id,
        content,
        media_urls: mediaUrls,
        visibility,
        house_id: houseId || req.userProfile.house_id,
        moderation_status: 'approved' // Auto-approve for now
      })
      .select(`
        *,
        author:user_profiles!posts_author_id_fkey(display_name, avatar_url, house:houses(name))
      `)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ post: { ...post, likes_count: 0, comments_count: 0, user_liked: false } });
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/unlike post
app.post('/api/posts/:postId/like', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', req.user.id)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', req.user.id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ liked: false });
    } else {
      // Like
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: req.user.id
        });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Like toggle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get comments for a post
app.get('/api/posts/:postId/comments', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:user_profiles!comments_author_id_fkey(display_name, avatar_url),
        reply_to_comment:comments!comments_reply_to_fkey(author_id, content)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ comments: data });
  } catch (error) {
    console.error('Comments fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment to post
app.post('/api/posts/:postId/comments', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, replyTo } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: req.user.id,
        content: content.trim(),
        reply_to: replyTo || null
      })
      .select(`
        *,
        author:user_profiles!comments_author_id_fkey(display_name, avatar_url)
      `)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ comment });
  } catch (error) {
    console.error('Comment creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ERROR HANDLING ====================

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large' });
  }
  
  if (error.message === 'Only images and PDFs are allowed') {
    return res.status(400).json({ error: error.message });
  }

  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 Haus of Basquiat backend server running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (redisClient) {
    await redisClient.quit();
  }
  process.exit(0);
});
