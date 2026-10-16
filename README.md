# Vigía SMS

[![CI](https://github.com/bohaz/sms-pilot/actions/workflows/ci.yml/badge.svg)](https://github.com/bohaz/sms-pilot/actions/workflows/ci.yml)

Safety Management System (SMS) for Venezuelan airline operators, built as a pilot to demo to prospective clients. It follows the structure of **RAV 5**, the Venezuelan regulation based on **ICAO Annex 19**: 4 components and 12 elements.

**Live demo:** [vigiasmspilot.vercel.app](https://vigiasmspilot.vercel.app/) · The interface is in Spanish, the language of its users. Demo data only; it resets from _Configuración_.

## What it does

| Module              | Purpose                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard           | Monthly traffic lights, residual risk matrix, alerts and recent activity                                                           |
| ASR and MOR reports | Voluntary and mandatory occurrence reports: intake, filters, analysis status, links to hazards, authority notification, CSV export |
| Hazards and risk    | Hazard register with initial and residual risk on the ICAO Doc 9859 matrix                                                         |
| Actions             | Corrective and preventive actions with owners, due dates, overdue tracking and mandatory closure evidence                          |
| Indicators          | Safety performance indicators (SPI) with traffic lights, trends and editable monthly data                                          |
| RAV 5 compliance    | Status and evidence for each of the 12 elements                                                                                    |
| Reports             | Period report ready to print or save as PDF, stamped with the audit log hash                                                       |
| Audit log           | Hash-chained log (SHA-256) with an integrity check                                                                                 |

### Tamper-evident audit log

Every change goes through the store and is written to the audit log. Each entry stores the SHA-256 hash of the previous one, so editing or deleting any past entry breaks the chain, and the integrity check reports exactly where. The demo includes a _Simular manipulación_ button to show it.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 3 · Zustand · Recharts · Vitest · ESLint · Prettier · GitHub Actions · Vercel

## Getting started

Requires Node.js 20 or later (see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script                        | What it does                                               |
| ----------------------------- | ---------------------------------------------------------- |
| `npm run dev`                 | Development server                                         |
| `npm run build` / `npm start` | Production build and server                                |
| `npm test`                    | Runs the test suite once (`test:watch` to keep it running) |
| `npm run lint`                | ESLint with the Next.js rules                              |
| `npm run typecheck`           | TypeScript without emitting files                          |
| `npm run format`              | Formats the code with Prettier                             |
| `npm run check`               | Lint, types, format check, tests and build (same as CI)    |

## Architecture

```
src/
├── app/            # One folder per module (App Router pages)
├── components/
│   ├── forms/      # One file per form; validation rules come from lib/
│   ├── ui.tsx      # Small design system: Button, Card, Modal, Table…
│   ├── Shell.tsx   # Layout, navigation and store hydration
│   └── …           # Charts and risk matrix
└── lib/            # Domain logic, framework-free and unit tested
    ├── types.ts        # Domain model
    ├── store.ts        # The only data access point (Zustand, persisted)
    ├── audit.ts        # Hash-chained audit log
    ├── sha256.ts       # Synchronous SHA-256 for the chain
    ├── risk.ts         # ICAO risk matrix
    ├── spi.ts          # Indicators and traffic-light criteria
    ├── codes.ts        # Record codes (ASR-2026-004, PEL-012, CAP-007)
    ├── validation.ts   # Form rules
    ├── format.ts       # Dates in local time, labels and CSV
    ├── tenant.ts       # Operator settings and RAV 5 catalog
    └── seed.ts         # Demo data, generated relative to today
```

Key decisions:

- **One data access point.** Pages never read storage directly; they call `store.ts`. The pilot persists to `localStorage`. Moving to a database means replacing the store's internals, not the screens.
- **Every write is audited.** The store appends to the audit log in the same update as the change, so no change skips the log.
- **Domain logic is plain TypeScript.** Risk, indicators, codes, validation and the audit chain don't import React or Next.js, which keeps them easy to test and to move to a server later.
- **Dates are local.** Due dates and "today" use the user's time zone. Using UTC would mark actions as overdue a day early in the evening in Venezuela (UTC-4).
- **Operator settings are isolated** in `tenant.ts`, as the starting point for multi-tenant support.

## Testing

```bash
npm test
```

71 tests cover the domain logic:

- **SHA-256** checked against `node:crypto`, including block-boundary and multi-byte cases.
- **Audit chain:** linking, and detection of edited, deleted and forged entries.
- **Risk matrix:** sample cells and the full 25-cell distribution.
- **Indicators:** traffic-light thresholds, monthly counts, missing data.
- **Dates:** run in `America/Caracas` to catch UTC off-by-one errors.
- **Codes, validation, demo data invariants and store actions**, including that the audit chain stays valid after a series of changes.

CI runs lint, type check, format check, tests and build on every pull request.

## Road to production

1. Database and authentication: Supabase (Postgres) with row-level security and one organization per operator.
2. Roles: SMS manager, area head, auditor, read-only.
3. Server-side audit log in append-only tables, with the hash chain computed on the server.
4. Attachments, due-date email reminders and electronic signature for reports.
5. Safety targets configurable per operator.

## Regulatory note

The component and element structure follows what INAC has published for RAV 5. Traffic-light thresholds, notification deadlines and reporting criteria are sample values and must be validated against the current edition of RAV 5 with an aviation compliance specialist before production use.

## Author

Ricardo Martínez · [Portfolio](https://ricardomartinez.vercel.app/) · [GitHub](https://github.com/bohaz)
