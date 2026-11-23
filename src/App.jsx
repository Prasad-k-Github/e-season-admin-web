import React, { useEffect, useState } from 'react';
import { session } from './api.js';
import Login from './pages/Login.jsx';
import Queue from './pages/Queue.jsx';
import Applications from './pages/Applications.jsx';
import Institutions from './pages/Institutions.jsx';
import StaffPage from './pages/Staff.jsx';
import Audit from './pages/Audit.jsx';

const ROLE_LABEL = { admin: 'Administrator', institution_officer: 'Institution officer', station_staff: 'Station staff' };

function tabsFor(role) {
  if (role === 'admin') {
    return [['queue', 'Identity checks', Queue], ['institutions', 'Institutions', Institutions],
      ['staff', 'Staff accounts', StaffPage], ['audit', 'Audit log', Audit]];
  }
  if (role === 'institution_officer') {
    return [['queue', 'Employee approvals', Queue], ['apps', 'Season applications', Applications]];
  }
  return [['none', 'Not available', () => (
    <p className="muted">Station staff use the station app. This web console is for administrators and institution officers.</p>
  )]];
}

export default function App() {
  const [user, setUser] = useState(() => session.get());
  const [tab, setTab] = useState(null);

  useEffect(() => {
    const off = () => setUser(null);
    window.addEventListener('eseason:logout', off);
    return () => window.removeEventListener('eseason:logout', off);
  }, []);

  if (!user) return <Login onLogin={(s) => { session.set(s); setUser(s); setTab(null); }} />;

  const role = user.staff.role;
  const tabs = tabsFor(role);
  const active = tabs.find((t) => t[0] === tab) || tabs[0];
  const Page = active[2];

  return (
    <div className="shell">
      <header className="top">
        <div className="brand"><img src="/train_logo.png" alt="" />E-Season <span>Admin</span></div>
        <nav>
          {tabs.map(([key, label]) => (
            <button key={key} className={key === active[0] ? 'tab on' : 'tab'} onClick={() => setTab(key)}>{label}</button>
          ))}
        </nav>
        <div className="who">
          <div><strong>{user.staff.fullName}</strong><small>{ROLE_LABEL[role] || role}</small></div>
          <button className="ghost" onClick={() => { session.clear(); setUser(null); }}>Sign out</button>
        </div>
      </header>
      <main><Page role={role} /></main>
    </div>
  );
}
