import React from 'react';
import { api } from '../api.js';
import useLoad from './useLoad.js';

export default function Audit() {
  const { data, error, reload } = useLoad(api.audit);
  return (
    <section className="wide">
      <div className="bar"><h2>Audit log (latest 100)</h2><button className="ghost" onClick={reload}>Refresh</button></div>
      {error && <div className="error">{error}</div>}
      <table>
        <thead><tr><th>Time</th><th>Action</th><th>Entity</th><th>Actor</th></tr></thead>
        <tbody>{(data || []).map((a) => (
          <tr key={a.id}>
            <td>{new Date(a.createdAt).toLocaleString()}</td><td><code>{a.action}</code></td>
            <td>{a.entity}{a.entityId ? ` ${String(a.entityId).slice(0, 8)}` : ''}</td>
            <td>{a.staffId ? 'staff' : a.userId ? 'passenger' : 'system'}</td>
          </tr>
        ))}</tbody>
      </table>
    </section>
  );
}
