'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Attività romantiche con emoji
const activities = [
  { emoji: '🍸', name: 'Aperitivo', color: 'bg-orange-100' },
  { emoji: '🍝', name: 'Pranzo', color: 'bg-yellow-100' },
  { emoji: '🍷', name: 'Cena', color: 'bg-red-100' },
  { emoji: '🎬', name: 'Cinema', color: 'bg-purple-100' },
  { emoji: '☕', name: 'Caffè', color: 'bg-amber-100' },
  { emoji: '🍦', name: 'Gelato', color: 'bg-pink-100' },
  { emoji: '🚶', name: 'Passeggiata', color: 'bg-green-100' },
  { emoji: '🎨', name: 'Mostra', color: 'bg-blue-100' },
  { emoji: '🌅', name: 'Tramonto', color: 'bg-orange-100' },
  { emoji: '🎲', name: 'Sorpresa', color: 'bg-purple-100' },
  { emoji: '✏️', name: 'Altro', color: 'bg-gray-100' },
];

export default function HomePage() {
  const [form, setForm] = useState({
    inviterName: '',
    inviterSurname: '',
    inviterEmail: '',
    recipientEmail: '',
    dates: [''],
    selectedActivity: '',
    customActivity: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const addDate = () => setForm({ ...form, dates: [...form.dates, ''] });
  const removeDate = (index: number) => {
    if (form.dates.length > 1) {
      const newDates = [...form.dates];
      newDates.splice(index, 1);
      setForm({ ...form, dates: newDates });
    }
  };
  const updateDate = (index: number, value: string) => {
    const newDates = [...form.dates];
    newDates[index] = value;
    setForm({ ...form, dates: newDates });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInviteLink('');

    const validDates = form.dates.filter(d => d !== '');
    if (validDates.length === 0) {
      alert('💕 Inserisci almeno una data disponibile!');
      setLoading(false);
      return;
    }

    const finalActivity = form.selectedActivity === 'Altro' 
      ? form.customActivity 
      : form.selectedActivity;

    const token = crypto.randomUUID();
    const datesToSave = validDates.map(d => ({ datetime: d }));

    const { error: dbError } = await supabase.from('invites').insert({
      token: token,
      inviter_name: form.inviterName,
      inviter_surname: form.inviterSurname,
      inviter_email: form.inviterEmail,
      recipient_email: form.recipientEmail,
      dates: datesToSave,
      status: 'pending',
      preference: finalActivity || null,
    });

    if (dbError) {
      alert('❌ Errore: ' + dbError.message);
      setLoading(false);
      return;
    }

    const link = `${window.location.origin}/invite/${token}`;
    setInviteLink(link);
    alert('✨ Invito creato! Copia il link qui sotto e condividilo con la persona speciale ✨');

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-purple-200 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-3 animate-pulse">💕✨💕</div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">TwoofUs</h1>
          <p className="text-gray-600 mt-3 text-lg">Crea un invito speciale per il tuo amore ❤️</p>
          <div className="flex justify-center gap-2 mt-4">
            <span className="text-2xl">💑</span>
            <span className="text-2xl">💘</span>
            <span className="text-2xl">💖</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome e Cognome */}
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-pink-500 transition">📝 Nome *</label>
                <input type="text" required className="w-full border border-gray-200 rounded-xl p-3 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition outline-none" value={form.inviterName} onChange={(e) => setForm({...form, inviterName: e.target.value})} placeholder="Mario" />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-pink-500 transition">📝 Cognome *</label>
                <input type="text" required className="w-full border border-gray-200 rounded-xl p-3 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition outline-none" value={form.inviterSurname} onChange={(e) => setForm({...form, inviterSurname: e.target.value})} placeholder="Rossi" />
              </div>
            </div>

            {/* Email */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-pink-500 transition">✉️ La tua email *</label>
              <input type="email" required className="w-full border border-gray-200 rounded-xl p-3 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition outline-none" value={form.inviterEmail} onChange={(e) => setForm({...form, inviterEmail: e.target.value})} placeholder="tuo@email.com" />
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-pink-500 transition">✉️ Email del destinatario *</label>
              <input type="email" required className="w-full border border-gray-200 rounded-xl p-3 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition outline-none" value={form.recipientEmail} onChange={(e) => setForm({...form, recipientEmail: e.target.value})} placeholder="amore@email.com" />
            </div>

            {/* Attività preferita */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🎭 Cosa ti piacerebbe fare? (opzionale)</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {activities.map((act) => (
                  <button
                    key={act.name}
                    type="button"
                    onClick={() => setForm({ ...form, selectedActivity: act.name, customActivity: act.name === 'Altro' ? form.customActivity : '' })}
                    className={`p-2 rounded-xl text-center transition-all ${form.selectedActivity === act.name ? 'bg-pink-500 text-white shadow-lg scale-105' : act.color + ' hover:scale-105'}`}
                  >
                    <div className="text-2xl">{act.emoji}</div>
                    <div className="text-xs mt-1">{act.name}</div>
                  </button>
                ))}
              </div>
              {form.selectedActivity === 'Altro' && (
                <input type="text" className="mt-3 w-full border border-gray-200 rounded-xl p-2 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none" placeholder="Scrivi la tua attività..." value={form.customActivity} onChange={(e) => setForm({...form, customActivity: e.target.value})} />
              )}
            </div>

            {/* Date disponibili */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📅 Date disponibili *</label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {form.dates.map((date, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="datetime-local" className="flex-1 border border-gray-200 rounded-xl p-2 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none" value={date} onChange={(e) => updateDate(idx, e.target.value)} />
                    {form.dates.length > 1 && (
                      <button type="button" onClick={() => removeDate(idx)} className="bg-rose-100 text-rose-500 px-3 rounded-xl hover:bg-rose-200 transition">🗑️</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addDate} className="text-pink-500 text-sm mt-2 hover:text-pink-600 transition flex items-center gap-1">➕ Aggiungi altra data</button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg">
              {loading ? '⏳ Creazione...' : '💌 Crea invito per la persona amata 💌'}
            </button>

            {/* Link generato */}
            {inviteLink && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <p className="text-green-700 font-medium flex items-center gap-2">✅ Invito creato con amore!</p>
                <p className="text-blue-600 text-sm break-all mt-2 font-mono bg-white/50 p-2 rounded-lg">{inviteLink}</p>
                <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="mt-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:scale-105 transition">📋 Copia link da condividere</button>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>💕 Condividi il link con la persona che ami 💕</p>
        </div>
      </div>
    </div>
  );
}
