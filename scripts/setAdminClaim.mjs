/**
 * Grants the `admin` custom claim to a Firebase Auth user by email.
 *
 * This is what actually makes the admin panel's writes work — the client-side
 * password gate in the app is just a UI convenience. Firestore rules only allow
 * writes to `modules`/`questions` from a signed-in user whose ID token carries
 * `admin: true`, and only this script (or the `grantAdminClaim` Cloud Function, once
 * you have at least one admin) can set that.
 *
 * Setup:
 *   1. Firebase Console → Project settings → Service accounts → Generate new private key.
 *      Save the downloaded file as scripts/serviceAccountKey.json (already gitignored —
 *      never commit it).
 *   2. npm install firebase-admin --no-save   (from the project root, if not already installed)
 *   3. node scripts/setAdminClaim.mjs you@example.com
 *   4. Log out and back in on that account in the app (or wait ~1hr for the ID token
 *      to refresh) so the new claim takes effect.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const __dirname = dirname(fileURLToPath(import.meta.url));
const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/setAdminClaim.mjs <email>");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(join(__dirname, "serviceAccountKey.json"), "utf8"));
} catch {
  console.error(
    "Missing scripts/serviceAccountKey.json. Download it from Firebase Console → Project settings → " +
      "Service accounts → Generate new private key, and save it at that path."
  );
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });

console.log(`✅ Granted admin claim to ${email} (uid: ${user.uid})`);
console.log("Log out and back in on that account in the app for it to take effect.");
