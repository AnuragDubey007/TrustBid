// Badge.jsx
export default function Badge({ status }) {
  const badgeClass =
    status === 'Active'
      ? 'badge-active'
      : status === 'Closed'
      ? 'badge-closed'
      : 'badge-force-closed';

  return (
    <span className={`badge ${badgeClass}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'Active' ? 'bg-white pulse-dot' : 'bg-neutral-600'
        }`}
      />
      {status}
    </span>
  );
}
