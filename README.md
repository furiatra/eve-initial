# EventMaster

Event & Operations Management App — Vite + React + Supabase

## First-time setup

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Then open http://localhost:5173 in your browser.

## Project structure

```
src/
  lib/
    supabase.js       # Supabase client (reads from .env)
    AuthContext.jsx   # Auth state — session, profile, role
  hooks/
    useData.js        # All Supabase queries + db mutation helpers
  pages/
    Login.jsx         # Login + password reset
    Dashboard.jsx
    EventsList.jsx / EventDetail.jsx
    SuppliersList.jsx / SupplierDetail.jsx
    OperatorsList.jsx / OperatorDetail.jsx
    DevicesList.jsx  / DeviceDetail.jsx
    UnitDetail.jsx
  App.jsx             # Root — auth gate, nav, shared UI primitives
  main.jsx            # React entry point
  index.css           # Tailwind + global styles
```

## Environment variables

Credentials live in `.env` (never commit this file):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Creating your first admin user

1. Go to Supabase Dashboard → Authentication → Users → Add user
2. Enter the email + password for your admin account
3. The `handle_new_auth_user` trigger will auto-create a `users` row with role `internal`
4. Promote to admin in Supabase Dashboard → Table Editor → users → edit the role to `admin`

## Building for production

```bash
npm run build
# Output goes to /dist — deploy to Vercel, Netlify, or any static host
```
