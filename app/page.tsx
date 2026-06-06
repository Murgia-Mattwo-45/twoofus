'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Lista attività con emoji
const activities = [
  { emoji: '🍸', name: 'Aperitivo' },
  { emoji: '🍝', name: 'Pranzo' },
  { emoji: '🍷', name: 'Cena' },
  { emoji: '🎬', name: 'Cinema' },
  { emoji: '☕', name: 'Caffè' },
  { emoji: '🍦', name: 'Gelato' },
  { emoji: '🚶', name: 'Passeggiata' },
  { emoji: '🎨', name: 'Mostra' },
  { emoji: '🌅', name: 'Tramonto' },
  { emoji: '🎲', name: 'Sorpresa' },
  { emoji: '✏️', name: 'Altro...' },
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
      alert('⚠️ Inserisci almeno una data!');
      setLoading(false);
      return;
    }

    const finalActivity = form.selectedActivity === 'Altro...' 
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
    alert('✅ Invito creato! Copia il link qui sotto e condividilo.');

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-2">✨💕✨</div>
          <h1 className="text-4xl font-bold text-pink-600">TwoofUs</h1>
          <p className="text-gray-500 mt-2">Crea un invito speciale per il tuo amore ❤️</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome e Cognome */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📝 Nome *</label>
                <input type="text" required className="w-full border rounded-xl p-3" value={form.inviterName} onChange={(e) => setForm({...form, inviterName: e.target.value})} placeholder="Mario" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📝 Cognome *</label>
                <input type="text" required className="w-full border rounded-xl p-3" value={form.inviterSurname} onChange={(e) => setForm({...form, inviterSurname: e.target.value})} placeholder="Rossi" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">✉️ La tua email *</label>
              <input type="email" required className="w-full border rounded-xl p-3" value={form.inviterEmail} onChange={(e) => setForm({...form, inviterEmail: e.target.value})} placeholder="tuo@email.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">✉️ Email del destinatario *</label>
              <input type="email" required className="w-full border rounded-xl p-3" value={form.recipientEmail} onChange={(e) => setForm({...form, recipientEmail: e.target.value})} placeholder="amore@email.com" />
            </div>

            {/* Attività preferita */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🎭 Attività preferita (opzionale)</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {activities.map((act) => (
                  <button
                    key={act.name}
                    type="button"
                    onClick={() => setForm({ ...form, selectedActivity: act.name, customActivity: act.name === 'Altro...' ? form.customActivity : '' })}
                    className={`p-2 rounded-xl text-center transition ${form.selectedActivity === act.name ? 'bg-pink-500 text-white' : 'bg-pink-50 hover:bg-pink-100'}`}
                  >
                    <div className="text-2xl">{act.emoji}</div>
                    <div className="text-xs mt-1">{act.name}</div>
                  </button>
                ))}
              </div>
              {form.selectedActivity === 'Altro...' && (
                <input type="text" className="mt-3 w-full border rounded-xl p-2" placeholder="Scrivi la tua attività..." value={form.customActivity} onChange={(e) => setForm({...form, customActivity: e.target.value})} />
              )}
            </div>

            {/* Date disponibili */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📅 Date disponibili *</label>
              {form.dates.map((date, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input type="datetime-local" className="flex-1 border rounded-xl p-2" value={date} onChange={(e) => updateDate(idx, e.target.value)} />
                  {form.dates.length > 1 && <button type="button" onClick={() => removeDate(idx)} className="bg-red-100 text-red-600 px-3 rounded-xl">🗑️</button>}
                </div>
              ))}
              <button type="button" onClick={addDate} className="text-pink-500 text-sm mt-1">+ Aggiungi altra data</button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl transition">
              {loading ? '⏳ Creazione...' : '💌 Crea invito'}
            </button>

            {/* Link generato */}
            {inviteLink && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl">
                <p className="text-green-700 font-medium">✅ Invito creato!</p>
                <p className="text-blue-600 text-sm break-all mt-1">{inviteLink}</p>
                <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm">📋 Copia link</button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
