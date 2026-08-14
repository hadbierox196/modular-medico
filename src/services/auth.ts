import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "../firebase";
import { ensureUserProfile } from "./firestore";
import { useAppStore } from "../store/useAppStore";
import type { UserProfile } from "../types";

export function subscribeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function isMasterAdminCreds(email: string, password?: string) {
  const clean = email.trim().toLowerCase();
  const emailMatches = clean === "irfan@admin" || clean === "irfan@admin.com" || clean === "irfan@admin.pk";
  if (password === undefined) return emailMatches;
  return emailMatches && password === "admin123";
}

export function loginMasterAdmin() {
  const uid = "admin_master_irfan";
  const email = "Irfan@admin";
  const displayName = "Dr. Irfan (Master Admin)";
  const profile: UserProfile = {
    uid,
    displayName,
    email,
    createdAt: Date.now(),
    streak: 99,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    dailyGoalTarget: 50,
    dailyGoalDate: new Date().toISOString().slice(0, 10),
    dailyGoalCount: 50,
    premium: true,
    premiumExpiry: null,
  };
  useAppStore.getState().setAuthUser(uid, email, displayName);
  useAppStore.getState().setProfile(profile);
  useAppStore.getState().enterAdmin();
  return profile;
}

export async function signUp(name: string, email: string, password: string) {
  const cleanEmail = email.trim();
  const cleanName = name.trim();

  // If registering master admin credentials
  if (isMasterAdminCreds(cleanEmail, password)) {
    loginMasterAdmin();
    return {
      uid: "admin_master_irfan",
      email: "Irfan@admin",
      displayName: cleanName || "Dr. Irfan (Master Admin)",
    } as unknown as User;
  }

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
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

  // Check Master Admin Account
  if (isMasterAdminCreds(cleanEmail, password)) {
    loginMasterAdmin();
    return {
      uid: "admin_master_irfan",
      email: "Irfan@admin",
      displayName: "Dr. Irfan (Master Admin)",
    } as unknown as User;
  }

  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
  const displayName = cred.user.displayName || "";
  try {
    await ensureUserProfile(cred.user.uid, cred.user.email || cleanEmail, displayName);
  } catch (e) {
    console.warn("Firestore ensureUserProfile error on login:", e);
  }

  useAppStore.getState().setAuthUser(cred.user.uid, cred.user.email || cleanEmail, displayName || "Student");
  return cred.user;
}

/** Demo/Guest quick login for instant testing and seamless student access */
export function loginDemoUser(name = "Med Student", isPremium = false) {
  const uid = "demo_" + Math.random().toString(36).substring(2, 9);
  const email = "student@modularmedico.app";
  const profile: UserProfile = {
    uid,
    displayName: name,
    email,
    createdAt: Date.now(),
    streak: 4,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    dailyGoalTarget: 50,
    dailyGoalDate: new Date().toISOString().slice(0, 10),
    dailyGoalCount: 18,
    premium: isPremium,
    premiumExpiry: isPremium ? Date.now() + 30 * 86400000 : null,
  };
  useAppStore.getState().setAuthUser(uid, email, name);
  useAppStore.getState().setProfile(profile);
  return profile;
}

export async function logOut() {
  try {
    await signOut(auth);
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
    "auth/network-request-failed": "Network error — check your connection or use Quick Demo Sign-in below.",
    "auth/operation-not-allowed": "Email sign-up is not enabled in Firebase Console. You can use Quick Demo Student below!",
    "auth/admin-restricted-operation": "Sign-up is restricted by admin. Use Quick Demo Student below.",
    "auth/unauthorized-domain": "This domain is not authorized in Firebase Auth. Use Quick Demo Student below.",
    "auth/popup-closed-by-user": "Sign-in popup was closed before completion.",
  };
  return map[code] || (err instanceof Error ? err.message : "Authentication error. Please check your inputs or use Quick Demo Sign-in.");
}
