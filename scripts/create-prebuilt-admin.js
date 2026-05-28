// scripts/create-prebuilt-admin.js
// Utility script to create a pre‑built admin user in Firebase Auth.
// Usage: node scripts/create-prebuilt-admin.js
// The script expects the Firebase Admin SDK credentials to be available via
// the GOOGLE_APPLICATION_CREDENTIALS environment variable or a JSON file
// path provided in the FIREBASE_SERVICE_ACCOUNT env var.

const admin = require('firebase-admin');

function getServiceAccount() {
  // Prefer GOOGLE_APPLICATION_CREDENTIALS; fallback to FIREBASE_SERVICE_ACCOUNT.
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!credPath) {
    console.error('⚠️  No service account path found. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT env var.');
    process.exit(1);
  }
  return require(credPath);
}

admin.initializeApp({
  credential: admin.credential.cert(getServiceAccount()),
});

const adminEmail = 'elijahtugad2005@gmail.com';
const adminPassword = Math.random().toString(36).slice(-12); // generate a random temporary password

async function createAdmin() {
  try {
    // Check if the user already exists.
    const existing = await admin.auth().getUserByEmail(adminEmail).catch(() => null);
    if (existing) {
      console.log(`✅ Admin user already exists (uid: ${existing.uid}). Updating custom claims...`);
      await admin.auth().setCustomUserClaims(existing.uid, { role: 'admin' });
      console.log('🔧 Custom claim "role: admin" applied.');
      return;
    }

    // Create the user.
    const userRecord = await admin.auth().createUser({
      email: adminEmail,
      emailVerified: true,
      password: adminPassword,
    });
    console.log(`🆕 Created admin user: ${userRecord.uid}`);
    // Assign the admin role via custom claims.
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'admin' });
    console.log('🔧 Custom claim "role: admin" applied.');
    console.log('ℹ️  Temporary password (store securely):', adminPassword);
  } catch (err) {
    console.error('❌ Error creating admin user:', err);
    process.exit(1);
  }
}

createAdmin();
