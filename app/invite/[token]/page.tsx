'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { use } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [invite, setInvite] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [noButtonStyle, setNoButtonStyle] = useState({});
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    const loadInvite = async () => {
      const { data } = await supabase.from('invites').select('*').eq('token', token).single();
      setInvite(data);
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
    alert('💔 Peccato... Forse la prossima volta? 💔');
    router.push('/');
  };

  // Il pulsante NO scappa quando il mouse si avvicina!
  const handleMouseEnter = () => {
    if (!noButtonRef.current) return;
    const container = noButtonRef.current.parentElement;
    if (container) {
      const maxX = container.clientWidth - noButtonRef.current.clientWidth - 20;
      const maxY = 150;
      const randomX = Math.random() * maxX;
      const randomY = Math.random() * maxY;
      setNoButtonStyle({
        position: 'absolute',
        left: `${randomX}px`,
        top: `${randomY}px`,
        transition: 'all 0.2s ease',
      });
    }
  };

  if (!invite) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center">
      <div className="text-2xl text-pink-600 animate-pulse">💕 Caricamento... 💕</div>
    </div>
  );

  if (invite.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-7xl mb-4">💔</div>
          <h2 className="text-3xl font-bold text-gray-600">Invito rifiutato</h2>
          <p className="text-gray-500 mt-3">L'invito è stato rifiutato. Peccato!</p>
        </div>
      </div>
    );
  }

  if (invite.status === 'accepted' || invite.status === 'confirmed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-purple-200 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center max-w-md border border-white/50">
          <div className="text-7xl mb-4 animate-bounce">🎉💕🎉</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Invito accettato!</h2>
          <p className="text-gray-600 mt-3">Hai già accettato questo invito. Preparati per il vostro appuntamento! 💑</p>
          {invite.chosen_datetime && (
            <div className="mt-4 p-3 bg-pink-100 rounded-xl">
              <p className="text-pink-600">📅 Data scelta:</p>
              <p className="font-semibold">{new Date(invite.chosen_datetime).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/50">
        {/* Animazione cuori */}
        <div className="text-7xl mb-4 animate-pulse">💌</div>
        
        <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
          {invite.inviter_name} {invite.inviter_surname}
        </h2>
        <p className="text-gray-500 mb-4 text-sm">{invite.inviter_email}</p>
        
        {invite.preference && (
          <div className="my-4 p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl">
            <p className="text-sm text-gray-500">🎭 Attività preferita:</p>
            <p className="text-xl font-semibold text-pink-600">{invite.preference}</p>
          </div>
        )}
        
        <div className="my-6">
          <p className="text-gray-700 text-lg">ti ha invitato per un appuntamento</p>
          <div className="text-3xl my-2">✨💑✨</div>
        </div>
        
        {showConfirm ? (
          <div className="space-y-3">
            <p className="text-gray-700">Sei proprio sicuro/a? 💔</p>
            <div className="flex gap-3">
              <button onClick={handleReject} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl transition">Sì, rifiuta</button>
              <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 py-3 rounded-xl transition">Annulla</button>
            </div>
          </div>
        ) : (
          <div className="relative flex justify-center gap-4" style={{ minHeight: '80px' }}>
            <button onClick={handleAccept} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-full text-xl transition transform hover:scale-105 shadow-lg">
              ✅ Sì, accetto
            </button>
            
            <button
              ref={noButtonRef}
              onMouseEnter={handleMouseEnter}
              onClick={() => setShowConfirm(true)}
              style={noButtonStyle}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-full transition cursor-pointer relative"
            >
              ❌ No
            </button>
          </div>
        )}
        
        {invite.opened && (
          <p className="text-xs text-gray-400 mt-6">
            ✅ Invito visualizzato il {new Date(invite.opened_at).toLocaleString()}
          </p>
        )}
        
        <div className="flex justify-center gap-1 mt-4 text-xl">
          <span>💕</span> <span>💘</span> <span>💖</span>
        </div>
      </div>
    </div>
  );
}
