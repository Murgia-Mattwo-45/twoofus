'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
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

    const link = `${window.location.origin}/invite/${token}`;
    setInviteLink(link);
    alert('✅ Invito creato! Copia il link qui sotto e condividilo con il destinatario.');

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
        <p className="text-center text-gray-500 mb-8">Crea un invito speciale 💕</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" required placeholder="Nome" className="border rounded-lg p-3" value={form.inviterName} onChange={(e) => setForm({...form, inviterName: e.target.value})} />
            <input type="text" required placeholder="Cognome" className="border rounded-lg p-3" value={form.inviterSurname} onChange={(e) => setForm({...form, inviterSurname: e.target.value})} />
          </div>
          
          <input type="email" required placeholder="La tua email" className="w-full border rounded-lg p-3" value={form.inviterEmail} onChange={(e) => setForm({...form, inviterEmail: e.target.value})} />
          <input type="email" required placeholder="Email del destinatario" className="w-full border rounded-lg p-3" value={form.recipientEmail} onChange={(e) => setForm({...form, recipientEmail: e.target.value})} />
          
          <div>
            <label className="block text-sm font-medium mb-2">Date disponibili</label>
            {form.dates.map((date, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="datetime-local" className="flex-1 border rounded-lg p-2" value={date} onChange={(e) => updateDate(idx, e.target.value)} />
                {form.dates.length > 1 && <button type="button" onClick={() => removeDate(idx)} className="bg-red-100 text-red-600 px-3 rounded-lg">🗑️</button>}
              </div>
            ))}
            <button type="button" onClick={addDate} className="text-pink-500 text-sm">+ Aggiungi altra data</button>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg">{loading ? '⏳ Creazione...' : '💌 Crea invito'}</button>
          
          {inviteLink && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-green-700 text-sm">✅ Invito creato! Copia questo link:</p>
              <p className="text-blue-600 text-sm break-all mt-1">{inviteLink}</p>
              <button 
                onClick={() => navigator.clipboard.writeText(inviteLink)}
                className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                📋 Copia link
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
