import React, { useState } from 'react';
import { api } from '../api.js';
import useLoad from './useLoad.js';
import DecisionBox from './DecisionBox.jsx';

export default function Applications() {
  const { data, error, loading, reload } = useLoad(api.pendingApplications);
  const [open, setOpen] = useState(null);
  const list = data || [];

  return (
    <section className="wide">
      <div className="bar">
        <h2>Season applications waiting for approval <span className="count">{list.length}</span></h2>
        <button className="ghost" onClick={reload}>Refresh</button>
      </div>
      {error && <div className="error">{error}</div>}
      {loading && !data && <p className="muted">Loading…</p>}
      {data && list.length === 0 && <p className="muted">Nothing waiting.</p>}
      {list.map((a) => (
        <div className="card app" key={a.id}>
          <div className="app-head">
            <div><strong>{a.holderName}</strong><small>{a.fromStation} → {a.toStation} · {a.ticketClass} class</small></div>
            <div className="right"><strong>LKR {a.fareLkr.toLocaleString()}</strong><small>{a.startDate} to {a.endDate}</small></div>
          </div>
          {open === a.id ? (
            <DecisionBox approveLabel="Approve application" onDecide={async (d, r) => { await api.applicationDecision(a.id, d, r); setOpen(null); reload(); }} />
          ) : <button className="ghost" onClick={() => setOpen(a.id)}>Review</button>}
        </div>
      ))}
    </section>
  );
}
