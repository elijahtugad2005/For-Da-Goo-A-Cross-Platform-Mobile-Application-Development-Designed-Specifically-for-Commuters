/**
 * Script to create an admin user in Firebase
 * 
 * Usage:
 * 1. Make sure you're logged into Firebase CLI: firebase login
 * 2. Run: node scripts/create-admin-user.js
 * 3. Follow the prompts to enter admin email and password
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin SDK
// Make sure you have a service account key file
// Download it from Firebase Console > Project Settings > Service Accounts
const serviceAccount = require('../path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project-id.firebaseio.com'
});

const auth = admin.auth();
const firestore = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdminUser() {
  try {
    console.log('\n=== Create Admin User ===\n');
    
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password (min 6 characters): ');
    const name = await question('Enter admin name: ');
    
    if (!email || !password || password.length < 6) {
      console.error('❌ Invalid input. Email and password (min 6 chars) are required.');
      rl.close();
      return;
    }
    
    console.log('\n⏳ Creating admin user...\n');
    
    // Step 1: Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name || 'Admin User',
      emailVerified: true
    });
    
    console.log(`✅ Auth user created with UID: ${userRecord.uid}`);
    
    // Step 2: Create Firestore document
    await firestore.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      role: 'admin',
      name: name || 'Admin User',
      photoURL: null,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Firestore document created');
    console.log('\n🎉 Admin user created successfully!\n');
    console.log('Login credentials:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  UID: ${userRecord.uid}`);
    console.log('\n⚠️  Please change the password after first login!\n');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('\n💡 Tip: This email is already registered. You can:');
      console.log('   1. Use a different email');
      console.log('   2. Update the existing user\'s role to "admin" in Firestore');
    }
  } finally {
    rl.close();
    process.exit(0);
  }
}

createAdminUser();
