# Modular Medico — Phase 1 web app

A React + TypeScript + Vite + Tailwind implementation of the Modular Medico MCQ practice app, using mock data
(no backend wired up yet). Built to hand off to a developer or continue in Claude Code.

## Stack

- **React 19 + TypeScript + Vite** — app shell and build tooling
- **React Router v7** — real client-side routes (see `src/App.tsx`)
- **Zustand** (with `persist`) — global state: theme, mock auth, admin question bank, bookmarks, and the
  in-progress quiz session (so a page refresh doesn't lose your place)
- **Tailwind CSS v3** — layout/spacing utilities; brand colors and both dark/light palettes live in `src/theme.ts`
  and are applied via inline styles so the whole palette can be swapped in one place
- **lucide-react** — icons
- **recharts** — the weak-topic accuracy bar chart on the profile page

Fonts: **Baloo 2** (display), **Plus Jakarta Sans** (body), **JetBrains Mono** (scores/stats), loaded via Google
Fonts in `index.html`.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build      # production build to dist/
npm run preview    # serve the production build locally
```

## Project structure

```
src/
  theme.ts              Design tokens (dark/light palettes, font stacks)
  types.ts               Shared TypeScript interfaces
  data/mockData.ts       Subjects → modules → sets → questions (mock content)
  utils/parseBracketFormat.ts   Real parser/validator for the admin bulk-import format
  store/useAppStore.ts   Zustand store — theme, auth, admin bank, bookmarks, quiz session
  components/            Shared UI: Shell (nav), AdminLayout, Card, Btn, Pill, Segmented, Toggle, etc.
  pages/                 One file per route (see App.tsx for the route map)
```

## What's real vs. mocked

**Real logic:**
- Spaced-repetition queue (wrong answers reinsert 5–10 questions later in the same session)
- Bracket-format MCQ parser with validation (option count, single correct-answer marker, duplicate detection)
- Session persistence to `localStorage` via Zustand's `persist` middleware
- Traditional vs. OMR practice modes are functionally different (OMR withholds feedback until the set ends)

**Mocked (no backend):**
- Login/signup accepts any input and just sets `isLoggedIn: true` locally
- Admin gate password is the literal string `admin`
- Streak, daily goal, and weak-topic chart are static sample data
- Only Anatomy → Upper Limb → "Brachial Plexus Basics" has full question content; other sets show as locked or
  "coming soon" placeholders

## Admin panel

Reached only via the small "Staff / admin access" link in the sidebar/menu — **not** linked from the homepage or
main student navigation, and rendered outside the student `Shell` layout entirely (`/admin-gate`, `/admin`).

## Next steps for a real backend

- Swap the Zustand mock-auth actions for real Supabase (or similar) auth calls
- Replace `src/data/mockData.ts` with API calls / a database-backed content layer
- Wire the admin bulk-import commit action to actually persist to that database
- Add real analytics events behind the streak/goal/heatmap UI
