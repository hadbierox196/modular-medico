# Cloud Functions — deployment guide

Implements `createJazzCashCheckout`, `createEasypaisaCheckout` (callable, called from `src/services/payments.ts`),
their matching `jazzcashCallback`/`easypaisaCallback` HTTPS endpoints, and `grantAdminClaim`.

## Prerequisites

- Your Firebase project must be on the **Blaze (pay-as-you-go) plan** — outbound HTTP to payment gateways and
  public HTTPS callback endpoints aren't available on the free Spark plan. Blaze still has a generous free tier;
  you only pay for usage beyond it.
- Firebase CLI installed and logged in: `npm install -g firebase-tools && firebase login`

## 1. Install dependencies

```bash
cd functions
npm install
```

## 2. Set secrets

Real merchant credentials — get these from JazzCash and/or Easypaisa business onboarding. Never commit them.

```bash
firebase functions:secrets:set JAZZCASH_MERCHANT_ID
firebase functions:secrets:set JAZZCASH_PASSWORD
firebase functions:secrets:set JAZZCASH_INTEGRITY_SALT

firebase functions:secrets:set EASYPAISA_STORE_ID
firebase functions:secrets:set EASYPAISA_HASH_KEY

# Where to send the user's browser back after payment — your deployed app's URL:
firebase functions:secrets:set APP_BASE_URL
# e.g. https://sewask-e3b44.web.app
```

Each command prompts you to paste the secret value; it's stored in Google Secret Manager, not in your code.

## 3. Sandbox vs. production

`functions/index.js` has a `SANDBOX` constant near the top, defaulting to `true` — it points both gateways at
their sandbox/staging URLs so you can test the full flow without moving real money. JazzCash and Easypaisa both
give you separate sandbox credentials for this. Once you've tested end-to-end and have production credentials,
flip `SANDBOX` to `false` and redeploy.

## 4. Deploy

```bash
firebase deploy --only functions
```

This prints the deployed URLs for `jazzcashCallback` and `easypaisaCallback` — you'll need to register those
exact URLs as the callback/postback URL in your JazzCash and Easypaisa merchant dashboards (in addition to them
being referenced from `pp_ReturnURL`/`postBackURL` in the request itself, most gateways also want the callback
URL allow-listed on their side).

## 5. Test locally first (recommended)

```bash
firebase emulators:start --only functions,firestore,auth
```

Point `src/firebase.ts`'s `functions`/`db`/`auth` exports at the emulator during local testing (the Firebase JS
SDK has `connectFunctionsEmulator`, `connectFirestoreEmulator`, `connectAuthEmulator` for this — add them behind
an `if (import.meta.env.DEV)` check if you want a permanent local-dev setup).

## 6. Verify against current gateway docs before going live

The field names, URL paths, and hash algorithms in `index.js` are built from JazzCash's and Easypaisa's publicly
documented **Hosted Checkout Page** integration patterns (sorted-field HMAC-SHA256 signing, redirect-based
checkout). Both companies only hand you the fully current, merchant-specific integration guide after you
complete business onboarding — so before processing real payments:

- Confirm the exact `pp_*` field list and hash construction against the PDF/portal JazzCash gives your merchant
  account.
- Confirm the exact Easypaisa field list (`storeId`, `amount`, `postBackURL`, `orderRefNum`, `expiryDate`,
  `merchantHashedReq`, and the success/failure field names in the callback) against your Easypaisa merchant docs.
- Test a full successful payment AND a full failed/cancelled payment in sandbox before flipping `SANDBOX = false`.
