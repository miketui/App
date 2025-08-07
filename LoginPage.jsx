import React, { useState } from 'react';
import { useAuth } from './AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { signInWithEmail } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) return;
    const { error } = await signInWithEmail(email);
    if (!error) setSent(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-300">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        {sent ? (
          <p className="text-green-600">Check your email for a magic link to sign in!</p>
        ) : (
          <form onSubmit={handleLogin}>
            <h1 className="text-2xl font-bold mb-4 text-center">Sign in to Haus of Basquiat</h1>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 border rounded mb-4"
            />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send Magic Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
