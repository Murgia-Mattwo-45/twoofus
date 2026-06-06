'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AddPage() {
  const [form, setForm] = useState({
    inviterName: '',
    inviterSurname: '',
    inviterEmail: '',
    recipientEmail: '',
    dates: [''],
  });
  
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const addDate = () => {
    setForm({ ...form, dates: [...form.dates, ''] });
  };

  const removeDate = (index: number) => {
    if (form.dates.length > 1) {
      const newDates = [...form.dates];
      newDates.splice(index, 1);
      setForm({ ...form, dates: newDates });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInviteLink('');

    const validDates = form.dates.filter(d => d !== '');
    if (validDates.length === 0) {
      alert('⚠️ Inserisci almeno una data disponibile!');
      setLoading(false);
      return;
    }

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
    });

    if (dbError) {
      alert('❌ Errore: ' + dbError.message);
      setLoading(false);
      return;
    }

    const link = `https://twoofus.vercel.app/invite/${token}`;
    setInviteLink(link);

    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: form.recipientEmail,
          subject: `📅 ${form.inviterName} ${form.inviterSurname} ti ha invitato!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #ec4899;">✨ TwoofUs ✨</h1>
              <p><strong>${form.inviterName} ${form.inviterSurname}</strong> (${form.inviterEmail}) ti ha invitato per un appuntamento.</p>
              <a href="${link}" style="display: inline-block; background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">📅 Rispondi all'invito</a>
            </div>
          `,
        }),
      });
      alert('✅ Invito creato e inviato!');
    } catch (emailError) {
      alert('⚠️ Invito creato! Link: ' + link);
    }

    setLoading(false);
  };

  const updateDate = (index: number, value: string) => {
    const newDates = [...form.dates];
    newDates[index] = value;
    setForm({ ...form, dates: newDates });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-2">✨ TwoofUs ✨</h1>
        <p className="text-center text-gray-500 mb-8">Crea un invito speciale per qualcuno che ti piace 💕</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input type="text" required className="w-full border rounded-lg p-3" value={form.inviterName} onChange={(e) => setForm({...form, inviterName: e.target.value})} placeholder="Mario" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
              <input type="text" required className="w-full border rounded-lg p-3" value={form.inviterSurname} onChange={(e) => setForm({...form, inviterSurname: e.target.value})} placeholder="Rossi" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">La tua email *</label>
            <input type="email" required className="w-full border rounded-lg p-3" value={form.inviterEmail} onChange={(e) => setForm({...form, inviterEmail: e.target.value})} placeholder="mario@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email del destinatario *</label>
            <input type="email" required className="w-full border rounded-lg p-3" value={form.recipientEmail} onChange={(e) => setForm({...form, recipientEmail: e.target.value})} placeholder="persona@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date disponibili *</label>
            <div className="space-y-2">
              {form.dates.map((date, idx) => (
                <div key={idx} className="flex gap-2">
                  <input type="datetime-local" className="flex-1 border rounded-lg p-2" value={date} onChange={(e) => updateDate(idx, e.target.value)} />
                  {form.dates.length > 1 && (<button type="button" onClick={() => removeDate(idx)} className="bg-red-100 text-red-600 px-3 rounded-lg hover:bg-red-200">🗑️</button>)}
                </div>
              ))}
            </div>
            <button type="button" onClick={addDate} className="mt-2 text-pink-500 text-sm hover:underline">+ Aggiungi altra data</button>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-lg">{loading ? '⏳ Creazione...' : '💌 Crea invito e invia email'}</button>
          {inviteLink && (<div className="mt-4 p-3 bg-green-50 rounded-lg"><p className="text-green-700 text-sm break-all">✅ Link: <a href={inviteLink} target="_blank" className="underline">{inviteLink}</a></p></div>)}
        </form>
      </div>
    </div>
  );
}
