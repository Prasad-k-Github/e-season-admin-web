# E-Season Admin Web

React (Vite) console for the E-Season backend. Free to run: everything is local.

| Role | What they see |
|---|---|
| Administrator | Identity checks (NIC + photo review, approve/reject), institutions (creates the organisation code), staff accounts, audit log |
| Institution officer | Employee confirmations for their institution, season application approvals |

Station staff use the station app, not this console.

## Run locally

1. Start the backend (see the `e-season-backend` README) on port 3000.
2. Create an admin account in the backend folder: `node scripts/create-admin.js admin@example.com "Admin#1234" "Admin"`
3. In this folder:
   ```
   npm install
   cp .env.example .env     # Windows: copy .env.example .env
   npm run dev
   ```
4. Open http://localhost:5173 and sign in.

`VITE_API_URL` in `.env` points to the backend (default `http://localhost:3000`).

## Demo flow
1. Admin: **Institutions** → add an institution (note the organisation code); **Staff accounts** → create an institution officer for it.
2. Passenger app: register (government passengers use the organisation code).
3. Officer: **Employee approvals** → confirm. Admin: **Identity checks** → review documents → verify.

## Notes
- The sign-in token is kept in `sessionStorage` (cleared when the tab closes).
- Identity documents are fetched with the staff token and shown as temporary blobs; approving deletes the NIC images on the server.
- Build for hosting: `npm run build` (static files in `dist/`).
