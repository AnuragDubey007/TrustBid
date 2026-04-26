import { useState, useEffect } from 'react';
import { useAuction } from './hooks/useAuction';

import Navbar from './components/layout/Navbar';
import ToastContainer from './components/ui/Toast';

import AuthView from './components/views/AuthView';
import HeroView from './components/views/HeroView';
import CreateView from './components/views/CreateView';
import ListingView from './components/views/ListingView';
import DetailView from './components/views/DetailView';

import BidModal from './components/modals/BidModal';
import DeleteModal from './components/modals/DeleteModal';

export default function App() {
  // ── Theme ────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') root.classList.add('light-mode');
    else root.classList.remove('light-mode');
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }

  // ── Auth state ────────────────────────────────────────────────────────────
  // Replace these with real API calls when you wire your backend.
  // currentUser = null means logged out → show AuthView
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastView");
    setCurrentUser(null);
    setCurrentView("auth");
  }

  async function handleLogin({ email, password }) {
  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToastExternal(data.message || "Login failed", true);
      return;
    }

    // ✅ STORE TOKEN
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // ✅ STORE USER
    setCurrentUser(data.user);

    showToastExternal("Login successful!");
    setCurrentView("hero");

  } catch (err) {
    showToastExternal("Login error", true);
  }
}

  async function handleRegister({ fullName, email, password, role }) {
  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: fullName,
        email,
        password,
        role: role.toLowerCase(), // 🔥 IMPORTANT
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToastExternal(data.message || "Register failed", true);
      return false;
    }

    showToastExternal("Account created! Please login.");
    return true;

  } catch (err) {
    showToastExternal("Register error", true);
    return false;
  }
}

  // ── Navigation ────────────────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState(() => {
    const user = localStorage.getItem("user");
    if (!user) return "auth";
    return localStorage.getItem("lastView") || "hero";
  });
  const [currentDetailRfqId, setCurrentDetailRfqId] = useState(null);

  function navigate(view) {
    setCurrentView(view);
    localStorage.setItem("lastView", view);
  }

  function openDetail(rfqId) {
    setCurrentDetailRfqId(rfqId);
    setCurrentView('detail');
  }

  // ── Data & business logic ─────────────────────────────────────────────────
  const {
    allData,
    getRFQs,
    getBidsForRFQ,
    getLogsForRFQ,
    stats,
    toasts,
    createRFQ,
    deleteRFQ,
    submitBid,
    showToast,
    fetchDetails,
  } = useAuction();

  // Expose showToast for auth handlers above
  function showToastExternal(msg, isError) {
    if (showToast) showToast(msg, isError);
  }

  // ── Modals ────────────────────────────────────────────────────────────────
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function openDeleteModal(rfqId) { setDeleteTarget(rfqId); }

  async function handleDelete() {
    await deleteRFQ(deleteTarget);
    setDeleteTarget(null);
    if (currentView === 'detail' && currentDetailRfqId === deleteTarget) navigate('listing');
  }

  async function handleSubmitBid(payload) {
    return submitBid(currentDetailRfqId, payload);
  }

  // Re-init lucide after every render
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  // ── Render ────────────────────────────────────────────────────────────────
  const isAuthed = !!currentUser;

  return (
    <div className="app-root">
      <ToastContainer toasts={toasts} />

      <Navbar
        currentView={currentView}
        onNavigate={navigate}
        theme={theme}
        onToggleTheme={toggleTheme}
        isAuthed={isAuthed}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Auth gate: if not logged in, always show AuthView */}
      {!isAuthed && (
        <AuthView
          theme={theme}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}

      {isAuthed && currentView === 'hero' && (
        <HeroView stats={stats} onNavigate={navigate} />
      )}

      {isAuthed && currentView === 'create' && currentUser?.role === "buyer" && (
        <CreateView onNavigate={navigate} onCreateRFQ={createRFQ} />
      )}

      {isAuthed && currentView === 'listing' && (
        <ListingView
          rfqs={getRFQs()}
          getBidsForRFQ={getBidsForRFQ}
          onNavigate={navigate}
          onOpenDetail={openDetail}
          onDeleteRFQ={openDeleteModal}
        />
      )}

      {isAuthed && currentView === 'detail' && currentDetailRfqId && (
        <DetailView
          rfqId={currentDetailRfqId}
          allData={allData}
          getBidsForRFQ={getBidsForRFQ}
          getLogsForRFQ={getLogsForRFQ}
          onNavigate={navigate}
          onOpenBidModal={() => setBidModalOpen(true)}
          currentUser={currentUser}
          showToast={showToast}
          fetchDetails={fetchDetails}
        />
      )}

      {bidModalOpen && (
        <BidModal
          onClose={() => setBidModalOpen(false)}
          onSubmit={handleSubmitBid}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
