// HeroView.jsx
export default function HeroView({ stats, config, onNavigate }) {
  const heading = config?.hero_heading || 'Precision\nBidding.';
  const desc =
    config?.hero_description ||
    'Transparent supplier competition with intelligent auction extensions. Fair pricing through British Auction mechanics.';

  return (
    <section className="px-6 py-20 md:py-32 max-w-5xl mx-auto text-center">
      <div className="anim-fade-up">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-800 mb-8"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <span className="w-2 h-2 rounded-full bg-white pulse-dot" />
          <span className="font-mono text-xs text-neutral-400">Live Auction Engine</span>
        </div>
      </div>

      <h1
        className="font-syne font-800 text-5xl md:text-7xl tracking-tight leading-none mb-6 anim-fade-up"
        dangerouslySetInnerHTML={{ __html: heading.replace(/\n/g, '<br/>') }}
      />

      <p className="font-mono text-sm text-neutral-500 max-w-md mx-auto mb-10 anim-fade-up-2">
        {desc}
      </p>

      <div className="flex items-center justify-center gap-4 anim-fade-up-3">
        {JSON.parse(localStorage.getItem("user"))?.role === "buyer" && (
        <button className="btn-primary" onClick={() => onNavigate('create')}>
            Create RFQ
        </button>
        )}
        <button className="btn-ghost" onClick={() => onNavigate('listing')}>
          View Auctions
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-20 max-w-lg mx-auto anim-fade-up-3">
        <div className="text-center">
          <div className="font-syne font-bold text-2xl">{stats.rfqs}</div>
          <div className="font-mono text-xs text-neutral-600">RFQs</div>
        </div>
        <div className="text-center">
          <div className="font-syne font-bold text-2xl">{stats.bids}</div>
          <div className="font-mono text-xs text-neutral-600">Bids</div>
        </div>
        <div className="text-center">
          <div className="font-syne font-bold text-2xl">{stats.active}</div>
          <div className="font-mono text-xs text-neutral-600">Active</div>
        </div>
      </div>
    </section>
  );
}
