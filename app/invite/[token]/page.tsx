'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function InvitePage({ params }: { params: { token: string } }) {
  const [invite, setInvite] = useState<any>(null);
  const [noMessage, setNoMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    supabase.from('invites').select('*').eq('token', params.token).single().then(({ data }) => setInvite(data));
  }, [params.token]);

  const handleYes = async () => {
    await supabase.from('invites').update({ status: 'accepted' }).eq('token', params.token);
    router.push(`/confirm/${params.token}`);
  };

  const handleNo = () => {
    const messages = ['😢 Davvero?', '💔 Ripensaci...', '🌸 Ci stai scappando?', '🎈 Ti do un\'altra chance...', '☕️ Magari un caffè prima di dire no?', '🌟 Il pulsante si è spaventato!'];
    setNoMessage(messages[Math.floor(Math.random() * messages.length)]);
    setTimeout(() => setNoMessage(''), 1500);
  };

  if (!invite) return <div className="text-center p-8">⏳ Caricamento...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl mb-2">💌</h1>
        <h2 className="text-2xl font-bold text-pink-600">{invite.inviter_name} {invite.inviter_surname}</h2>
        <p className="text-gray-600 mb-2">{invite.inviter_email}</p>
        <p className="text-gray-700 my-6">ti ha invitato per un appuntamento ✨</p>
        <div className="relative flex justify-center gap-6 mt-4" style={{ minHeight: '80px' }}>
          <button onClick={handleYes} className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full text-xl transition">✅ Sì</button>
          <button onMouseEnter={(e) => { const btn = e.currentTarget; const container = btn.parentElement; if (container) { const maxX = container.clientWidth - btn.clientWidth - 20; const maxY = 60; btn.style.position = 'absolute'; btn.style.left = `${Math.random() * maxX}px`; btn.style.top = `${Math.random() * maxY}px`; } }} onClick={handleNo} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-full transition cursor-pointer" style={{ position: 'relative' }}>❌ No</button>
        </div>
        {noMessage && <p className="text-pink-500 mt-4 animate-bounce">{noMessage}</p>}
      </div>
    </div>
  );
}
