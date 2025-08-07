-- Create storage buckets for the application

-- Documents bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true);

-- Chat files bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-files', 'chat-files', true);

-- Posts media bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts-media', 'posts-media', true);

-- Set up storage policies

-- Documents bucket policies
CREATE POLICY "Authenticated users can view documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin')
  );

CREATE POLICY "Admins can update documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin')
  );

CREATE POLICY "Admins can delete documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'Admin')
  );

-- Chat files bucket policies
CREATE POLICY "Users can view chat files in their threads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-files' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can upload chat files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-files' AND
    auth.role() = 'authenticated'
  );

-- Posts media bucket policies
CREATE POLICY "All users can view post media" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts-media');

CREATE POLICY "Members can upload post media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'posts-media' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('Member', 'Leader', 'Admin'))
  );

CREATE POLICY "Users can update their own post media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'posts-media' AND
    owner = auth.uid()
  );

CREATE POLICY "Users can delete their own post media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'posts-media' AND
    owner = auth.uid()
  );