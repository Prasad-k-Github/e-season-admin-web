import React, { useState } from 'react';
import { api } from '../api.js';
import useLoad from './useLoad.js';

export default function Institutions() {
  const { data, error, reload } = useLoad(api.institutions);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function add(e) {
    e.preventDefault(); setErr(''); setMsg('');
    try {
      const r = await api.createInstitution(name.trim());
      setMsg(`Created "${r.name}". Organisation code: ${r.orgAuthCode} (give it to the institution; staff enter it when registering).`);
      setName(''); reload();
    } catch (x) { setErr(x.message); }
  }

  return (
    <section className="wide">
      <h2>Institutions</h2>
      <form className="inline" onSubmit={add}>
        <input placeholder="Institution name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        <button className="primary">Add institution</button>
      </form>
      {msg && <div className="ok">{msg}</div>}
      {(err || error) && <div className="error">{err || error}</div>}
      <table>
        <thead><tr><th>Name</th><th>Organisation code</th><th>Active</th></tr></thead>
        <tbody>{(data || []).map((i) => (
          <tr key={i.id}><td>{i.name}</td><td><code>{i.orgAuthCode}</code></td><td>{i.isActive ? 'Yes' : 'No'}</td></tr>
        ))}</tbody>
      </table>
    </section>
  );
}
