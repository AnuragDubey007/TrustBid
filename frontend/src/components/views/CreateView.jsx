// CreateView.jsx
import { useState } from 'react';
import { triggerLabel } from '../../utils/helpers';

const defaultForm = {
  rfqName: '',
  rfqRefId: '',
  bidStart: '',
  bidClose: '',
  forcedClose: '',
  pickupDate: '',
  triggerWindow: 10,
  extensionDuration: 5,
  extensionTrigger: 'bid_received',
};

export default function CreateView({ onNavigate, onCreateRFQ }) {
  const [form, setForm] = useState(defaultForm);
  const [scheduleError, setScheduleError] = useState('');
  const [loading, setLoading] = useState(false);

  const todayMin = new Date().toISOString().slice(0, 16);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function configPreviewText() {
    return (
      <>
        Monitoring last <strong className="text-white">{form.triggerWindow} min</strong> before
        close. Extends by <strong className="text-white">{form.extensionDuration} min</strong> on{' '}
        <strong className="text-white">{triggerLabel(form.extensionTrigger).toLowerCase()}</strong>.
      </>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setScheduleError('');

    //  NAME VALIDATION
  if (!/^[a-zA-Z\s]{3,}$/.test(form.rfqName.trim())) {
    setScheduleError('RFQ Name must be at least 3 characters and contain only letters.');
    return;
  }

  // REF ID VALIDATION
  if (!/^[A-Za-z0-9\-]{3,20}$/.test(form.rfqRefId.trim())) {
    setScheduleError('Reference ID must be 3-20 characters, letters/numbers/hyphens only.');
    return;
  }

    const now = new Date();

    const bidStart = new Date(form.bidStart);
    const bidClose = new Date(form.bidClose);
    const forcedClose = new Date(form.forcedClose);

    // 🔥 PAST DATE CHECK

    if (forcedClose <= now) {
      setScheduleError("Forced Close must be in the future");
      return;
    }


    if (bidStart < now) {
      setScheduleError("Bid Start date & time cannot be in the past");
      return;
    }
    if (bidClose <= bidStart) {
      setScheduleError("Bid Close must be after Bid Start");
      return;
    }

    // 🔥 FORCED must be AFTER close
    if (forcedClose <= bidClose) {
      setScheduleError("Forced Close must be after Bid Close");
      return;
    }

    // trigger window vs auction duration
    const auctionDurationMins = (bidClose - bidStart) / 60000;

    if (parseInt(form.triggerWindow) >= auctionDurationMins) {
      setScheduleError('Trigger window cannot exceed auction duration.');
      return;
    }

    setLoading(true);
    const ok = await onCreateRFQ({
      rfq_name: form.rfqName,
      rfq_id: form.rfqRefId,
      bid_start: new Date(form.bidStart).toISOString(),     
      bid_close: new Date(form.bidClose).toISOString(),       
      forced_close: new Date(form.forcedClose).toISOString(), 
      pickup_date: form.pickupDate || '',
      trigger_window: parseInt(form.triggerWindow),
      extension_duration: parseInt(form.extensionDuration),
      extension_trigger: form.extensionTrigger,
      current_close: form.bidClose,
    });
    setLoading(false);
    if (ok) {
      setForm(defaultForm);
      onNavigate('listing');
    }
  }

  return (
    <section className="px-6 py-12 max-w-3xl mx-auto">
      <button className="btn-ghost text-xs mb-8" onClick={() => onNavigate('listing')}>
        <span className="flex items-center gap-2">
          <i data-lucide="arrow-left" style={{ width: 14, height: 14 }} />
          Back to Auctions
        </span>
      </button>

      <h2 className="font-syne font-bold text-3xl mb-2 anim-fade-up">Create RFQ</h2>
      <p className="font-mono text-xs text-neutral-500 mb-8 anim-fade-up-1">
        Configure your British Auction parameters
      </p>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="card p-6 mb-4 anim-fade-up-1">
          <h3 className="font-syne font-semibold text-sm mb-4 flex items-center gap-2">
            <i data-lucide="file-text" style={{ width: 16, height: 16, color: '#666' }} />
            Basic Information
          </h3>
          <div className="grid-2 gap-4">
            <div>
              <label className="font-mono text-xs text-neutral-500 block mb-2">RFQ Name *</label>
              <input
                name="rfqName"
                type="text"
                className="input-field"
                placeholder="e.g. Q4 Freight Tender"
                value={form.rfqName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="font-mono text-xs text-neutral-500 block mb-2">Reference ID *</label>
              <input
                name="rfqRefId"
                type="text"
                className="input-field"
                placeholder="e.g. RFQ-2024-001"
                value={form.rfqRefId}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="card p-6 mb-4 anim-fade-up-2">
          <h3 className="font-syne font-semibold text-sm mb-4 flex items-center gap-2">
            <i data-lucide="clock" style={{ width: 16, height: 16, color: '#666' }} />
            Auction Schedule
          </h3>
          <div className="grid-2 gap-4">
            <div>
              <label className="font-mono text-xs text-neutral-500 block mb-2">Bid Start Date &amp; Time *</label>
              <input name="bidStart" type="datetime-local" className="input-field" value={form.bidStart} onChange={handleChange} min={todayMin} required />
            </div>
            <div>
              <label className="font-mono text-xs text-neutral-500 block mb-2">Bid Close Date &amp; Time *</label>
              <input name="bidClose" type="datetime-local" className="input-field" value={form.bidClose} onChange={handleChange} min={todayMin} required />
            </div>
            <div>
              <label className="font-mono text-xs text-neutral-500 block mb-2">Forced Bid Close *</label>
              <input name="forcedClose" type="datetime-local" className="input-field" value={form.forcedClose} onChange={handleChange} min={todayMin} required />
            </div>
            <div>
              <label className="font-mono text-xs text-neutral-500 block mb-2">Pickup / Service Date</label>
              <input name="pickupDate" type="date" className="input-field" value={form.pickupDate} onChange={handleChange} />
            </div>
          </div>
          {scheduleError && (
            <div className="font-mono text-xs mt-3" style={{ color: '#ff6b6b' }}>
              {scheduleError}
            </div>
          )}
        </div>

        {/* Auction Config */}
        <div className="card p-6 mb-4 anim-fade-up-3">
          <h3 className="font-syne font-semibold text-sm mb-4 flex items-center gap-2">
            <i data-lucide="settings" style={{ width: 16, height: 16, color: '#666' }} />
            British Auction Configuration
          </h3>
          <div className="grid-3 gap-4">
            <div>
              <label className="font-mono text-xs text-neutral-500 block mb-2">Trigger Window (X min) *</label>
              <input name="triggerWindow" type="number" className="input-field" min="1" max="60" value={form.triggerWindow} onChange={handleChange} required />
            </div>
            <div>
              <label className="font-mono text-xs text-neutral-500 block mb-2">Extension Duration (Y min) *</label>
              <input name="extensionDuration" type="number" className="input-field" min="1" max="30" value={form.extensionDuration} onChange={handleChange} required />
            </div>
            <div>
              <label className="font-mono text-xs text-neutral-500 block mb-2">Extension Trigger *</label>
              <select name="extensionTrigger" className="input-field" value={form.extensionTrigger} onChange={handleChange} required>
                <option value="bid_received">Bid Received</option>
                <option value="rank_change">Any Rank Change</option>
                <option value="l1_change">L1 Rank Change</option>
              </select>
            </div>
          </div>
          <div className="config-preview mt-4 p-3 rounded-lg" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
            <p className="font-mono text-xs text-neutral-500">{configPreviewText()}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button type="button" className="btn-ghost" onClick={() => onNavigate('listing')}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Auction'}
          </button>
        </div>
      </form>
    </section>
  );
}
