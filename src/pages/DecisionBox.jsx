import React, { useState } from 'react';

/** Approve / reject controls. Rejecting requires a reason (the backend enforces it too). */
export default function DecisionBox({ onDecide, approveLabel = 'Approve' }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function go(decision) {
    setBusy(true); setError('');
    try { await onDecide(decision, decision === 'rejected' ? reason.trim() : undefined); }
    catch (e) { setError(e.message); setBusy(false); }
  }

  return (
    <div className="decision">
      {error && <div className="error">{error}</div>}
      {rejecting ? (
        <>
          <label>Reason for rejection (shown to the passenger)
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
          <div className="row">
            <button className="danger" disabled={busy || reason.trim().length < 3} onClick={() => go('rejected')}>Confirm rejection</button>
            <button className="ghost" disabled={busy} onClick={() => setRejecting(false)}>Back</button>
          </div>
        </>
      ) : (
        <div className="row">
          <button className="primary" disabled={busy} onClick={() => go('approved')}>{approveLabel}</button>
          <button className="danger-outline" disabled={busy} onClick={() => setRejecting(true)}>Reject</button>
        </div>
      )}
    </div>
  );
}
