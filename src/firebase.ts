import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration.
// NOTE: these are public client identifiers (not secrets) — it's normal and expected
// for them to live in frontend code / the built JS bundle. Access control is enforced
// by Firestore security rules (see firestore.rules) and by Cloud Functions, not by
// hiding this object. They're still pulled from env vars (rather than hardcoded) so
// each environment (local/staging/prod) can point at its own Firebase project.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // Fails loudly at startup instead of a cryptic Firebase SDK error later.
  throw new Error(
    "Missing Firebase config. Set VITE_FIREBASE_* environment variables — see .env.example."
  );
}

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Analytics only works in a real browser (not SSR / not this build step), and some
// ad-blockers or privacy modes will throw when it tries to initialize — so it's
// loaded lazily and failures are swallowed rather than crashing the app.
export async function initAnalytics() {
  if (typeof window === "undefined") return null;
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (await isSupported()) {
      return getAnalytics(app);
    }
  } catch {
    // analytics is non-critical — ignore failures (blocked script, unsupported env, etc.)
  }
  return null;
}
