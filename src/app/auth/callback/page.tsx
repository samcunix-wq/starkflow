'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isConfigured } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    if (!isConfigured || !supabase) {
      router.push('/auth');
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/');
      } else {
        router.push('/auth');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[#00BFFF] animate-spin mx-auto mb-4" />
        <p className="text-[#6B7280]">Completing authentication...</p>
      </div>
    </div>
  );
}
