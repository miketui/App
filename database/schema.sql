-- Haus of Basquiat Database Schema
-- Complete schema for the ballroom/voguing community platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Houses/committees table
CREATE TABLE IF NOT EXISTS houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('Vogue Femme', 'Butch Queen', 'Butch Queen Vogue Femme', 'Femme Queen', 'Butch Queen Up in Drags', 'Butch Queen Realness', 'Femme Queen Realness', 'Butch Queen Face', 'Femme Queen Face', 'Butch Queen Body', 'Femme Queen Body', 'Butch Queen Runway', 'Femme Queen Runway', 'Butch Queen Performance', 'Femme Queen Performance')),
  description text,
  leader_id uuid,
  member_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table with extended profile data
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text DEFAULT 'Applicant' CHECK (role IN ('Applicant', 'Member', 'Leader', 'Admin')),
  house_id uuid REFERENCES houses(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'banned', 'suspended')),
  profile_data jsonb DEFAULT '{}',
  login_code text UNIQUE,
  login_code_expires_at timestamptz,
  first_name text,
  last_name text,
  display_name text,
  bio text,
  avatar_url text,
  ballroom_categories text[],
  experience_level text CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced', 'Professional')),
  location text,
  social_links jsonb DEFAULT '{}',
  preferences jsonb DEFAULT '{}',
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User applications
CREATE TABLE IF NOT EXISTS user_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  applicant_data jsonb NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  review_notes text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id),
  house_preference uuid REFERENCES houses(id),
  ballroom_experience text,
  why_join text,
  references text[],
  portfolio_links text[]
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('Rules', 'History', 'Tutorials', 'Events', 'Resources', 'House Documents', 'Competition Info', 'Media')),
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  uploader_id uuid REFERENCES users(id) NOT NULL,
  access_level text DEFAULT 'Member' CHECK (access_level IN ('Applicant', 'Member', 'Leader', 'Admin')),
  download_count integer DEFAULT 0,
  moderation_status text DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'rejected')),
  tags text[],
  house_id uuid REFERENCES houses(id),
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document downloads tracking
CREATE TABLE IF NOT EXISTS document_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  downloaded_at timestamptz DEFAULT now()
);

-- Chat threads
CREATE TABLE IF NOT EXISTS chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  thread_type text CHECK (thread_type IN ('direct', 'group', 'house', 'announcement')),
  participants uuid[],
  created_by uuid REFERENCES users(id),
  house_id uuid REFERENCES houses(id),
  is_archived boolean DEFAULT false,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id),
  content text,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video', 'system')),
  file_url text,
  file_name text,
  file_size bigint,
  reply_to uuid REFERENCES messages(id),
  is_edited boolean DEFAULT false,
  edited_at timestamptz,
  moderation_status text DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'deleted')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Message reads tracking
CREATE TABLE IF NOT EXISTS message_reads (
  user_id uuid REFERENCES users(id),
  thread_id uuid REFERENCES chat_threads(id),
  last_read_at timestamptz DEFAULT now(),
  unread_count integer DEFAULT 0,
  PRIMARY KEY (user_id, thread_id)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES users(id) NOT NULL,
  content text,
  media_urls text[],
  ai_caption text,
  moderation_status text DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'rejected')),
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  house_id uuid REFERENCES houses(id),
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'house_only', 'members_only', 'private')),
  is_featured boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  tags text[],
  location text,
  event_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Post likes
CREATE TABLE IF NOT EXISTS post_likes (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id),
  content text NOT NULL,
  reply_to uuid REFERENCES comments(id),
  likes_count integer DEFAULT 0,
  moderation_status text DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'deleted')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comment likes
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('post_like', 'post_comment', 'post_share', 'comment_like', 'message', 'application_update', 'role_change', 'house_invite', 'event_reminder', 'system')),
  title text NOT NULL,
  content text,
  related_id uuid,
  related_type text,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text CHECK (event_type IN ('Ball', 'Practice', 'Workshop', 'Competition', 'Social', 'Meeting', 'Performance')),
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  location text,
  address text,
  coordinates point,
  organizer_id uuid REFERENCES users(id),
  house_id uuid REFERENCES houses(id),
  is_public boolean DEFAULT true,
  max_participants integer,
  current_participants integer DEFAULT 0,
  ticket_price decimal(10,2),
  ticket_url text,
  status text DEFAULT 'upcoming' CHECK (status IN ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled')),
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Event participants
CREATE TABLE IF NOT EXISTS event_participants (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  status text DEFAULT 'registered' CHECK (status IN ('registered', 'attending', 'declined', 'waitlist')),
  registered_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- Subscriptions and payments
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  plan_type text NOT NULL CHECK (plan_type IN ('basic', 'premium', 'leader', 'admin')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  stripe_payment_intent_id text UNIQUE,
  amount integer NOT NULL, -- in cents
  currency text DEFAULT 'usd',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  payment_type text CHECK (payment_type IN ('subscription', 'one_time', 'donation')),
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Content moderation logs
CREATE TABLE IF NOT EXISTS moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('post', 'comment', 'message', 'document')),
  content_id uuid NOT NULL,
  user_id uuid REFERENCES users(id),
  moderator_id uuid REFERENCES users(id),
  action text NOT NULL CHECK (action IN ('flag', 'approve', 'reject', 'delete', 'warn')),
  reason text,
  ai_analysis jsonb,
  created_at timestamptz DEFAULT now()
);

-- User sessions for tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Analytics and metrics
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES users(id),
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_house_id ON users(house_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_house_id ON posts(house_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_access_level ON documents(access_level);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_house_id ON events(house_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_houses_updated_at BEFORE UPDATE ON houses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile and public profiles
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view public profiles" ON users FOR SELECT USING (status = 'active');

-- Posts policies
CREATE POLICY "Users can view approved posts" ON posts FOR SELECT USING (moderation_status = 'approved');
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);

-- Messages policies
CREATE POLICY "Users can view messages in their threads" ON messages FOR SELECT USING (
  thread_id IN (
    SELECT id FROM chat_threads 
    WHERE participants @> ARRAY[auth.uid()::text]
  )
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Documents policies
CREATE POLICY "Users can view documents based on access level" ON documents FOR SELECT USING (
  access_level = 'Applicant' OR 
  (access_level = 'Member' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Member', 'Leader', 'Admin'))) OR
  (access_level = 'Leader' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Leader', 'Admin'))) OR
  (access_level = 'Admin' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'))
);

-- Comments policies
CREATE POLICY "Users can view approved comments" ON comments FOR SELECT USING (moderation_status = 'approved');
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Insert default admin user and house
INSERT INTO houses (id, name, category, description) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'House of Basquiat',
  'Vogue Femme',
  'The founding house of the Haus of Basquiat community'
) ON CONFLICT (name) DO NOTHING;

-- Insert default admin user (password will be set via application)
INSERT INTO users (id, email, role, house_id, status, first_name, last_name, display_name)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@hausofbasquiat.com',
  'Admin',
  '00000000-0000-0000-0000-000000000001',
  'active',
  'Admin',
  'User',
  'Haus Admin'
) ON CONFLICT (email) DO NOTHING;