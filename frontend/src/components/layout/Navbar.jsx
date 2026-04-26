import { useEffect } from 'react';

export default function Navbar({ currentView, onNavigate, theme, onToggleTheme, isAuthed, currentUser, onLogout }) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <nav
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onClick={() => onNavigate(isAuthed ? 'hero' : 'auth')}
        >
        <div
          style={{
            width: 40, height: 40, background: 'white', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <i data-lucide="zap" style={{ width: 24, height: 24, color: '#000' }} />
        </div>
        <div>
          <h1 className="font-syne" style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            TrustBid
          </h1>
          <p className="font-mono" style={{ fontSize: 10, margin: 0, color: 'var(--text-secondary)' }}>
            Precision Bidding
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Theme toggle with text label */}
        <button
          onClick={onToggleTheme}
          style={{
            background: theme === 'light' ? '#f0f0f0' : 'var(--card-bg)',
            border: `1px solid ${theme === 'light' ? '#e0e0e0' : 'var(--border-color)'}`,
            borderRadius: 8, padding: '10px 16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--text-primary)', fontFamily: "'Space Mono', monospace",
            fontSize: 13, transition: 'all 0.2s',
          }}
        >
          <i data-lucide={theme === 'light' ? 'moon' : 'sun'} style={{ width: 18, height: 18 }} />
          <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

        {/* Auction nav — only when logged in */}
        {isAuthed && (
          <>
            <button className="btn-ghost text-xs" onClick={() => onNavigate('listing')}>
              <span className="flex items-center gap-2">
                <i data-lucide="list" style={{ width: 14, height: 14 }} />
                Auctions
              </span>
            </button>
            <button className="theme-toggle-btn" title="User Profile">
              <i data-lucide="user" style={{ width: 16, height: 16 }} />
            </button>
            {currentUser?.role === "buyer" && (
            <button className="btn-primary text-xs" onClick={() => onNavigate('create')}>
              <span className="flex items-center gap-2">
                <i data-lucide="plus" style={{ width: 14, height: 14 }} />
                New RFQ
              </span>
            </button>
          )}
          <button className="btn-primary text-xs" onClick={onLogout}>
            <span className="flex items-center gap-2">
              <i data-lucide="log-out" style={{ width: 14, height: 14 }} />
              Logout
            </span>
          </button>
          </>
        )}
      </div>
    </nav>
  );
}
