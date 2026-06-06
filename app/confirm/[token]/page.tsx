'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const preferences = [
  { emoji: '🍸', name: 'Aperitivo' }, { emoji: '🍝', name: 'Pranzo' }, { emoji: '🍷', name: 'Cena' },
  { emoji: '🎬', name: 'Cinema' }, { emoji: '☕', name: 'Caffè/tè' }, { emoji: '🍦', name: 'Gelato' },
  { emoji: '🚶', name: 'Passeggiata' }, { emoji: '🖼️', name: 'Mostra' }, { emoji: '🌅', name: 'Tramonto' }, { emoji: '🎲', name: 'Sorpresa' }
];

export default function ConfirmPage({ params }: { params: { token: string } }) {
  const [invite, setInvite] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPref, setSelectedPref] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.from('invites').select('*').eq('token', params.token).single().then(({ data }) => setInvite(data));
  }, [params.token]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedPref) { alert('Scegli una data e una preferenza!'); return; }
    setLoading(true);
    await supabase.from('invites').update({ status: 'confirmed', chosen_datetime: selectedDate, preference: selectedPref }).eq('token', params.token);
    const bothEmails = [invite.inviter_email, invite.recipient_email];
    for (const email of bothEmails) {
      await fetch('/api/send-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, subject: '🎉 Appuntamento confermato!', html: `<div><h1 style="color:#ec4899">✨ TwoofUs ✨</h1><p><strong>${invite.inviter_name} ${invite.inviter_surname}</strong> e <strong>${invite.recipient_email}</strong></p><p>🗓️ Quando: <strong>${new Date(selectedDate).toLocaleString()}</strong></p><p>🎭 Preferenza: <strong>${selectedPref}</strong></p><p>💕 Buon appuntamento!</p></div>` }),
      });
    }
    alert('✅ Appuntamento confermato!');
    router.push('/');
  };

  if (!invite) return <div className="text-center p-8">⏳ Caricamento...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">✨ Scegli il vostro momento ✨</h1>
        <div className="mb-8"><h2 className="text-xl font-semibold mb-3">🗓️ Scegli una data:</h2><div className="grid gap-2">{(invite.dates || []).map((d: any, idx: number) => (<button key={idx} onClick={() => setSelectedDate(d.datetime)} className={`p-3 rounded-lg text-left transition ${selectedDate === d.datetime ? 'bg-pink-500 text-white' : 'bg-pink-50 hover:bg-pink-100'}`}>{new Date(d.datetime).toLocaleString()}</button>))}</div></div>
        <div className="mb-8"><h2 className="text-xl font-semibold mb-3">🎭 Hai una preferenza?</h2><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{preferences.map((pref) => (<button key={pref.name} onClick={() => setSelectedPref(pref.name)} className={`p-3 rounded-xl text-center transition ${selectedPref === pref.name ? 'bg-pink-500 text-white' : 'bg-gray-100 hover:bg-pink-100'}`}><span className="text-2xl block">{pref.emoji}</span>{pref.name}</button>))}</div></div>
        <button onClick={handleConfirm} disabled={loading || !selectedDate || !selectedPref} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-lg disabled:opacity-50">{loading ? '⏳ Confermo...' : '💖 Conferma appuntamento'}</button>
      </div>
    </div>
  );
}
