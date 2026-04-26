// DetailView.jsx
import { useEffect, useState } from 'react';
import { getAuctionStatus, formatCurrency, formatDateTime, formatTimeRemaining, triggerLabel } from '../../utils/helpers';
import Badge from '../ui/Badge';
import socket from '../../utils/socket';

function RankBadge({ rank }) {
  const cls =
    rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';
  return <div className={`rank-badge ${cls}`}>L{rank}</div>;
}

function BidCard({ bid, rank }) {
  const isL1 = rank === 1;
  return (
    <div className={`card p-4 mb-2 anim-slide-in${isL1 ? ' bid-card-l1' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <RankBadge rank={rank} />
          <div>
            <div className="font-syne font-semibold text-sm">{bid.carrier_name}</div>
            <div className="font-mono text-xs text-neutral-600">{formatDateTime(bid.bid_time)}</div>
          </div>
        </div>
        <div className="font-syne font-bold text-lg">{formatCurrency(bid.total_bid)}</div>
      </div>
      <div className="flex items-center gap-6 flex-wrap text-sm">
        <div>
          <span className="font-mono text-xs text-neutral-600">Freight: </span>
          <span className="font-mono text-xs">{formatCurrency(bid.freight_charges)}</span>
        </div>
        <div>
          <span className="font-mono text-xs text-neutral-600">Origin: </span>
          <span className="font-mono text-xs">{formatCurrency(bid.origin_charges)}</span>
        </div>
        <div>
          <span className="font-mono text-xs text-neutral-600">Dest: </span>
          <span className="font-mono text-xs">{formatCurrency(bid.destination_charges)}</span>
        </div>
        <div>
          <span className="font-mono text-xs text-neutral-600">Transit: </span>
          <span className="font-mono text-xs">{bid.transit_time}</span>
        </div>
        <div>
          <span className="font-mono text-xs text-neutral-600">Valid: </span>
          <span className="font-mono text-xs">{bid.quote_validity}</span>
        </div>
      </div>
    </div>
  );
}

function ActivityLog({ logs }) {
  const sorted = [...logs]
    .sort((a, b) => new Date(b.log_time) - new Date(a.log_time))
    .slice(0, 20);

  return (
    <div className="live-activity-section">
      <h3 className="font-syne font-semibold text-sm mb-3">Live Activity</h3>
      {sorted.length === 0 ? (
        <div className="text-center py-8 font-mono text-sm text-neutral-600">No activity yet.</div>
      ) : (
        sorted.map((log, i) => {
          const isExtension = (log.log_message || '').includes('extended');
          return (
            <div key={log.__backendId || i} className="log-entry">
              <div className="flex-shrink-0 mt-1">
                <i
                  data-lucide={isExtension ? 'clock' : 'send'}
                  style={{ width: 14, height: 14, color: '#555' }}
                />
              </div>
              <div className="flex-1">
                <div className="font-mono text-xs">{log.log_message}</div>
                <div className="font-mono text-xs text-neutral-600 mt-1">
                  {formatDateTime(log.log_time)}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function DetailView({ rfqId, allData, getBidsForRFQ, getLogsForRFQ, onNavigate, onOpenBidModal, currentUser, showToast, fetchDetails }) {
  const [serverOffset] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const rfq = allData.find((d) => d.__backendId === rfqId && d.type === 'rfq');

  useEffect(() => {
    if (!rfqId) return;
    socket.emit('joinAuction', rfqId);
  }, [rfqId]);

  useEffect(() => {
    if (!rfqId) return;
    fetchDetails(rfqId);
  }, [rfqId, fetchDetails]);

  useEffect(() => {
    if (!rfq) return;
    function tick() {
      const closeTime = new Date(rfq.current_close || rfq.bid_close);
      const now = new Date().getTime() + serverOffset;
      const diff = closeTime.getTime() - now;
      setTimeLeft(diff > 0 ? diff : 0);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [rfq, serverOffset]);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  if (!rfq) return null;

  const bids = getBidsForRFQ(rfqId);
  const logs = getLogsForRFQ(rfqId);
  const status = getAuctionStatus(rfq);
  const lowest = bids.length > 0 ? Math.min(...bids.map((b) => b.total_bid)) : null;
  const sortedBids = [...bids].sort((a, b) => a.total_bid - b.total_bid);

  const originalClose = new Date(rfq.bid_close);
  const currentClose = new Date(rfq.current_close || rfq.bid_close);
  const isExtended = currentClose > originalClose;
  const isClosed = status === 'Closed' || status === 'Force Closed';
  const countdownColor = timeLeft < 300000 ? '#ff4444' : 'var(--text-primary)';

  return (
    <section className="px-6 py-12 max-w-5xl mx-auto">
      <button className="btn-ghost text-xs mb-8" onClick={() => onNavigate('listing')}>
        <span className="flex items-center gap-2">
          <i data-lucide="arrow-left" style={{ width: 14, height: 14 }} />
          Back to Auctions
        </span>
      </button>

      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="font-syne font-bold text-3xl">{rfq.rfq_name}</h2>
            <Badge status={status} />
          </div>
          <p className="font-mono text-xs text-neutral-500">{rfq.rfq_id}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="font-mono text-xs text-neutral-600">Time Remaining</div>
            <div className="font-syne font-bold text-lg" style={{ color: countdownColor }}>
              {formatTimeRemaining(timeLeft)}
            </div>
          </div>
          {!isClosed && currentUser?.role === "supplier" && (
            <button className="btn-primary text-xs" onClick={onOpenBidModal}>
              <span className="flex items-center gap-2">
                <i data-lucide="send" style={{ width: 14, height: 14 }} />
                Place Bid
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="gap-4 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)' }}>
        <div className="card p-4 text-center">
          <div className="font-mono text-xs text-neutral-600 mb-1">Lowest Bid</div>
          <div className="font-syne font-bold text-xl">{lowest !== null ? formatCurrency(lowest) : '—'}</div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-mono text-xs text-neutral-600 mb-1">Total Bids</div>
          <div className="font-syne font-bold text-xl">{bids.length}</div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-mono text-xs text-neutral-600 mb-1">Pickup Date</div>
          <div className="font-mono text-xs">{rfq.pickup_date ? formatDateTime(rfq.pickup_date) : '—'}</div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-mono text-xs text-neutral-600 mb-1">Current Close</div>
          <div className="font-mono text-xs">{formatDateTime(rfq.current_close || rfq.bid_close)}</div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-mono text-xs text-neutral-600 mb-1">Forced Close</div>
          <div className="font-mono text-xs">{formatDateTime(rfq.forced_close)}</div>
        </div>
      </div>

      {isClosed && (
        <div
          className="mb-3 px-4 py-3 rounded-xl text-center"
          style={{
            border: '1px solid',
            background: status === 'Force Closed' ? 'rgba(255,100,100,0.15)' : 'rgba(100,100,100,0.15)',
            borderColor: status === 'Force Closed' ? '#ff6464' : '#666',
          }}
        >
          <div className="font-syne font-semibold text-sm">
            {status === 'Force Closed' ? '⏹ Auction Force Closed' : '✓ Auction Closed'}
          </div>
          <div className="font-mono text-xs text-neutral-600 mt-1">
            {formatDateTime(status === 'Force Closed' ? rfq.forced_close : rfq.current_close || rfq.bid_close)}
          </div>
        </div>
      )}

      {isExtended && (
        <div
          className="mb-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(100,200,100,0.15)', border: '1px solid #4ade80' }}
        >
          <div className="font-mono text-xs flex items-center gap-2" style={{ color: '#4ade80' }}>
            <i data-lucide="zap" style={{ width: 14, height: 14 }} />
            <strong>Auction extended</strong> — new bids received within trigger window
          </div>
        </div>
      )}

      <div className="card p-4 mb-8">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <i data-lucide="timer" style={{ width: 14, height: 14, color: '#666' }} />
            <span className="font-mono text-xs text-neutral-400">
              Trigger: <strong className="text-white">{rfq.trigger_window}</strong> min
            </span>
          </div>
          <div className="flex items-center gap-2">
            <i data-lucide="clock" style={{ width: 14, height: 14, color: '#666' }} />
            <span className="font-mono text-xs text-neutral-400">
              Extension: <strong className="text-white">{rfq.extension_duration}</strong> min
            </span>
          </div>
          <div className="flex items-center gap-2">
            <i data-lucide="zap" style={{ width: 14, height: 14, color: '#666' }} />
            <span className="font-mono text-xs text-neutral-400">
              On: <strong className="text-white">{triggerLabel(rfq.extension_trigger)}</strong>
            </span>
          </div>
        </div>
      </div>

      <h3 className="font-syne font-semibold text-lg mb-4">Live Rankings</h3>
      {sortedBids.length === 0 ? (
        <div className="text-center py-12 font-mono text-sm text-neutral-600">
          No bids submitted yet.
        </div>
      ) : (
        sortedBids.map((bid, i) => (
          <BidCard key={bid.__backendId} bid={bid} rank={i + 1} />
        ))
      )}

      <ActivityLog logs={logs} />
    </section>
  );
}
