'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { use } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const preferences = [
  { emoji: '🍸', name: 'Aperitivo' },
  { emoji: '🍝', name: 'Pranzo' },
  { emoji: '🍷', name: 'Cena' },
  { emoji: '🎬', name: 'Cinema' },
  { emoji: '☕', name: 'Caffè/tè' },
  { emoji: '🍦', name: 'Gelato' },
  { emoji: '🚶', name: 'Passeggiata' },
  { emoji: '🖼️', name: 'Mostra' },
  { emoji: '🌅', name: 'Tramonto' },
  { emoji: '🎲', name: 'Sorpresa' },
];

export default function ConfirmPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [invite, setInvite] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmationLink, setConfirmationLink] = useState('');
  const router = useRouter();

  useEffect(() => {
    supabase.from('invites').select('*').eq('token', token).single().then(({ data }) => setInvite(data));
  }, [token]);

  const togglePreference = (prefName: string) => {
    if (selectedPrefs.includes(prefName)) {
      setSelectedPrefs(selectedPrefs.filter(p => p !== prefName));
    } else {
      setSelectedPrefs([...selectedPrefs, prefName]);
    }
  };

  const handleConfirm = async () => {
    if (!selectedDate) {
      alert('📅 Scegli una data!');
      return;
    }
    if (selectedPrefs.length === 0) {
      alert('🎭 Scegli almeno una preferenza!');
      return;
    }

    setLoading(true);
    
    // Aggiorna l'invito con la scelta
    await supabase.from('invites').update({
      status: 'confirmed',
      chosen_datetime: selectedDate,
      preference: selectedPrefs.join(', '),
    }).eq('token', token);

    // Genera link di conferma da condividere
    const link = `${window.location.origin}/confirmed/${token}`;
    setConfirmationLink(link);
    
    setLoading(false);
  };

  if (!invite) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center">
      <div className="text-2xl text-pink-600 animate-pulse">💕 Caricamento... 💕</div>
    </div>
  );

  // Se già confermato, mostra il link
  if (invite.status === 'confirmed') {
    const shareLink = `${window.location.origin}/confirmed/${token}`;
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-purple-200 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/50">
          <div className="text-7xl mb-4 animate-bounce">🎉💕🎉</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Appuntamento confermato!</h2>
          
          <div className="mt-4 p-3 bg-pink-100 rounded-xl">
            <p className="text-pink-600">📅 Data scelta:</p>
            <p className="font-semibold">{new Date(invite.chosen_datetime).toLocaleString()}</p>
            <p className="text-pink-600 mt-2">🎭 Attività scelta:</p>
            <p className="font-semibold">{invite.preference}</p>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <p className="text-green-700 font-medium">🔗 Link di conferma</p>
            <p className="text-blue-600 text-sm break-all mt-2 font-mono bg-white/50 p-2 rounded-lg">{shareLink}</p>
            <button
              onClick={() => navigator.clipboard.writeText(shareLink)}
              className="mt-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition"
            >
              📋 Copia link da condividere
            </button>
            <p className="text-xs text-gray-500 mt-2">
              💡 Manda questo link a {invite.inviter_name} per confermare l'appuntamento!
            </p>
          </div>
          
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-pink-500 underline"
          >
            ← Torna alla home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-purple-200 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/50">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent mb-6">
          ✨ Scegli il vostro momento ✨
        </h1>
        
        <p className="text-center text-gray-600 mb-4">
          {invite.inviter_name} {invite.inviter_surname} ti ha invitato:
        </p>
        
        {/* Selezione data */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">📅 Scegli una data <span className="text-sm text-gray-500">(obbligatorio)</span></h2>
          <div className="grid gap-2">
            {(invite.dates || []).map((d: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedDate(d.datetime)}
                className={`p-3 rounded-xl text-left transition-all ${selectedDate === d.datetime ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg' : 'bg-pink-50 hover:bg-pink-100'}`}
              >
                📅 {new Date(d.datetime).toLocaleString()}
              </button>
            ))}
          </div>
        </div>
        
        {/* Selezione preferenze multiple */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">🎭 Cosa ti piacerebbe fare? <span className="text-sm text-gray-500">(puoi sceglierne più di una ✅)</span></h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {preferences.map((pref) => (
              <button
                key={pref.name}
                type="button"
                onClick={() => togglePreference(pref.name)}
                className={`p-3 rounded-xl text-center transition-all ${selectedPrefs.includes(pref.name) ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg scale-105' : 'bg-white/80 hover:bg-pink-50 border border-pink-100'}`}
              >
                <div className="text-2xl">{pref.emoji}</div>
                <div className="text-xs mt-1">{pref.name}</div>
              </button>
            ))}
          </div>
          
          {selectedPrefs.length > 0 && (
            <div className="mt-4 p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl">
              <p className="text-sm text-gray-500">📝 Le tue scelte:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedPrefs.map(p => (
                  <span key={p} className="bg-pink-200 text-pink-800 px-2 py-1 rounded-full text-sm">✅ {p}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Pulsanti */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleConfirm}
            disabled={loading || !selectedDate || selectedPrefs.length === 0}
            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? '⏳ Confermo...' : '💖 Conferma appuntamento 💖'}
          </button>
        </div>

        {/* Link generato dopo conferma */}
        {confirmationLink && !loading && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <p className="text-green-700 font-medium">✅ Appuntamento confermato!</p>
            <p className="text-blue-600 text-sm break-all mt-2 font-mono bg-white/50 p-2 rounded-lg">{confirmationLink}</p>
            <button
              onClick={() => navigator.clipboard.writeText(confirmationLink)}
              className="mt-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition"
            >
              📋 Copia link da condividere
            </button>
            <p className="text-xs text-gray-500 mt-2">
              💡 Manda questo link a {invite.inviter_name} per confermare l'appuntamento!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
