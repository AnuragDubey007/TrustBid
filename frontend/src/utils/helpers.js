// helpers.js
export function getAuctionStatus(rfq) {
  const now = new Date();
  const start = new Date(rfq.bid_start);
  const close = new Date(rfq.current_close || rfq.bid_close);
  const forced = new Date(rfq.forced_close);

  // 🔥 LIVE CALCULATION (PRIMARY)
  if (now < start) return 'Scheduled';
  if (now >= forced) return 'Force Closed';
  if (now >= close) return 'Closed';
  return 'Active';
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);

  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(n) {
  return '$' + Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatTimeRemaining(ms) {
  if (ms <= 0) return '00:00:00';
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return [hours, minutes, seconds]
    .map((v) => v.toString().padStart(2, '0'))
    .join(':');
}

export function triggerLabel(t) {
  if (t === 'rank_change') return 'Any Rank Change';
  if (t === 'l1_change') return 'L1 Rank Change';
  return 'Bid Received';
}

export function adjustBrightness(hex, amount) {
  hex = hex.replace('#', '');
  const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + amount);
  const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
