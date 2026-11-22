import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import useLoad from './useLoad.js';
import DecisionBox from './DecisionBox.jsx';

const DOC_LABEL = { photo: 'Passenger photo', nic_front: 'NIC front', nic_back: 'NIC back' };
const fmt = (d) => (d ? new Date(d).toLocaleString() : '');

function Doc({ userId, type }) {
  const [src, setSrc] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    let url; let dead = false;
    api.docBlobUrl(userId, type).then((u) => { url = u; if (!dead) setSrc(u); }).catch((e) => !dead && setErr(e.message));
    return () => { dead = true; if (url) URL.revokeObjectURL(url); };
  }, [userId, type]);
  return (
    <figure className="doc">
      <figcaption>{DOC_LABEL[type] || type}</figcaption>
      {src ? <a href={src} target="_blank" rel="noreferrer"><img src={src} alt={DOC_LABEL[type]} /></a>
        : <div className="muted">{err || 'Loading…'}</div>}
    </figure>
  );
}

function Detail({ id, role, onDone }) {
  const load = useCallback(() => api.userDetail(id), [id]);
  const { data: u, error } = useLoad(load);
  if (error) return <div className="error">{error}</div>;
  if (!u) return <p className="muted">Loading…</p>;

  const decide = async (decision, reason) => {
    if (role === 'admin') await api.verificationDecision(id, decision, reason);
    else await api.institutionDecision(id, decision, reason);
    onDone();
  };

  return (
    <div className="detail">
      <h2>{u.fullName}</h2>
      <dl>
        <dt>Passenger type</dt><dd>{u.passengerType}</dd>
        <dt>Phone</dt><dd>{u.phone}</dd>
        <dt>NIC</dt><dd>•••••{u.nicLast4}</dd>
        {u.institution && (<><dt>Institution</dt><dd>{u.institution}</dd></>)}
        {u.employeeNo && (<><dt>Employee no.</dt><dd>{u.employeeNo}</dd></>)}
        {u.designation && (<><dt>Designation</dt><dd>{u.designation}</dd></>)}
        <dt>Submitted</dt><dd>{fmt(u.submittedAt)}</dd>
      </dl>
      {role === 'admin' ? (
        <>
          <p className="hint">Compare the NIC images with the passenger photo and the name above. Approving deletes the NIC images.</p>
          <div className="docs">{u.documents.map((d) => <Doc key={d.type} userId={id} type={d.type} />)}</div>
        </>
      ) : (
        <p className="hint">Confirm this person is an employee of your institution. Identity documents are checked later by the administrator.</p>
      )}
      <DecisionBox onDecide={decide} approveLabel={role === 'admin' ? 'Verify identity' : 'Confirm employee'} />
    </div>
  );
}

export default function Queue({ role }) {
  const { data, error, loading, reload } = useLoad(api.pendingUsers);
  const [sel, setSel] = useState(null);
  const list = data || [];

  return (
    <div className="split">
      <section className="list">
        <div className="bar">
          <h2>{role === 'admin' ? 'Waiting for identity check' : 'Waiting for employee confirmation'} <span className="count">{list.length}</span></h2>
          <button className="ghost" onClick={reload}>Refresh</button>
        </div>
        {error && <div className="error">{error}</div>}
        {loading && !data && <p className="muted">Loading…</p>}
        {data && list.length === 0 && <p className="muted">Nothing waiting. 🎉</p>}
        {list.map((u) => (
          <button key={u.id} className={sel === u.id ? 'row-item on' : 'row-item'} onClick={() => setSel(u.id)}>
            <strong>{u.fullName}</strong>
            <small>{u.passengerType}{u.institution ? ` · ${u.institution}` : ''} · {fmt(u.submittedAt)}</small>
          </button>
        ))}
      </section>
      <section className="pane">
        {sel ? <Detail key={sel} id={sel} role={role} onDone={() => { setSel(null); reload(); }} />
          : <p className="muted">Select a passenger from the list.</p>}
      </section>
    </div>
  );
}
