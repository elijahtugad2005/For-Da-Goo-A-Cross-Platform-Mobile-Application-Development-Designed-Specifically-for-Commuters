# Quick Start - Admin Panel Setup

## 🚀 Fastest Way to Get Started

### 1️⃣ Sign Up in the App
```
Open app → Sign Up → Fill details → Submit
```

### 2️⃣ Make Yourself Admin
```
Firebase Console → Firestore → users → Your Document → Change role to "admin"
```

### 3️⃣ Reload App
```
Close and reopen app → You're now an admin! 🎉
```

---

## 📋 Required Firestore Document Structure

When creating a user document in Firestore `users` collection:

```json
{
  "uid": "abc123xyz",
  "email": "admin@example.com",
  "role": "admin",
  "name": "Admin User",
  "photoURL": null,
  "status": "active",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### Field Descriptions

| Field | Type | Required | Values | Description |
|-------|------|----------|--------|-------------|
| `uid` | string | ✅ Yes | Firebase Auth UID | User's unique identifier |
| `email` | string/null | ✅ Yes | Valid email | User's email address |
| `role` | string | ✅ Yes | `student`, `driver`, `admin` | User's role |
| `name` | string/null | ✅ Yes | Any string | User's display name |
| `photoURL` | string/null | ✅ Yes | URL or null | Profile photo URL |
| `status` | string | ✅ Yes | `active`, `inactive` | Account status |
| `createdAt` | timestamp | ✅ Yes | Firestore timestamp | Creation date |
| `updatedAt` | timestamp | ✅ Yes | Firestore timestamp | Last update date |
| `lastLocation` | object | ❌ No | See below | Last known location |

### Optional Location Field

```json
{
  "lastLocation": {
    "latitude": 11.2588,
    "longitude": 124.0078,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🔐 Firestore Security Rules

Your `firestore.rules` file should contain:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper: check if requester is an admin
    function isAdmin() {
      return request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow write: if isAdmin();
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Deploy rules**: `firebase deploy --only firestore:rules`

---

## 🗄️ Realtime Database Rules

Your `database.rules.json` file should contain:

```json
{
  "rules": {
    "presence": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "sharedLocations": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

**Deploy rules**: `firebase deploy --only database`

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Firestore `users` collection exists
- [ ] Your user document has all required fields
- [ ] `role` field is set to `"admin"`
- [ ] `status` field is set to `"active"`
- [ ] Firestore rules are deployed
- [ ] You can login to the app
- [ ] You see the Admin Dashboard (not student/driver tabs)
- [ ] You can navigate to Students and Drivers lists

---

## 🐛 Common Issues

### White Screen
- **Cause**: Missing required fields in user document
- **Fix**: Add all required fields listed above

### Permission Denied
- **Cause**: Firestore rules not deployed or role not set correctly
- **Fix**: Deploy rules and verify `role: "admin"` in Firestore

### Still See Student/Driver Interface
- **Cause**: App cached old role
- **Fix**: Sign out and sign back in, or clear app cache

---

## 📚 Full Documentation

- [Admin Setup Guide](./ADMIN_SETUP_GUIDE.md) - Detailed setup instructions
- [Database Structure](./DATABASE_STRUCTURE.md) - Complete database schema
- [Firestore Rules](../firestore.rules) - Security rules file
- [Database Rules](../database.rules.json) - RTDB security rules

---

## 🆘 Need Help?

1. Check console for error messages
2. Verify Firebase configuration in `config/firebase.ts`
3. Review Firestore rules in Firebase Console
4. Check that all required fields exist in your user document
