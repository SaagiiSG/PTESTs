import React, { useState } from 'react';

export default function PayPage() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [qr, setQr] = useState<string | null>(null);
  const [deeplink, setDeeplink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQr(null);
    setDeeplink(null);
    try {
      const res = await fetch('/api/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create invoice');
      setQr(data.qr_image);
      setDeeplink(data.deeplink);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Pay with QPay</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Amount (₮):
          <input
            type="number"
            min="1"
            required
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ width: '100%', marginBottom: 12 }}
          />
        </label>
        <label>
          Description (optional):
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ width: '100%', marginBottom: 12 }}
          />
        </label>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 8 }}>
          {loading ? 'Generating QR...' : 'Generate QPay QR'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {qr && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <h4>Scan to Pay</h4>
          <img src={`data:image/png;base64,${qr}`} alt="QPay QR" style={{ width: 200, height: 200 }} />
          {deeplink && (
            <div style={{ marginTop: 8 }}>
              <a href={deeplink} target="_blank" rel="noopener noreferrer">Pay in Bank App</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 