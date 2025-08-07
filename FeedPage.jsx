import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import PostForm from './PostForm';

function FeedPage() {
  const { supabase } = useAuth();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/posts`, {
        headers: {
          Authorization: `Bearer ${supabase.auth.session()?.access_token}`
        }
      });
      if (res.ok) {
        const { posts } = await res.json();
        setPosts(posts);
      }
    };
    fetchPosts();
  }, [supabase]);

  const handleNewPost = (p) => setPosts([p, ...posts]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Community Feed</h1>
      <PostForm onPost={handleNewPost} />
      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p.id} className="p-4 border rounded bg-white shadow">
            <p>{p.content}</p>
            {p.ai_caption && <p className="italic text-gray-600 mt-2">{p.ai_caption}</p>}
            <p className="text-sm text-gray-400 mt-1">{new Date(p.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FeedPage;
