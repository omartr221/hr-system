import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DemoLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-login with demo admin credentials
    login('admin', 'admin123')
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => setError('Demo login failed. Please try the regular login.'));
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-6">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
        <Brain className="w-8 h-8 text-white" />
      </div>
      {error ? (
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <a href="/login" className="text-blue-400 hover:underline">Go to Login</a>
        </div>
      ) : (
        <>
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-400 text-lg">Loading demo environment...</p>
        </>
      )}
    </div>
  );
}
