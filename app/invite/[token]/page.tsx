'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ⚠️ IMPORTANTE: In Next.js 16, params deve essere unwrapped con React.use()
import { use } from 'react';

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  // Unwrap params con React.use()
  const { token } = use(params);
  
  const [invite, setInvite] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadInvite = async () => {
      const { data } = await supabase.from('invites').select('*').eq('token', token).single();
      setInvite(data);
      // Registra che l'invito è stato aperto
      if (data && !data.opened) {
        await supabase.from('invites').update({ opened: true, opened_at: new Date().toISOString() }).eq('token', token);
      }
    };
    loadInvite();
  }, [token]);

  const handleAccept = async () => {
    await supabase.from('invites').update({ status: 'accepted' }).eq('token', token);
    router.push(`/confirm/${token}`);
  };

  const handleReject = async () => {
    await supabase.from('invites').update({ status: 'rejected' }).eq('token', token);
    setShowConfirm(false);
    alert('💔 Hai rifiutato l\'invito. Peccato!');
    router.push('/');
  };

  if (!invite) return <div className="text-center p-8">⏳ Caricamento...</div>;

  if (invite.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-2xl font-bold text-gray-600">Invito rifiutato</h2>
          <p className="text-gray-500 mt-2">Questo invito è stato rifiutato.</p>
        </div>
      </div>
    );
  }

  if (invite.status === 'accepted' || invite.status === 'confirmed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-pink-600">Invito accettato!</h2>
          <p className="text-gray-600 mt-2">Hai già accettato questo invito.</p>
          {invite.chosen_datetime && <p className="text-gray-500 mt-4">Data scelta: {new Date(invite.chosen_datetime).toLocaleString()}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">💌</div>
        <h2 className="text-2xl font-bold text-pink-600">{invite.inviter_name} {invite.inviter_surname}</h2>
        <p className="text-gray-600 mb-2">{invite.inviter_email}</p>
        
        {invite.preference && (
          <div className="my-4 p-3 bg-pink-50 rounded-xl">
            <p className="text-sm text-gray-500">Attività preferita:</p>
            <p className="text-lg font-semibold text-pink-600">{invite.preference}</p>
          </div>
        )}
        
        <p className="text-gray-700 my-6">ti ha invitato per un appuntamento ✨</p>
        
        {showConfirm ? (
          <div className="space-y-3">
            <p className="text-gray-700">Sei sicuro di voler rifiutare? 💔</p>
            <div className="flex gap-3">
              <button onClick={handleReject} className="flex-1 bg-red-500 text-white py-2 rounded-xl">Sì, rifiuta</button>
              <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-300 py-2 rounded-xl">Annulla</button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <button onClick={handleAccept} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-lg transition">✅ Accetta</button>
            <button onClick={() => setShowConfirm(true)} className="flex-1 bg-red-400 hover:bg-red-500 text-white py-3 rounded-xl text-lg transition">❌ Rifiuta</button>
          </div>
        )}
        
        {invite.opened && (
          <p className="text-xs text-gray-400 mt-4">✅ Invito visualizzato il {new Date(invite.opened_at).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}
