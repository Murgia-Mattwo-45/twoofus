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
  const [mode, setMode] = useState<'choose' | 'counter'>('choose');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [counterDates, setCounterDates] = useState<string[]>(['']);
  const [counterPrefs, setCounterPrefs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [counterLink, setCounterLink] = useState('');
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

  const toggleCounterPref = (prefName: string) => {
    if (counterPrefs.includes(prefName)) {
      setCounterPrefs(counterPrefs.filter(p => p !== prefName));
    } else {
      setCounterPrefs([...counterPrefs, prefName]);
    }
  };

  const addCounterDate = () => setCounterDates([...counterDates, '']);
  const removeCounterDate = (index: number) => {
    if (counterDates.length > 1) {
      const newDates = [...counterDates];
      newDates.splice(index, 1);
      setCounterDates(newDates);
    }
  };
  const updateCounterDate = (index: number, value: string) => {
    const newDates = [...counterDates];
    newDates[index] = value;
    setCounterDates(newDates);
  };

  // Accetta le date originali
  const handleAccept = async () => {
    if (!selectedDate) {
      alert('📅 Scegli una data!');
      return;
    }
    if (selectedPrefs.length === 0) {
      alert('🎭 Scegli almeno una preferenza!');
      return;
    }

    setLoading(true);
    await supabase.from('invites').update({
      status: 'confirmed',
      chosen_datetime: selectedDate,
      preference: selectedPrefs.join(', '),
    }).eq('token', token);

    alert('✅ Appuntamento confermato! Buon divertimento! 💕');
    router.push('/');
  };

  // Propone alternative (controdibattito)
  const handleCounter = async () => {
    const validDates = counterDates.filter(d => d !== '');
    if (validDates.length === 0) {
      alert('📅 Proponi almeno una data alternativa!');
      return;
    }
    if (counterPrefs.length === 0) {
      alert('🎭 Scegli almeno una preferenza alternativa!');
      return;
    }

    setLoading(true);
    
    // Crea un nuovo invito "di risposta"
    const newToken = crypto.randomUUID();
    const datesToSave = validDates.map(d => ({ datetime: d }));
    
    await supabase.from('invites').insert({
      token: newToken,
      inviter_name: invite.recipient_email.split('@')[0] || 'Il destinatario',
      inviter_surname: '',
      inviter_email: invite.recipient_email,
      recipient_email: invite.inviter_email,
      dates: datesToSave,
      status: 'pending',
      preference: counterPrefs.join(', '),
    });

    const newLink = `${window.location.origin}/invite/${newToken}`;
    setCounterLink(newLink);
    alert('✨ Proposta alternativa creata! Copia il link qui sotto e mandalo a chi ti ha invitato.');
    setLoading(false);
  };

  if (!invite) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center">
      <div className="text-2xl text-pink-600 animate-pulse">💕 Caricamento... 💕</div>
    </div>
  );

  if (invite.status === 'confirmed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-purple-200 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-7xl mb-4 animate-bounce">🎉💕🎉</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Appuntamento confermato!</h2>
          <p className="text-gray-600 mt-3">Hai già confermato questo appuntamento.</p>
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

  // Modalità scegli (accetta le date proposte)
  if (mode === 'choose') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-purple-200 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/50">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent mb-6">
            ✨ Scegli il vostro momento ✨
          </h1>
          
          <p className="text-center text-gray-600 mb-4">
            {invite.inviter_name} {invite.inviter_surname} ti ha proposto:
          </p>
          
          {/* Selezione data originale */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">📅 Date proposte:</h2>
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
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">🎭 Attività proposte <span className="text-sm text-gray-500">(puoi sceglierne più di una ✅)</span></h2>
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
          </div>
          
          {/* Pulsanti azione */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAccept}
              disabled={loading || !selectedDate || selectedPrefs.length === 0}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50"
            >
              ✅ Accetto la proposta
            </button>
            <button
              onClick={() => setMode('counter')}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02]"
            >
              🔄 Propongo alternative
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modalità "Propongo alternative" (controdibattito)
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/50">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-6">
          🔄 Proponi le tue alternative
        </h1>
        
        <p className="text-center text-gray-600 mb-6">
          Non ti vanno bene le date o le attività proposte?<br />
          Fai tu una controproposta!
        </p>
        
        {/* Nuove date proposte */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">📅 Le tue date alternative *</h2>
          {counterDates.map((date, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input type="datetime-local" className="flex-1 border border-gray-200 rounded-xl p-2" value={date} onChange={(e) => updateCounterDate(idx, e.target.value)} />
              {counterDates.length > 1 && (
                <button type="button" onClick={() => removeCounterDate(idx)} className="bg-rose-100 text-rose-500 px-3 rounded-xl">🗑️</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addCounterDate} className="text-amber-500 text-sm mt-1">+ Aggiungi altra data</button>
        </div>
        
        {/* Nuove attività proposte */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">🎭 Le tue attività alternative * <span className="text-sm text-gray-500">(puoi sceglierne più di una)</span></h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {preferences.map((pref) => (
              <button
                key={pref.name}
                type="button"
                onClick={() => toggleCounterPref(pref.name)}
                className={`p-3 rounded-xl text-center transition-all ${counterPrefs.includes(pref.name) ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-105' : 'bg-white/80 hover:bg-amber-50 border border-amber-100'}`}
              >
                <div className="text-2xl">{pref.emoji}</div>
                <div className="text-xs mt-1">{pref.name}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Riepilogo */}
        {(counterPrefs.length > 0) && (
          <div className="mt-4 p-3 bg-amber-50 rounded-xl mb-6">
            <p className="text-sm text-gray-500">📝 La tua proposta:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {counterPrefs.map(p => <span key={p} className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full text-sm">✅ {p}</span>)}
            </div>
          </div>
        )}
        
        {/* Pulsanti */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCounter}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl transition-all"
          >
            {loading ? '⏳ Creazione...' : '📤 Genera link e manda proposta'}
          </button>
          <button
            onClick={() => setMode('choose')}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 rounded-xl transition-all"
          >
            ← Torna indietro
          </button>
        </div>
        
        {/* Link generato per la controproposta */}
        {counterLink && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <p className="text-green-700 font-medium">✅ Controproposta creata!</p>
            <p className="text-blue-600 text-sm break-all mt-2 font-mono">{counterLink}</p>
            <button
              onClick={() => navigator.clipboard.writeText(counterLink)}
              className="mt-3 bg-green-500 text-white px-4 py-2 rounded-lg text-sm"
            >
              📋 Copia link da mandare a {invite.inviter_name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
