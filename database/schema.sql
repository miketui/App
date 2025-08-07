-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('Applicant', 'Member', 'Leader', 'Admin');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'banned');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'flagged');
CREATE TYPE thread_type AS ENUM ('direct', 'group');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file');
CREATE TYPE post_visibility AS ENUM ('public', 'house_only', 'members_only');
CREATE TYPE notification_type AS ENUM ('like', 'comment', 'message', 'application', 'system');

-- Houses/committees table
CREATE TABLE houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  leader_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Extended users table (extends auth.users)
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role user_role DEFAULT 'Applicant',
  house_id uuid REFERENCES houses(id),
  status user_status DEFAULT 'pending',
  display_name text,
  bio text,
  avatar_url text,
  phone text,
  date_of_birth date,
  pronouns text,
  ballroom_experience text,
  social_links jsonb DEFAULT '{}',
  profile_data jsonb DEFAULT '{}',
  login_code text UNIQUE,
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User applications
CREATE TABLE user_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  applicant_data jsonb NOT NULL,
  status application_status DEFAULT 'pending',
  review_notes text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES user_profiles(id)
);

-- Documents table
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  uploader_id uuid REFERENCES user_profiles(id) NOT NULL,
  access_level user_role DEFAULT 'Member',
  download_count integer DEFAULT 0,
  moderation_status moderation_status DEFAULT 'pending',
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document downloads tracking
CREATE TABLE document_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  downloaded_at timestamptz DEFAULT now()
);

-- Chat threads
CREATE TABLE chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  thread_type thread_type NOT NULL,
  participants uuid[],
  created_by uuid REFERENCES user_profiles(id),
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text,
  message_type message_type DEFAULT 'text',
  file_url text,
  reply_to uuid REFERENCES messages(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Message read receipts
CREATE TABLE message_reads (
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  thread_id uuid REFERENCES chat_threads(id) ON DELETE CASCADE,
  last_read_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, thread_id)
);

-- Posts
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text,
  media_urls text[],
  ai_caption text,
  moderation_status moderation_status DEFAULT 'pending',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  house_id uuid REFERENCES houses(id),
  visibility post_visibility DEFAULT 'public',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Post likes
CREATE TABLE post_likes (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- Comments
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  reply_to uuid REFERENCES comments(id),
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comment likes
CREATE TABLE comment_likes (
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

-- Notifications
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  content text,
  related_id uuid,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Subscriptions and payments
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text NOT NULL,
  price_id text NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for house leader
ALTER TABLE houses ADD CONSTRAINT fk_houses_leader 
  FOREIGN KEY (leader_id) REFERENCES user_profiles(id);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_house ON user_profiles(house_id);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_uploader ON documents(uploader_id);
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_house ON posts(house_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read_at);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User profiles: Users can read all profiles but only update their own
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User applications: Users can only see their own applications, admins can see all
CREATE POLICY "Users can view own applications" ON user_applications FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin')
);
CREATE POLICY "Users can create applications" ON user_applications FOR INSERT WITH CHECK (user_id = auth.uid());

-- Documents: Role-based access
CREATE POLICY "Users can view documents based on access level" ON documents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (
      CASE 
        WHEN documents.access_level = 'Admin' THEN role = 'Admin'
        WHEN documents.access_level = 'Leader' THEN role IN ('Admin', 'Leader')
        ELSE role IN ('Admin', 'Leader', 'Member')
      END
    )
  )
);
CREATE POLICY "Admins can upload documents" ON documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- Posts: Users can see public posts and house posts if they're members
CREATE POLICY "Users can view posts" ON posts FOR SELECT USING (
  visibility = 'public' OR
  (visibility = 'members_only' AND EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Member', 'Leader', 'Admin')
  )) OR
  (visibility = 'house_only' AND EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND house_id = posts.house_id
  )) OR
  author_id = auth.uid()
);
CREATE POLICY "Members can create posts" ON posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Member', 'Leader', 'Admin'))
);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (author_id = auth.uid());

-- Messages: Users can only see messages in threads they participate in
CREATE POLICY "Users can view messages in their threads" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_threads 
    WHERE id = thread_id AND auth.uid() = ANY(participants)
  )
);
CREATE POLICY "Users can send messages to their threads" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_threads 
    WHERE id = thread_id AND auth.uid() = ANY(participants)
  )
);

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_houses_updated_at BEFORE UPDATE ON houses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_chat_threads_updated_at BEFORE UPDATE ON chat_threads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update post counts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_likes_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_comments_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Plagiarism checks table
CREATE TABLE plagiarism_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id TEXT UNIQUE NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  results JSONB,
  similarity_score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for plagiarism_checks
CREATE INDEX idx_plagiarism_checks_scan_id ON plagiarism_checks(scan_id);
CREATE INDEX idx_plagiarism_checks_document_id ON plagiarism_checks(document_id);
CREATE INDEX idx_plagiarism_checks_user_id ON plagiarism_checks(user_id);
CREATE INDEX idx_plagiarism_checks_created_at ON plagiarism_checks(created_at);

-- Enable RLS for plagiarism_checks
ALTER TABLE plagiarism_checks ENABLE ROW LEVEL SECURITY;

-- RLS policies for plagiarism_checks
CREATE POLICY "Admins and Leaders can view all plagiarism checks" ON plagiarism_checks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Admin', 'Leader'))
  );

CREATE POLICY "System can insert plagiarism checks" ON plagiarism_checks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update plagiarism checks" ON plagiarism_checks
  FOR UPDATE USING (true);

-- Insert default houses
INSERT INTO houses (name, category, description) VALUES
('House of Eleganza', 'Ballroom', 'Celebrating grace, poise, and sophisticated performance'),
('House of Avant-Garde', 'Ballroom', 'Pushing boundaries with innovative and artistic expression'),
('House of Butch Realness', 'Ballroom', 'Authentic masculine presentation and energy'),
('House of Femme', 'Ballroom', 'Celebrating feminine beauty and presentation'),
('House of Bizarre', 'Ballroom', 'Unique, unconventional, and extraordinary performances'),
('Leadership Committee', 'Administrative', 'Community leaders and organizers'),
('Events Committee', 'Administrative', 'Event planning and coordination'),
('Mentorship Committee', 'Administrative', 'New member guidance and support');