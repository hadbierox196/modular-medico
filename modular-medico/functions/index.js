/**
 * Modular Medico — payment Cloud Functions
 * ==========================================
 *
 * Implements the "build a signed request server-side, redirect the browser to the
 * gateway's hosted checkout page, verify the callback server-side" pattern that both
 * JazzCash and Easypaisa require — their merchant secrets can never be exposed to the
 * browser, so this can't be done as a pure client-side integration.
 *
 * IMPORTANT — before this works for real payments you must:
 *   1. Get merchant credentials from JazzCash and/or Easypaisa business onboarding.
 *   2. Set them as function secrets (see functions/README.md for exact commands).
 *   3. Verify the field names / hash algorithm below against the CURRENT JazzCash and
 *      Easypaisa integration guides your merchant dashboard gives you — payment
 *      gateway APIs occasionally change field names or add fields, and the exact spec
 *      is only handed out after merchant sign-up, so treat this file as a correctly
 *      *shaped* starting point, not a guaranteed-current spec.
 *   4. Deploy on the Blaze (pay-as-you-go) plan — outbound calls to payment gateways
 *      and callback endpoints require it; the free Spark plan can't do this.
 */

const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

/* ------------------------------------------------------------------ */
/* Secrets — set these with `firebase functions:secrets:set NAME`      */
/* ------------------------------------------------------------------ */
const JAZZCASH_MERCHANT_ID = defineSecret("JAZZCASH_MERCHANT_ID");
const JAZZCASH_PASSWORD = defineSecret("JAZZCASH_PASSWORD");
const JAZZCASH_INTEGRITY_SALT = defineSecret("JAZZCASH_INTEGRITY_SALT");
const EASYPAISA_STORE_ID = defineSecret("EASYPAISA_STORE_ID");
const EASYPAISA_HASH_KEY = defineSecret("EASYPAISA_HASH_KEY");
/** Where to send the user's browser back to after payment (your deployed app URL). */
const APP_BASE_URL = defineSecret("APP_BASE_URL");

// Flip to false only once you have real merchant credentials and have swapped the
// sandbox URLs below for the production ones your merchant dashboard gives you.
const SANDBOX = true;

const JAZZCASH_CHECKOUT_URL = SANDBOX
  ? "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/"
  : "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

const EASYPAISA_CHECKOUT_URL = SANDBOX
  ? "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf"
  : "https://easypay.easypaisa.com.pk/easypay/Index.jsf";

const PLAN_AMOUNTS_PKR = { monthly: 499, yearly: 3999 };

function assertSignedIn(request) {
  if (!request.auth) throw new HttpsError("unauthenticated", "You must be signed in.");
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

/** yyyyMMddHHmmss, required format for both gateways' date/time fields. */
function formatDateTime(date) {
  return (
    date.getFullYear().toString() +
    pad2(date.getMonth() + 1) +
    pad2(date.getDate()) +
    pad2(date.getHours()) +
    pad2(date.getMinutes()) +
    pad2(date.getSeconds())
  );
}

/* ------------------------------------------------------------------ */
/* JazzCash — Hosted Checkout Page                                     */
/* ------------------------------------------------------------------ */

function jazzCashSecureHash(fields, integritySalt) {
  // JazzCash: sort pp_* keys alphabetically (excluding pp_SecureHash itself), join
  // their VALUES with '&', prefix with "<IntegritySalt>&", then HMAC-SHA256 with the
  // Integrity Salt as the key, hex-encoded, uppercase.
  const sortedKeys = Object.keys(fields)
    .filter((k) => k !== "pp_SecureHash" && fields[k] !== "" && fields[k] !== undefined && fields[k] !== null)
    .sort();
  const concatenated = sortedKeys.map((k) => fields[k]).join("&");
  const hashInput = `${integritySalt}&${concatenated}`;
  return crypto.createHmac("sha256", integritySalt).update(hashInput).digest("hex").toUpperCase();
}

exports.createJazzCashCheckout = onCall(
  { secrets: [JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD, JAZZCASH_INTEGRITY_SALT, APP_BASE_URL] },
  async (request) => {
    assertSignedIn(request);
    const { uid, plan } = request.data || {};
    if (request.auth.uid !== uid) throw new HttpsError("permission-denied", "uid mismatch.");
    if (!PLAN_AMOUNTS_PKR[plan]) throw new HttpsError("invalid-argument", "Unknown plan.");

    const amountPkr = PLAN_AMOUNTS_PKR[plan];
    const now = new Date();
    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const txnRefNo = `MM${Date.now()}`;

    // Record the pending transaction ourselves rather than trusting whatever the
    // gateway echoes back, so the callback only needs to verify the hash + look up
    // this doc to know which user/plan to grant.
    await db.collection("payments").doc(txnRefNo).set({
      uid,
      provider: "jazzcash",
      plan,
      amount: amountPkr,
      status: "initiated",
      createdAt: Date.now(),
    });

    const fields = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: JAZZCASH_MERCHANT_ID.value(),
      pp_Password: JAZZCASH_PASSWORD.value(),
      pp_TxnRefNo: txnRefNo,
      pp_Amount: String(amountPkr * 100), // JazzCash wants paisas (amount * 100), no decimal point
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: formatDateTime(now),
      pp_TxnExpiryDateTime: formatDateTime(expiry),
      pp_BillReference: "modularmedico",
      pp_Description: `Modular Medico Premium (${plan})`,
      pp_ReturnURL: `${process.env.FUNCTION_URL_BASE || ""}jazzcashCallback`,
      pp_SubMerchantID: "",
      pp_BankID: "",
      pp_ProductID: "",
    };
    fields.pp_SecureHash = jazzCashSecureHash(fields, JAZZCASH_INTEGRITY_SALT.value());

    return { actionUrl: JAZZCASH_CHECKOUT_URL, fields };
  }
);

exports.jazzcashCallback = onRequest(
  { secrets: [JAZZCASH_INTEGRITY_SALT, APP_BASE_URL] },
  async (req, res) => {
    try {
      const fields = req.body || {};
      const receivedHash = fields.pp_SecureHash;
      const expectedHash = jazzCashSecureHash(fields, JAZZCASH_INTEGRITY_SALT.value());
      const txnRefNo = fields.pp_TxnRefNo;
      const success = receivedHash === expectedHash && fields.pp_ResponseCode === "000";

      if (txnRefNo) {
        const paymentRef = db.collection("payments").doc(txnRefNo);
        const paymentSnap = await paymentRef.get();
        if (paymentSnap.exists && success) {
          const { uid, plan } = paymentSnap.data();
          const months = plan === "yearly" ? 12 : 1;
          await db.collection("users").doc(uid).set(
            { premium: true, premiumExpiry: Date.now() + months * 30 * 24 * 60 * 60 * 1000 },
            { merge: true }
          );
          await paymentRef.set({ status: "success", completedAt: Date.now() }, { merge: true });
        } else if (paymentSnap.exists) {
          await paymentRef.set({ status: "failed", completedAt: Date.now() }, { merge: true });
        }
      } else {
        logger.warn("JazzCash callback missing pp_TxnRefNo", fields);
      }

      res.redirect(`${APP_BASE_URL.value()}/profile?payment=${success ? "success" : "failed"}`);
    } catch (err) {
      logger.error("jazzcashCallback error", err);
      res.redirect(`${APP_BASE_URL.value()}/profile?payment=error`);
    }
  }
);

/* ------------------------------------------------------------------ */
/* Easypaisa — hosted checkout (Index.jsf)                             */
/* ------------------------------------------------------------------ */

function easypaisaHash(fields, hashKey) {
  // Easypaisa: sort field keys alphabetically (excluding the hash field itself), build
  // a "key=value&key=value" query string from them, then HMAC-SHA256 with the
  // merchant's Hash Key, base64-encoded.
  const sortedKeys = Object.keys(fields)
    .filter((k) => k !== "merchantHashedReq" && fields[k] !== "" && fields[k] !== undefined && fields[k] !== null)
    .sort();
  const queryString = sortedKeys.map((k) => `${k}=${fields[k]}`).join("&");
  return crypto.createHmac("sha256", hashKey).update(queryString).digest("base64");
}

exports.createEasypaisaCheckout = onCall(
  { secrets: [EASYPAISA_STORE_ID, EASYPAISA_HASH_KEY, APP_BASE_URL] },
  async (request) => {
    assertSignedIn(request);
    const { uid, plan } = request.data || {};
    if (request.auth.uid !== uid) throw new HttpsError("permission-denied", "uid mismatch.");
    if (!PLAN_AMOUNTS_PKR[plan]) throw new HttpsError("invalid-argument", "Unknown plan.");

    const amountPkr = PLAN_AMOUNTS_PKR[plan];
    const now = new Date();
    const expiry = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const orderRefNum = `MM${Date.now()}`;

    await db.collection("payments").doc(orderRefNum).set({
      uid,
      provider: "easypaisa",
      plan,
      amount: amountPkr,
      status: "initiated",
      createdAt: Date.now(),
    });

    const fields = {
      storeId: EASYPAISA_STORE_ID.value(),
      amount: String(amountPkr),
      postBackURL: `${process.env.FUNCTION_URL_BASE || ""}easypaisaCallback`,
      orderRefNum,
      expiryDate: formatDateTime(expiry),
      autoRedirect: "1",
      paymentMethod: "MA_PAYMENT_METHOD", // mobile account; also supports OTC_PAYMENT_METHOD / CC_PAYMENT_METHOD per Easypaisa docs
    };
    fields.merchantHashedReq = easypaisaHash(fields, EASYPAISA_HASH_KEY.value());

    return { actionUrl: EASYPAISA_CHECKOUT_URL, fields };
  }
);

exports.easypaisaCallback = onRequest(
  { secrets: [EASYPAISA_HASH_KEY, APP_BASE_URL] },
  async (req, res) => {
    try {
      const fields = req.body || {};
      const orderRefNum = fields.orderRefNum;
      // Easypaisa's callback fields vary by integration type — check the
      // `easypaisaSaleStatus` / `status` / `responseCode` field your merchant docs
      // specify and adjust this condition accordingly.
      const success = String(fields.status || fields.responseCode || "").toUpperCase() === "0000" || fields.easypaisaSaleStatus === "SUCCESS";

      if (orderRefNum) {
        const paymentRef = db.collection("payments").doc(orderRefNum);
        const paymentSnap = await paymentRef.get();
        if (paymentSnap.exists && success) {
          const { uid, plan } = paymentSnap.data();
          const months = plan === "yearly" ? 12 : 1;
          await db.collection("users").doc(uid).set(
            { premium: true, premiumExpiry: Date.now() + months * 30 * 24 * 60 * 60 * 1000 },
            { merge: true }
          );
          await paymentRef.set({ status: "success", completedAt: Date.now() }, { merge: true });
        } else if (paymentSnap.exists) {
          await paymentRef.set({ status: "failed", completedAt: Date.now() }, { merge: true });
        }
      } else {
        logger.warn("Easypaisa callback missing orderRefNum", fields);
      }

      res.redirect(`${APP_BASE_URL.value()}/profile?payment=${success ? "success" : "failed"}`);
    } catch (err) {
      logger.error("easypaisaCallback error", err);
      res.redirect(`${APP_BASE_URL.value()}/profile?payment=error`);
    }
  }
);

/* ------------------------------------------------------------------ */
/* Admin: grant the `admin` custom claim (callable by existing admins) */
/* ------------------------------------------------------------------ */
exports.grantAdminClaim = onCall(async (request) => {
  assertSignedIn(request);
  const callerClaims = request.auth.token || {};
  if (!callerClaims.admin) {
    throw new HttpsError("permission-denied", "Only an existing admin can grant admin access. Use scripts/setAdminClaim.mjs for the very first admin.");
  }
  const { targetUid } = request.data || {};
  if (!targetUid) throw new HttpsError("invalid-argument", "targetUid is required.");
  await admin.auth().setCustomUserClaims(targetUid, { admin: true });
  return { ok: true };
});
