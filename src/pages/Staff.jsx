import React, { useCallback, useState } from 'react';
import { api } from '../api.js';
import useLoad from './useLoad.js';

const empty = { fullName: '', email: '', password: '', role: 'institution_officer', institutionId: '', stationId: '' };

export default function StaffPage() {
  const staff = useLoad(api.staff);
  const inst = useLoad(api.institutions);
  const stations = useLoad(useCallback(() => api.stations(), []));
  const [f, setF] = useState(empty);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function add(e) {
    e.preventDefault(); setErr(''); setMsg('');
    const body = { fullName: f.fullName.trim(), email: f.email.trim(), password: f.password, role: f.role };
    if (f.role === 'institution_officer') body.institutionId = f.institutionId;
    if (f.role === 'station_staff' && f.stationId) body.stationId = f.stationId;
    try { await api.createStaff(body); setMsg(`Account created for ${body.email}.`); setF(empty); staff.reload(); }
    catch (x) { setErr(x.message); }
  }

  const instName = (id) => (inst.data || []).find((i) => i.id === id)?.name || '';
  const stList = Array.isArray(stations.data) ? stations.data : (stations.data?.stations || []);

  return (
    <section className="wide">
      <h2>Staff accounts</h2>
      <form className="card grid" onSubmit={add}>
        <label>Full name<input value={f.fullName} onChange={set('fullName')} required minLength={3} /></label>
        <label>E-mail<input type="email" value={f.email} onChange={set('email')} required /></label>
        <label>Temporary password<input type="password" value={f.password} onChange={set('password')} required minLength={8} /></label>
        <label>Role
          <select value={f.role} onChange={set('role')}>
            <option value="institution_officer">Institution officer</option>
            <option value="station_staff">Station staff</option>
            <option value="admin">Administrator</option>
          </select>
        </label>
        {f.role === 'institution_officer' && (
          <label>Institution
            <select value={f.institutionId} onChange={set('institutionId')} required>
              <option value="">Select…</option>
              {(inst.data || []).map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </label>
        )}
        {f.role === 'station_staff' && (
          <label>Station (optional)
            <select value={f.stationId} onChange={set('stationId')}>
              <option value="">None</option>
              {stList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
        )}
        <div className="full"><button className="primary">Create account</button></div>
      </form>
      {msg && <div className="ok">{msg}</div>}
      {(err || staff.error) && <div className="error">{err || staff.error}</div>}
      <table>
        <thead><tr><th>Name</th><th>E-mail</th><th>Role</th><th>Institution</th><th>Active</th></tr></thead>
        <tbody>{(staff.data || []).map((s) => (
          <tr key={s.id}><td>{s.fullName}</td><td>{s.email}</td><td>{s.role}</td><td>{instName(s.institutionId)}</td><td>{s.isActive ? 'Yes' : 'No'}</td></tr>
        ))}</tbody>
      </table>
    </section>
  );
}
