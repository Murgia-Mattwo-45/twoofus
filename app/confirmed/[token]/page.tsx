'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { use } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ConfirmedPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [invite, setInvite] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.from('invites').select('*').eq('token', token).single().then(({ data }) => setInvite(data));
  }, [token]);

  if (!invite) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center">
      <div className="text-2xl text-pink-600 animate-pulse">💕 Caricamento... 💕</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/50">
        <div className="text-7xl mb-4 animate-bounce">🎉💕🎉</div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Appuntamento confermato!</h2>
        
        <div className="mt-6 p-4 bg-pink-100 rounded-xl">
          <p className="text-gray-600">📅 <strong>Data:</strong></p>
          <p className="text-lg font-semibold text-pink-600">{new Date(invite.chosen_datetime).toLocaleString()}</p>
          
          <p className="text-gray-600 mt-3">🎭 <strong>Attività:</strong></p>
          <p className="text-lg font-semibold text-pink-600">{invite.preference}</p>
        </div>
        
        <div className="mt-6 p-4 bg-amber-50 rounded-xl">
          <p className="text-gray-600">👫 <strong>Partecipanti:</strong></p>
          <p className="font-semibold">{invite.inviter_name} {invite.inviter_surname}</p>
          <p className="text-sm text-gray-500">{invite.inviter_email}</p>
          <p className="font-semibold mt-2">e</p>
          <p className="font-semibold">{invite.recipient_email}</p>
        </div>
        
        <button
          onClick={() => router.push('/')}
          className="mt-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-2 rounded-xl"
        >
          🏠 Torna alla home
        </button>
      </div>
    </div>
  );
}
