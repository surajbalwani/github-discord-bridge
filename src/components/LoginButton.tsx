'use client';

import { createClient } from '@/utils/supabase/client';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function LoginButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'repo', // Required to read and create webhooks on repos
      }
    });
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200 overflow-hidden backdrop-blur-md"
    >
      <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-[#5865F2]"></span>
      <span className="relative flex items-center gap-2">
        {loading ? 'Connecting to GitHub...' : 'Login with GitHub'}
        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
      </span>
    </button>
  );
}
