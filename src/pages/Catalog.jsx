import React, { useState } from 'react';
import { api } from '../api.js';
import useLoad from './useLoad.js';

const CLASSES = { first: 'First', second: 'Second', third: 'Third' };
const PERIODS = { weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly' };
const dateOnly = (d) => String(d || '').slice(0, 10);

function Stations({ stations, reload }) {
  const [f, setF] = useState({ name: '', line: '', hasSeatReservation: false });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function add(e) {
    e.preventDefault(); setErr(''); setMsg('');
    try {
      await api.createStation({ name: f.name.trim(), line: f.line.trim() || undefined, hasSeatReservation: f.hasSeatReservation });
      setMsg(`Added ${f.name.trim()}.`); setF({ name: '', line: '', hasSeatReservation: false }); reload();
    } catch (x) { setErr(x.message); }
  }

  return (
    <div className="card">
      <h2>Stations <span className="count">{stations.length}</span></h2>
      <form className="inline" onSubmit={add}>
        <input placeholder="Station name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required minLength={2} />
        <input placeholder="Line (e.g. Main)" value={f.line} onChange={(e) => setF({ ...f, line: e.target.value })} />
        <label className="check"><input type="checkbox" checked={f.hasSeatReservation} onChange={(e) => setF({ ...f, hasSeatReservation: e.target.checked })} />Seat reservation</label>
        <button className="primary">Add</button>
      </form>
      {msg && <div className="ok">{msg}</div>}{err && <div className="error">{err}</div>}
      <table>
        <thead><tr><th>Name</th><th>Line</th><th>Seat reservation</th></tr></thead>
        <tbody>{stations.map((s) => (<tr key={s.id}><td>{s.name}</td><td>{s.line || ''}</td><td>{s.hasSeatReservation ? 'Yes' : ''}</td></tr>))}</tbody>
      </table>
    </div>
  );
}

function Fares({ stations }) {
  const { data, error, reload } = useLoad(api.fares);
  const empty = { fromStationId: '', toStationId: '', ticketClass: 'second', period: 'monthly', passengerType: '', amountLkr: '' };
  const [f, setF] = useState(empty);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function add(e) {
    e.preventDefault(); setErr(''); setMsg('');
    try {
      await api.createFare({
        fromStationId: f.fromStationId, toStationId: f.toStationId, ticketClass: f.ticketClass, period: f.period,
        passengerType: f.passengerType || null, amountLkr: Number(f.amountLkr),
      });
      setMsg('Fare added.'); setF(empty); reload();
    } catch (x) { setErr(x.message); }
  }

  const opts = stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>);
  const rows = (data || []).filter((r) => `${r.fromStation} ${r.toStation}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="card">
      <h2>Fares <span className="count">{(data || []).length}</span></h2>
      <p className="muted">One row per route, class, season type and passenger type. Leave passenger type empty for both. The monthly rate is used for quarterly seasons of government passengers.</p>
      <form className="grid" onSubmit={add}>
        <label>From<select value={f.fromStationId} onChange={set('fromStationId')} required><option value="">Select…</option>{opts}</select></label>
        <label>To<select value={f.toStationId} onChange={set('toStationId')} required><option value="">Select…</option>{opts}</select></label>
        <label>Class<select value={f.ticketClass} onChange={set('ticketClass')}>{Object.entries(CLASSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label>Season type<select value={f.period} onChange={set('period')}>{Object.entries(PERIODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label>Passenger type<select value={f.passengerType} onChange={set('passengerType')}><option value="">Both</option><option value="private">Private</option><option value="government">Government</option></select></label>
        <label>Amount (LKR)<input type="number" min="0" step="0.01" value={f.amountLkr} onChange={set('amountLkr')} required /></label>
        <div className="full"><button className="primary">Add fare</button></div>
      </form>
      {msg && <div className="ok">{msg}</div>}{(err || error) && <div className="error">{err || error}</div>}
      <input placeholder="Filter by station name…" value={q} onChange={(e) => setQ(e.target.value)} style={{ margin: '.8rem 0', maxWidth: 320 }} />
      <table>
        <thead><tr><th>Route</th><th>Class</th><th>Season</th><th>For</th><th>LKR</th><th>From</th></tr></thead>
        <tbody>{rows.slice(0, 200).map((r) => (
          <tr key={r.id}><td>{r.fromStation} → {r.toStation}</td><td>{CLASSES[r.ticketClass]}</td><td>{PERIODS[r.period]}</td>
            <td>{r.passengerType || 'Both'}</td><td>{r.amountLkr.toLocaleString()}</td><td>{dateOnly(r.effectiveFrom)}</td></tr>
        ))}</tbody>
      </table>
      {rows.length > 200 && <p className="muted">Showing 200 of {rows.length}. Use the filter.</p>}
    </div>
  );
}

function Windows() {
  const { data, error, reload } = useLoad(api.windows);
  const [f, setF] = useState({ monthFor: '', opensOn: '', closesOn: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function add(e) {
    e.preventDefault(); setErr(''); setMsg('');
    try { await api.createWindow(f); setMsg('Window added.'); setF({ monthFor: '', opensOn: '', closesOn: '' }); reload(); }
    catch (x) { setErr(x.message); }
  }

  return (
    <div className="card">
      <h2>Application windows</h2>
      <p className="muted">Passengers can apply for a month only while its window is open (when the server has ENFORCE_APPLICATION_WINDOWS=true). "Month" is the first day of the ticket month.</p>
      <form className="grid" onSubmit={add}>
        <label>Ticket month (first day)<input type="date" value={f.monthFor} onChange={set('monthFor')} required /></label>
        <label>Opens on<input type="date" value={f.opensOn} onChange={set('opensOn')} required /></label>
        <label>Closes on<input type="date" value={f.closesOn} onChange={set('closesOn')} required /></label>
        <div className="full"><button className="primary">Add window</button></div>
      </form>
      {msg && <div className="ok">{msg}</div>}{(err || error) && <div className="error">{err || error}</div>}
      <table>
        <thead><tr><th>Month</th><th>Opens</th><th>Closes</th></tr></thead>
        <tbody>{(data || []).map((w) => (<tr key={w.id}><td>{dateOnly(w.monthFor)}</td><td>{dateOnly(w.opensOn)}</td><td>{dateOnly(w.closesOn)}</td></tr>))}</tbody>
      </table>
    </div>
  );
}

export default function Catalog() {
  const st = useLoad(api.stations);
  const stations = Array.isArray(st.data) ? st.data : [];
  return (
    <section className="wide">
      {st.error && <div className="error">{st.error}</div>}
      <Stations stations={stations} reload={st.reload} />
      <Fares stations={stations} />
      <Windows />
    </section>
  );
}
