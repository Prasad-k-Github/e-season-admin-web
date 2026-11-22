const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const KEY = 'eseason_staff';

export const session = {
  get() { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; } },
  set(v) { sessionStorage.setItem(KEY, JSON.stringify(v)); },
  clear() { sessionStorage.removeItem(KEY); },
};

export class ApiError extends Error {
  constructor(status, code, message, details) { super(message); this.status = status; this.code = code; this.details = details; }
}

async function toError(res) {
  let body = null;
  try { body = await res.json(); } catch { /* not JSON */ }
  const e = body && body.error;
  const detail = e && e.details && e.details[0] ? `${e.details[0].message}` : null;
  return new ApiError(res.status, e?.code || 'error', detail || e?.message || `Request failed (${res.status})`, e?.details);
}

async function raw(path, opts = {}) {
  const s = session.get();
  const headers = { ...(opts.body ? { 'Content-Type': 'application/json' } : {}), ...(s ? { Authorization: `Bearer ${s.token}` } : {}) };
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, { ...opts, headers });
  } catch {
    throw new ApiError(0, 'network', 'Cannot reach the server. Is the backend running?');
  }
  if (res.status === 401 && s) { session.clear(); window.dispatchEvent(new Event('eseason:logout')); }
  if (!res.ok) throw await toError(res);
  return res;
}

const json = async (path, opts) => (await raw(path, opts)).json();
const post = (path, body) => json(path, { method: 'POST', body: JSON.stringify(body || {}) });

export const api = {
  login: (email, password) => post('/auth/staff/login', { email, password }),
  pendingUsers: () => json('/staff/users/pending'),
  userDetail: (id) => json(`/staff/users/${id}`),
  docBlobUrl: async (id, type) => URL.createObjectURL(await (await raw(`/staff/users/${id}/docs/${type}`)).blob()),
  institutionDecision: (id, decision, reason) => post(`/staff/users/${id}/institution-decision`, { decision, reason }),
  verificationDecision: (id, decision, reason) => post(`/staff/users/${id}/verification-decision`, { decision, reason }),
  pendingApplications: () => json('/staff/applications/pending'),
  applicationDecision: (id, decision, reason) => post(`/staff/applications/${id}/decision`, { decision, reason }),
  institutions: () => json('/admin/institutions'),
  createInstitution: (name) => post('/admin/institutions', { name }),
  staff: () => json('/admin/staff'),
  createStaff: (d) => post('/admin/staff', d),
  stations: () => json('/stations'),
  audit: (limit = 100) => json(`/admin/audit?limit=${limit}`),
};
