import React, { useState } from 'react';
import { useAuth } from './AuthContext';

function PostForm({ onPost }) {
  const { supabase } = useAuth();
  const [content, setContent] = useState('');
  const [caption, setCaption] = useState('');
  const [loadingCaption, setLoadingCaption] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const suggestCaption = async () => {
    if (!content) return;
    setLoadingCaption(true);
    setError('');
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/ai/generate-caption`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabase.auth.session()?.access_token}`
      },
      body: JSON.stringify({ content, mediaType: 'text' })
    });
    if (res.ok) {
      const { caption } = await res.json();
      setCaption(caption);
    } else {
      setError('Error generating caption');
    }
    setLoadingCaption(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content) return;
    setSubmitting(true);
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabase.auth.session()?.access_token}`
      },
      body: JSON.stringify({ content, ai_caption: caption })
    });
    if (res.ok) {
      const post = await res.json();
      onPost && onPost(post);
      setContent('');
      setCaption('');
    } else {
      setError('Error posting');
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-white shadow">
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share something with the community..."
        className="w-full p-2 border rounded mb-2"
        rows={3}
      />
      {caption && <p className="italic text-gray-700 mb-2">Suggested caption: {caption}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={suggestCaption}
          disabled={loadingCaption || !content}
          className="px-3 py-1 border rounded"
        >
          {loadingCaption ? 'Generating...' : 'Suggest Caption'}
        </button>
        <button
          type="submit"
          disabled={submitting || !content}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}

export default PostForm;