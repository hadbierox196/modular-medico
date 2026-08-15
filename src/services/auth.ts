import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "../firebase";
import { ensureUserProfile } from "./firestore";
import { useAppStore } from "../store/useAppStore";
import type { UserProfile } from "../types";

export function subscribeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function signUp(name: string, email: string, password: string) {
  const cleanEmail = email.trim();
  const cleanName = name.trim();

  const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), cleanEmail, password);
  if (cleanName) {
    try {
      await updateProfile(cred.user, { displayName: cleanName });
    } catch (e) {
      console.warn("Could not update auth profile displayName:", e);
    }
  }
  try {
    await ensureUserProfile(cred.user.uid, cleanEmail, cleanName);
  } catch (e) {
    console.warn("Firestore profile initialization skipped or offline:", e);
  }

  const initialProfile: UserProfile = {
    uid: cred.user.uid,
    displayName: cleanName || "Student",
    email: cleanEmail,
    createdAt: Date.now(),
    streak: 0,
    lastActiveDate: null,
    dailyGoalTarget: 50,
    dailyGoalDate: null,
    dailyGoalCount: 0,
    premium: false,
    premiumExpiry: null,
  };
  useAppStore.getState().setAuthUser(cred.user.uid, cleanEmail, cleanName || "Student");
  useAppStore.getState().setProfile(initialProfile);

  return cred.user;
}

export async function logIn(email: string, password: string) {
  const cleanEmail = email.trim();

  const cred = await signInWithEmailAndPassword(getFirebaseAuth(), cleanEmail, password);
  const displayName = cred.user.displayName || "";
  try {
    await ensureUserProfile(cred.user.uid, cred.user.email || cleanEmail, displayName);
  } catch (e) {
    console.warn("Firestore ensureUserProfile error on login:", e);
  }

  useAppStore.getState().setAuthUser(cred.user.uid, cred.user.email || cleanEmail, displayName || "Student");
  return cred.user;
}

export async function logOut() {
  try {
    await signOut(getFirebaseAuth());
  } catch (e) {
    console.warn("Firebase signOut error:", e);
  }
  useAppStore.getState().setAuthUser(null, null, "");
  useAppStore.getState().setProfile(null);
}

/** Human-readable message for the most common Firebase Auth error codes. */
export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  const map: Record<string, string> = {
    "auth/email-already-in-use": "That email is already registered — please log in instead.",
    "auth/invalid-email": "Please enter a valid email address (e.g. name@example.com).",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Please check your credentials.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many failed attempts. Please wait a minute before trying again.",
    "auth/network-request-failed": "Network error — please check your connection and try again.",
    "auth/operation-not-allowed": "Email sign-up is not enabled in Firebase Console. Please contact support.",
    "auth/admin-restricted-operation": "Sign-up is currently restricted. Please contact support.",
    "auth/unauthorized-domain": "This domain is not authorized in Firebase Auth.",
    "auth/popup-closed-by-user": "Sign-in popup was closed before completion.",
  };
  return map[code] || (err instanceof Error ? err.message : "Authentication error. Please check your inputs and try again.");
}
