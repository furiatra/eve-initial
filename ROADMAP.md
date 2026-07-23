# EVE — Product Roadmap

Event & Operations Management Platform

---

## Status Key

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete |
| 🔄 | In Progress |
| 🔜 | Next Up |
| 📋 | Backlog |
| 💡 | Idea / Future |

---

## ✅ Phase 1 — Foundation (Complete)

### Infrastructure
- [x] Supabase project created and configured
- [x] PostgreSQL schema designed and deployed (10 tables)
- [x] Row Level Security (RLS) policies — admin, internal, supplier, operator roles
- [x] Auth trigger — auto-creates user profile on signup
- [x] Vercel deployment — live at eve-initial.vercel.app
- [x] GitHub repository — version controlled
- [x] Custom browser tab title (EVE)

### Database Schema
- [x] `events` table
- [x] `suppliers` table
- [x] `operators` table
- [x] `units` table (with `zoho_code` and `sub_type` fields)
- [x] `devices` table
- [x] `event_suppliers` junction table
- [x] `event_operators` junction table
- [x] `event_units` junction table
- [x] `device_deployments` table (scan in/out log)
- [x] `users` table (linked to Supabase Auth)
- [x] Database views: `event_overview`, `device_history`, `operator_financials`, `supplier_financials`

### Core App
- [x] Login screen with password reset
- [x] Auth gate — app only accessible when signed in
- [x] Role-aware session (admin, internal, supplier, operator)
- [x] Collapsible sidebar with hamburger menu
- [x] EVE branding in sidebar
- [x] Fixed breadcrumb bar (Event › Company › Type › Unit)
- [x] Dashboard with KPIs, upcoming events, operator counts, activity feed
- [x] Events list and detail view
- [x] Operators list and detail view (tabular unit display)
- [x] Devices list and detail view
- [x] Unit detail view
- [x] Cross-referenced drill-down navigation (click anything to see related data)
- [x] Settings page with Import section

### Data
- [x] CSV importer for Stem Data (operators + units bulk upload)
- [x] 46 operators imported
- [x] 453 units imported with Zoho codes and types
- [x] Type mapping (Attraction, Bar, Caterer, Ride, Payhub etc)

---

## 🔜 Phase 2 — Data Entry & Events (Next)

### Add / Edit Forms
- [ ] Create and edit Events
- [ ] Create and edit Operators
- [ ] Create and edit Units (linked to operator)
- [ ] Create and edit Devices (owned / rented / operator-owned)
- [ ] Assign operators to events
- [ ] Assign units to events
- [ ] Assign devices to units at events

### Events Module
- [ ] Create 9 annual events
- [ ] Event status management (draft → upcoming → active → completed)
- [ ] Operator assignments per event with agreed fee
- [ ] Unit assignments per event
- [ ] Event overview page (full breakdown of who and what is there)

### Filtering & Search
- [ ] Filter operators by event
- [ ] Filter units by event, operator, type
- [ ] Global search across operators, units, devices
- [ ] Hierarchy filter: Event › Operator › Type › Unit

---

## 📋 Phase 3 — Device Management

### Device Registry
- [ ] Register owned devices (serial, type, purchase cost)
- [ ] Register rented devices (serial, supplier, daily rate)
- [ ] Register operator-owned devices
- [ ] Device status tracking (available, deployed, returned, lost, damaged)
- [ ] QR code / barcode generation per device

### Scan In / Out
- [ ] Camera-based QR/barcode scanner (mobile-friendly)
- [ ] Scan out — deploy device to unit at event
- [ ] Scan in — return device, log timestamp and user
- [ ] Deployment log with full audit trail
- [ ] Real-time deployed vs available count on dashboard

---

## 📋 Phase 4 — Financials

### Operator Charges
- [ ] Set agreed fee per operator per event
- [ ] Device rental charges to operators (per day rate)
- [ ] Fee status tracking (pending → confirmed → invoiced → paid → disputed)
- [ ] Operator financial summary (what they owe across all events)
- [ ] Export operator charges to CSV

### Supplier Costs
- [ ] Log supplier costs per event
- [ ] Device rental costs from suppliers
- [ ] Supplier financial summary (what you owe across all events)
- [ ] Export supplier costs to CSV

### Reporting
- [ ] P&L per event (supplier costs vs operator income)
- [ ] Annual financial summary across all events
- [ ] Outstanding payments dashboard

---

## 📋 Phase 5 — Access & Collaboration

### Role-Based Views
- [ ] Operator portal — operators log in to view their own units and devices
- [ ] Supplier portal — suppliers view their own assignments and costs
- [ ] Internal view — other departments (read-only access to relevant data)
- [ ] Admin controls — manage users, assign roles, link users to operators/suppliers

### User Management
- [ ] Invite users by email (Supabase Auth invite flow)
- [ ] Assign role on invite
- [ ] Link user to specific operator or supplier
- [ ] Revoke access

---

## 📋 Phase 6 — Onsite Tools

### Event Day Features
- [ ] Onsite check-in — mark operator/unit as arrived
- [ ] Live event dashboard — real-time view of what's checked in
- [ ] Issue log — flag problems with units or devices during event
- [ ] Notes per deployment

### Notifications (Future)
- [ ] Alert when device not returned after event end
- [ ] Alert when operator fee overdue
- [ ] Daily summary email for active events

---

## 📋 Phase 7 — Integrations

### Zoho CRM
- [ ] Scoping — confirm which Zoho module and sync behaviour needed
- [ ] Operator sync (Zoho contacts → EVE operators)
- [ ] Unit sync (Zoho records → EVE units via Zoho code)
- [ ] Bi-directional or one-way TBD

### Finance Platform
- [ ] Scoping — confirm platform and API availability
- [ ] Company ID sync from finance platform to EVE operators
- [ ] Invoice generation or export

### SecuCo (Cash-in-Transit)
- [ ] Cash Management module (separate scoping required)
- [ ] Payment method registry
- [ ] Cash & currency counting log
- [ ] Reconciliation against SecuCo reports

---

## 💡 Future Ideas

- [ ] Gantt / timeline view of events across the year
- [ ] Site map / zone visualisation (units plotted on event map)
- [ ] Photo attachments per unit or device
- [ ] Mobile app (PWA or native) for onsite scanning
- [ ] Operator self-service — operators update their own unit details
- [ ] Historical analytics — year-on-year operator and device trends
- [ ] Supplier tender / procurement tracking
- [ ] Contract and document storage per operator

---

## Technical Debt & Infrastructure

- [ ] Custom domain (replace eve-initial.vercel.app)
- [ ] Migrate from seed/manual data to fully form-driven entry
- [ ] End-to-end testing
- [ ] Error monitoring (Sentry or similar)
- [ ] Automated database backups
- [ ] Staging environment (separate from production)
- [ ] Brand & design guidelines — apply once finalised

---

*Last updated: July 2026*
*Stack: React + Vite · Supabase (PostgreSQL) · Vercel*
