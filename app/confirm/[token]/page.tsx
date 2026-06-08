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
  { emoji: '✏️', name: 'Altro...' },
];

export default function ConfirmPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [invite, setInvite] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [customPref, setCustomPref] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
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
      alert('📅 Scegli almeno una data!');
      return;
    }
    if (selectedPrefs.length === 0 && !customPref) {
      alert('🎭 Scegli almeno una preferenza!');
      return;
    }

    const finalPrefs = [...selectedPrefs];
    if (customPref) finalPrefs.push(customPref);

    setLoading(true);
    await supabase.from('invites').update({
      status: 'confirmed',
      chosen_datetime: selectedDate,
      preference: finalPrefs.join(', '), // Salva come "Aperitivo, Cinema, Cena"
    }).eq('token', token);

    // Genera link di conferma da condividere (opzionale)
    const confirmationLink = `${window.location.origin}/confirmed/${token}`;
    setGeneratedLink(confirmationLink);
    
    alert('✅ Appuntamento confermato! Copia il link qui sotto se vuoi condividerlo.');
    setLoading(false);
  };

  if (!invite) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center">
      <div className="text-2xl text-pink-600 animate-pulse">💕 Caricamento... 💕</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-purple-200 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/50">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent mb-6">
          ✨ Scegli il vostro momento ✨
        </h1>
        
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
        
        {/* Selezione preferenze MULTIPLA */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">🎭 Cosa ti piacerebbe fare? <span className="text-sm text-gray-500">(puoi sceglierne più di una ✅)</span></h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {preferences.map((pref) => (
              <button
                key={pref.name}
                type="button"
                onClick={() => {
                  if (pref.name === 'Altro...') {
                    setShowCustomInput(!showCustomInput);
                  } else {
                    togglePreference(pref.name);
                  }
                }}
                className={`p-3 rounded-xl text-center transition-all ${selectedPrefs.includes(pref.name) ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg scale-105' : 'bg-white/80 hover:bg-pink-50 border border-pink-100'}`}
              >
                <div className="text-2xl">{pref.emoji}</div>
                <div className="text-xs mt-1">{pref.name}</div>
                {selectedPrefs.includes(pref.name) && <div className="text-green-300 text-xs mt-1">✅</div>}
              </button>
            ))}
          </div>
          
          {showCustomInput && (
            <input
              type="text"
              className="mt-3 w-full border border-pink-200 rounded-xl p-3 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none"
              placeholder="Scrivi la tua attività..."
              value={customPref}
              onChange={(e) => setCustomPref(e.target.value)}
            />
          )}
          
          {/* Riepilogo preferenze selezionate */}
          {(selectedPrefs.length > 0 || customPref) && (
            <div className="mt-4 p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl">
              <p className="text-sm text-gray-500">📝 Le tue preferenze:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedPrefs.map(p => (
                  <span key={p} className="bg-pink-200 text-pink-800 px-2 py-1 rounded-full text-sm">✅ {p}</span>
                ))}
                {customPref && (
                  <span className="bg-rose-200 text-rose-800 px-2 py-1 rounded-full text-sm">✅ {customPref}</span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Pulsante conferma */}
        <button
          onClick={handleConfirm}
          disabled={loading || !selectedDate || (selectedPrefs.length === 0 && !customPref)}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:scale-100"
        >
          {loading ? '⏳ Confermo...' : '💖 Conferma appuntamento 💖'}
        </button>

        {/* Link generato per la risposta */}
        {generatedLink && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <p className="text-green-700 font-medium flex items-center gap-2">🔗 Link di conferma generato!</p>
            <p className="text-blue-600 text-sm break-all mt-2 font-mono bg-white/50 p-2 rounded-lg">{generatedLink}</p>
            <button
              onClick={() => navigator.clipboard.writeText(generatedLink)}
              className="mt-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition"
            >
              📋 Copia link da condividere
            </button>
            <p className="text-xs text-gray-500 mt-2">
              💡 Puoi condividere questo link con l'invitante per confermare l'appuntamento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
