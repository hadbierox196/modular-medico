# Modular Medico

A React + TypeScript + Vite + Tailwind MCQ practice app for MBBS students (Anatomy, Biochemistry, Physiology,
Pathology, Pharmacology), with a real Firebase backend, a block-based content system (Block 1–15 per module),
and a Premium paywall wired for JazzCash/Easypaisa.

## Stack

- **React 19 + TypeScript + Vite**, **React Router v7**, **Tailwind CSS v3**, **Zustand** for local UI state
- **Firebase Auth** (email/password) + **Firestore** (profiles, streaks, attempts, bookmarks, content, payments)
- **Cloud Functions** (2nd gen) for JazzCash/Easypaisa hosted-checkout requests and payment callbacks
- **recharts** for the weak-topic accuracy chart, **lucide-react** for icons

Fonts: **Baloo 2** (display), **Plus Jakarta Sans** (body), **JetBrains Mono** (scores/stats).

---

## 1. Run the app locally (frontend only, no payments yet)

```bash
npm install
npm run dev        # http://localhost:5173
```

The Firebase config in `src/firebase.ts` already points at your `sewask-e3b44` project, so **Auth and
Firestore work immediately** — you just need to turn on the right things in the Firebase console first (next
section). The app will run and let you sign up/log in even before you've deployed anything else; you just won't
have any content or a working paywall until you complete the steps below.

---

## 2. Firebase console setup (one-time)

Go to [console.firebase.google.com](https://console.firebase.google.com) → your `sewask-e3b44` project:

1. **Authentication** → Sign-in method → enable **Email/Password**.
2. **Firestore Database** → Create database (production mode, pick a region close to Pakistan e.g. `asia-south1`).
3. Deploy the security rules and indexes in this repo:
   ```bash
   npm install -g firebase-tools   # if you don't have it
   firebase login
   firebase deploy --only firestore:rules,firestore:indexes
   ```
   (`.firebaserc` already points at `sewask-e3b44`.)

Firestore data model:

```
users/{uid}                        displayName, email, streak, lastActiveDate,
                                    dailyGoalTarget, dailyGoalCount, dailyGoalDate,
                                    premium, premiumExpiry
users/{uid}/attempts/{id}          subjectId, moduleName, block, total, correct, scorePct, createdAt
users/{uid}/bookmarks/{id}         subjectId, moduleName, block, question, createdAt
modules/{id}                       subjectId, name, order
questions/{id}                     subjectId, moduleId, moduleName, block (1–15), difficulty,
                                    q, options[4], correct, explanation, status (draft|published)
payments/{txnRef}                  uid, provider, plan, amount, status — written only by Cloud Functions
```

---

## 3. Make yourself an admin

The admin panel (`/admin-gate` → `/admin`, not linked from the homepage) has a client-side password prompt
(default: `admin`) as a UI convenience, but the **real** permission check is a Firestore rule requiring your
signed-in account to carry the `admin` custom claim. To grant it to the first admin:

1. Firebase Console → Project settings → Service accounts → **Generate new private key**.
   Save the file as `scripts/serviceAccountKey.json` (already gitignored — never commit it).
2. ```bash
   node scripts/setAdminClaim.mjs you@example.com
   ```
3. Log out and back in on that account in the app.

Once you have one admin, that account can grant others admin access from inside the app via the
`grantAdminClaim` Cloud Function (once functions are deployed) instead of re-running the script.

## 4. Seed some starter content (optional but recommended)

With `scripts/serviceAccountKey.json` in place:

```bash
node scripts/seedFirestore.mjs
```

This publishes a handful of real questions into Block 1 of one module per subject, so the app isn't empty the
first time you open it. Everything else you add from the admin panel.

---

## 5. Admin panel — adding content

`/admin` has four tabs:

- **Dashboard** — published/draft counts per subject.
- **Add question** — pick Subject → Module (or type a new one) → Block (1–15) → difficulty tag (easy/medium/hard),
  then fill in the question, 4 options (tap a letter to mark the correct one), and an explanation. Saves as a
  **draft**.
- **Bulk import** — same Subject/Module/Block/difficulty context, then paste multiple questions in one go using:
  ```
  [Question text ; Option A | Option B | *Option C | Option D]
  ```
  (the `*` marks the correct option). Validates before importing — flags missing/extra options, missing or
  duplicate correct-answer markers, and possible duplicate questions already in that subject.
- **Question bank** — search/filter everything by subject/module/block/status, publish/unpublish, or delete.

Nothing is visible to students until you flip it from **draft** to **published**.

---

## 6. The repeating-quiz bug — what was wrong and what changed

Previously, every wrong answer (with spaced repetition on) re-inserted that question later in the queue with no
limit — if a learner kept missing the same question, it could keep resurfacing indefinitely, which is what
"never stops / keeps repeating" was. Now:

- Each question can be **requeued at most once**, so a set is mathematically guaranteed to end.
- There's a visible **"End now"** control during practice as a manual escape hatch regardless.
- Finishing a set (naturally, via timer, or via "End now") always writes the attempt to Firestore and navigates
  to `/results`.

---

## 7. Premium paywall (JazzCash / Easypaisa)

**This part needs your own merchant accounts before it can process real payments** — payment gateway secrets
can never live in frontend code, so this is implemented as Cloud Functions that build a signed checkout request
server-side and redirect the browser to the gateway's hosted payment page, then verify the callback server-side
before marking a user premium. See `functions/index.js` for the full implementation and inline comments, and
`functions/README.md` for deployment steps and exactly which secrets to set.

**Important:** the field names and hash algorithm in `functions/index.js` are built from JazzCash's and
Easypaisa's publicly documented Hosted Checkout integration patterns, but each gives you the *exact* current
field list only after merchant onboarding — verify against the guide your merchant dashboard provides before
going live, and test everything in their sandbox environments first (both flagged via the `SANDBOX` constant).

Until you deploy the functions and add real credentials, tapping "Pay with JazzCash/Easypaisa" on `/paywall`
will fail gracefully with an explanatory message instead of crashing.

---

## 8. Project structure

```
src/
  firebase.ts                 Firebase app/auth/firestore/functions init (your config)
  theme.ts, types.ts           Design tokens, shared TypeScript types
  data/subjects.ts             Fixed 5-subject list + Block count constant
  services/
    auth.ts                    Firebase Auth (signup/login/logout)
    firestore.ts                User profile, streak/daily-goal logic, attempts, bookmarks
    adminContent.ts             Modules + questions CRUD (admin panel + student fetches)
    payments.ts                  Calls the Cloud Functions, redirects to the gateway
  store/useAppStore.ts          Zustand — theme, auth mirror, quiz session (persisted), last result
  components/                  Shell (student nav), AdminLayout, Card, Btn, Pill, Segmented, Toggle…
  pages/                       One file per route — see App.tsx for the route map

functions/                     Cloud Functions (JazzCash/Easypaisa checkout + callbacks, admin claim grant)
scripts/                       setAdminClaim.mjs, seedFirestore.mjs (both need serviceAccountKey.json)
firestore.rules                Security rules (owner-only user data, admin-only content writes)
firestore.indexes.json          Composite indexes the block/module queries need
firebase.json, .firebaserc      Firebase project config
```

## 9. Deploying

```bash
npm run build
firebase deploy --only hosting,firestore:rules,firestore:indexes
firebase deploy --only functions   # after setting secrets — see functions/README.md
```
