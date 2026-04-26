// BidModal.jsx
import { useState } from 'react';
import { formatCurrency } from '../../utils/helpers';

const defaultForm = {
  carrier: '',
  freight: '',
  origin: '',
  dest: '',
  transitTime: '',
  validity: '',
};

export default function BidModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const total =
    (parseFloat(form.freight) || 0) +
    (parseFloat(form.origin) || 0) +
    (parseFloat(form.dest) || 0);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const ok = await onSubmit({
      carrier: form.carrier,
      freight: parseFloat(form.freight),
      origin: parseFloat(form.origin),
      dest: parseFloat(form.dest),
      transitTime: form.transitTime,
      quoteValidity: form.validity
    });
    setLoading(false);
    if (ok) {
      setForm(defaultForm);
      onClose();
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-syne font-bold text-lg">Submit Quote</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
            <i data-lucide="x" style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2 gap-4 mb-4">
            <div style={{ gridColumn: 'span 2' }}>
              <label className="font-mono text-xs text-neutral-500 block mb-2">Carrier Name *</label>
              <input name="carrier" type="text" className="input-field" placeholder="e.g. Maersk Line" value={form.carrier} onChange={handleChange} required />
            </div>
            <div>
              <label className="font-mono text-xs text-neutral-500 block mb-2">Freight Charges ($) *</label>
              <input name="freight" type="number" className="input-field" min="0" step="0.01" placeholder="0.00" value={form.freight} onChange={handleChange} required />
            </div>
            <div>
              <label className="font-mono text-xs text-neutral-500 block mb-2">Origin Charges ($) *</label>
              <input name="origin" type="number" className="input-field" min="0" step="0.01" placeholder="0.00" value={form.origin} onChange={handleChange} required />
            </div>
            <div>
              <label className="font-mono text-xs text-neutral-500 block mb-2">Destination Charges ($) *</label>
              <input name="dest" type="number" className="input-field" min="0" step="0.01" placeholder="0.00" value={form.dest} onChange={handleChange} required />
            </div>
            <div>
              <label className="font-mono text-xs text-neutral-500 block mb-2">Transit Time *</label>
              <input name="transitTime" type="text" className="input-field" placeholder="e.g. 14 days" value={form.transitTime} onChange={handleChange} required />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="font-mono text-xs text-neutral-500 block mb-2">Quote Validity *</label>
              <input name="validity" type="text" className="input-field" placeholder="e.g. 30 days" value={form.validity} onChange={handleChange} required />
            </div>
          </div>

          <div className="p-3 rounded-lg mb-4" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
            <div className="font-mono text-xs text-neutral-500">
              Total Bid: <strong className="text-white text-sm">{formatCurrency(total)}</strong>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Bid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
