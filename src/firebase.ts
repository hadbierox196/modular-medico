import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import appletConfig from "../firebase-applet-config.json";

// Your web app's Firebase configuration.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey || "AIzaSyC0aQvNi5whi1vpFMgR6DJwfLeVPWR3OPE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || "omega-exchange-mxctm.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || "omega-exchange-mxctm",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || "omega-exchange-mxctm.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || "37565147035",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId || "1:37565147035:web:a8113400f7b8f01f39233e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || appletConfig.measurementId || "",
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let _auth = null;
export function getFirebaseAuth() {
  if (!_auth) _auth = getAuth(app);
  return _auth;
}

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
