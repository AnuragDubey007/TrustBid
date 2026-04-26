// DeleteModal.jsx
import { useState } from 'react';

export default function DeleteModal({ onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content p-6" style={{ maxWidth: 400 }}>
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: '#1a1a1a' }}
          >
            <i data-lucide="alert-triangle" style={{ width: 24, height: 24, color: '#999' }} />
          </div>
          <h3 className="font-syne font-bold text-lg mb-2">Delete Auction?</h3>
          <p className="font-mono text-xs text-neutral-500 mb-6">
            This will permanently delete the RFQ and all associated bids.
          </p>
          <div className="flex justify-center gap-3">
            <button className="btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button
              className="btn-primary"
              style={{ background: '#ff4444', color: '#fff' }}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
