import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration.
// NOTE: these are public client identifiers (not secrets) — it's normal and expected
// for them to live in frontend code. Access control is enforced by Firestore
// security rules (see firestore.rules) and by Cloud Functions, not by hiding this object.
const firebaseConfig = {
  apiKey: "AIzaSyDS3K9EKXiBcXux7H70EPdCFM7-_ZclLKc",
  authDomain: "sewask-e3b44.firebaseapp.com",
  databaseURL: "https://sewask-e3b44-default-rtdb.firebaseio.com",
  projectId: "sewask-e3b44",
  storageBucket: "sewask-e3b44.firebasestorage.app",
  messagingSenderId: "1060036881709",
  appId: "1:1060036881709:web:a6e5afd2c799b0ee9177a4",
  measurementId: "G-SYELD4CCST",
};

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
