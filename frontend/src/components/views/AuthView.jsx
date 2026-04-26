import { useState, useEffect } from 'react';

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onSwitch, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await onLogin({ email, password });
    setLoading(false);
    setEmail('');
    setPassword('');
  }

  return (
    <div className="anim-fade-up">
      <div className="mb-8">
        <h2 className="font-syne font-bold text-3xl mb-2">Welcome Back</h2>
        <p className="font-mono text-sm text-neutral-500">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="font-mono text-xs text-neutral-500 block mb-3">Email Address</label>
          <input
            type="email"
            className="input-field"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="font-mono text-xs text-neutral-500 block mb-3">Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn-primary mt-4"
          style={{ fontWeight: 700 }}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div
        style={{
          marginTop: 24,
          paddingTop: 24,
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
        }}
      >
        <span className="font-mono text-sm text-neutral-500">Don't have an account?</span>
        <button
          className="font-mono text-sm font-bold text-white ml-2"
          onClick={() => onSwitch('register')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────
function RegisterForm({ onSwitch, onRegister }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const ok = await onRegister({ fullName, email, password, role });
    setLoading(false);
    if (ok) {
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('');
      onSwitch('login');
    }
  }

  return (
    <div className="anim-fade-up">
      <div className="mb-8">
        <h2 className="font-syne font-bold text-3xl mb-2">Get Started</h2>
        <p className="font-mono text-sm text-neutral-500">Create your account</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="font-mono text-xs text-neutral-500 block mb-3">Full Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="font-mono text-xs text-neutral-500 block mb-3">Email Address</label>
          <input
            type="email"
            className="input-field"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="font-mono text-xs text-neutral-500 block mb-3">Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="font-mono text-xs text-neutral-500 block mb-3" style={{ fontWeight: 600 }}>
            I am a:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {['Buyer', 'Supplier'].map((r) => (
              <label
                key={r}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  border: `1px solid ${role === r ? 'var(--text-primary)' : 'var(--border-color)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: 'var(--card-bg)',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  required
                  style={{ cursor: 'pointer', width: 18, height: 18, accentColor: '#fff' }}
                />
                <span className="font-mono text-sm">{r}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary mt-4"
          style={{ fontWeight: 700 }}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>

      <div
        style={{
          marginTop: 24,
          paddingTop: 24,
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
        }}
      >
        <span className="font-mono text-sm text-neutral-500">Already have an account?</span>
        <button
          className="font-mono text-sm font-bold text-white ml-2"
          onClick={() => onSwitch('login')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

// ─── Auth Page (Left panel + Right panel) ─────────────────────────────────────
export default function AuthView({ theme, onLogin, onRegister }) {
  const [activeForm, setActiveForm] = useState('login');

  // Re-init lucide after every render
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  const leftPanelBg =
    theme === 'light'
      ? 'linear-gradient(135deg, #f0f0f0 0%, #e5e5e5 100%)'
      : 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)';

  return (
    <div style={{ minHeight: 'calc(100vh - 73px)', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'stretch' }}>

      {/* ── Left branding panel ── */}
      <div
        style={{
          background: leftPanelBg,
          padding: 40,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          transition: 'background 0.3s',
        }}
      >
        {/* noise overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-8 anim-fade-up"
            style={{ boxShadow: '0 20px 40px rgba(255,255,255,0.1)' }}
          >
            <i data-lucide="zap" style={{ width: 32, height: 32, color: '#000' }} />
          </div>

          <h1 className="font-syne font-bold text-4xl mb-3 anim-fade-up">TrustBid</h1>
          <p className="font-mono text-sm text-neutral-400 max-w-sm mx-auto anim-fade-up-1">
            Precision Bidding
          </p>

          <div className="mt-16 space-y-6 anim-fade-up-2">
            {[
              { icon: 'shield-check', label: 'Secure Platform' },
              { icon: 'zap',          label: 'Real-Time Auctions' },
              { icon: 'users',        label: 'Transparent Bidding' },
            ].map(({ icon, label }) => (
              <div key={label}>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <i data-lucide={icon} style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.6)' }} />
                  <span className="font-mono text-xs text-neutral-400">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div
        style={{
          padding: 40,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
        }}
      >
        {activeForm === 'login' ? (
          <LoginForm onSwitch={setActiveForm} onLogin={onLogin} />
        ) : (
          <RegisterForm onSwitch={setActiveForm} onRegister={onRegister} />
        )}
      </div>
    </div>
  );
}
