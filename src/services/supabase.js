import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Real-time subscriptions
export const createRealtimeSubscription = (table, event, callback) => {
  return supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', { event, table }, callback)
    .subscribe();
};

// User profile operations
export const userService = {
  getProfile: async (userId) => {
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
      .eq('id', userId)
      .single();
    
    return { data, error };
  },

  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  },

  submitApplication: async (applicationData) => {
    const { data, error } = await supabase
      .from('user_applications')
      .insert(applicationData)
      .select()
      .single();
    
    return { data, error };
  }
};

// Document operations
export const documentService = {
  uploadFile: async (file, bucket = 'documents') => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    
    if (error) return { error };
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return { data: { fileName, publicUrl }, error: null };
  },

  getDocuments: async (filters = {}) => {
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

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20) - 1);

    return { data, error };
  },

  recordDownload: async (documentId, userId) => {
    const { error } = await supabase
      .from('document_downloads')
      .insert({
        document_id: documentId,
        user_id: userId
      });
    
    return { error };
  }
};

// Chat operations
export const chatService = {
  getThreads: async (userId) => {
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
      .contains('participants', [userId])
      .order('last_message_at', { ascending: false });
    
    return { data, error };
  },

  createThread: async (threadData) => {
    const { data, error } = await supabase
      .from('chat_threads')
      .insert(threadData)
      .select()
      .single();
    
    return { data, error };
  },

  getMessages: async (threadId, filters = {}) => {
    let query = supabase
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
      .eq('thread_id', threadId);

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1);

    return { data: data?.reverse() || [], error };
  },

  sendMessage: async (messageData) => {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
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
    
    return { data, error };
  },

  updateThreadLastMessage: async (threadId) => {
    const { error } = await supabase
      .from('chat_threads')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', threadId);
    
    return { error };
  }
};

// Post operations
export const postService = {
  getPosts: async (filters = {}) => {
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey (
          id,
          display_name,
          first_name,
          last_name
        ),
        comments (
          id,
          content,
          author_id,
          created_at
        )
      `)
      .eq('moderation_status', 'approved');

    // Apply filters
    if (filters.houseId) {
      query = query.eq('house_id', filters.houseId);
    }
    if (filters.visibility) {
      query = query.eq('visibility', filters.visibility);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20) - 1);

    return { data, error };
  },

  createPost: async (postData) => {
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select(`
        *,
        author:users!posts_author_id_fkey (
          id,
          display_name,
          first_name,
          last_name
        )
      `)
      .single();
    
    return { data, error };
  },

  likePost: async (postId, userId) => {
    const { error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: userId
      });
    
    return { error };
  },

  unlikePost: async (postId, userId) => {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    
    return { error };
  }
};

// Notification operations
export const notificationService = {
  getNotifications: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  markAsRead: async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);
    
    return { error };
  },

  createNotification: async (notificationData) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();
    
    return { data, error };
  }
};

export default supabase;