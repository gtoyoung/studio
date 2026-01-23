import admin from 'firebase-admin';

if (!admin.apps.length) {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!base64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 not set");
  }

  const json = Buffer.from(base64, "base64").toString("utf-8");
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(json)),
  });
}

export { admin };
