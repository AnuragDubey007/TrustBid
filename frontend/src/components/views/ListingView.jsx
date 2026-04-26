// ListingView.jsx
import { getAuctionStatus, formatCurrency, formatDateTime } from '../../utils/helpers';
import Badge from '../ui/Badge';

export default function ListingView({ rfqs, getBidsForRFQ, onNavigate, onOpenDetail, onDeleteRFQ }) {
  const sorted = [...rfqs].sort((a, b) => new Date(b.bid_start) - new Date(a.bid_start));

  return (
    <section className="px-6 py-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-syne font-bold text-3xl mb-1 anim-fade-up">Auctions</h2>
          <p className="font-mono text-xs text-neutral-500 anim-fade-up-1">All British Auction RFQs</p>
        </div>
        {JSON.parse(localStorage.getItem("user"))?.role === "buyer" && (
        <button className="btn-primary" onClick={() => onNavigate('create')}>
            <span className="flex items-center gap-2">
            <i data-lucide="plus" style={{ width: 14, height: 14 }} />
            New RFQ
            </span>
        </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20 font-mono text-sm text-neutral-600">
          <i data-lucide="inbox" style={{ width: 40, height: 40, margin: '0 auto 12px', color: '#333', display: 'block' }} />
          No auctions yet. Create your first RFQ to get started.
        </div>
      ) : (
        sorted.map((rfq) => {
          const bids = getBidsForRFQ(rfq.__backendId);
          const status = getAuctionStatus(rfq);
          const lowest = bids.length > 0 ? Math.min(...bids.map((b) => b.total_bid)) : null;

          return (
            <div
              key={rfq.__backendId}
              className="card card-clickable p-5 mb-3 anim-slide-in"
              onClick={() => onOpenDetail(rfq.__backendId)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-syne font-semibold text-base">{rfq.rfq_name}</h3>
                  <Badge status={status} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="btn-ghost text-xs"
                    style={{ padding: '6px 10px' }}
                    title="Delete"
                    onClick={(e) => { e.stopPropagation(); onDeleteRFQ(rfq.__backendId); }}
                  >
                    <i data-lucide="trash-2" style={{ width: 14, height: 14 }} />
                  </button>
                  <button
                    className="btn-ghost text-xs"
                    style={{ padding: '6px 12px' }}
                    onClick={(e) => { e.stopPropagation(); onOpenDetail(rfq.__backendId); }}
                  >
                    <span className="flex items-center gap-1">
                      View <i data-lucide="arrow-right" style={{ width: 12, height: 12 }} />
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <div>
                  <span className="font-mono text-xs text-neutral-600">Ref: </span>
                  <span className="font-mono text-xs">{rfq.rfq_id}</span>
                </div>
                <div>
                  <span className="font-mono text-xs text-neutral-600">Lowest: </span>
                  <span className="font-mono text-xs font-bold">
                    {lowest !== null ? formatCurrency(lowest) : '—'}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-xs text-neutral-600">Bids: </span>
                  <span className="font-mono text-xs">{bids.length}</span>
                </div>
                <div>
                  <span className="font-mono text-xs text-neutral-600">Closes: </span>
                  <span className="font-mono text-xs">
                    {formatDateTime(rfq.current_close || rfq.bid_close)}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
