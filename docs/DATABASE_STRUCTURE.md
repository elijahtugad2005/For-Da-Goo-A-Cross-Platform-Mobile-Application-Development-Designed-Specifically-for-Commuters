# ForDaGoo Database Structure

This document describes the complete database structure for the ForDaGoo application, including Firestore collections and Realtime Database paths.

## Firestore Collections

### `users` Collection

Each document represents a user account (student, driver, or admin).

**Document ID**: Firebase Auth UID

**Fields**:
```typescript
{
  uid: string;              // Firebase Auth UID (same as document ID)
  email: string | null;     // User's email address
  role: string;             // 'student' | 'driver' | 'admin'
  name: string | null;      // User's display name
  photoURL: string | null;  // Profile photo URL (from Google or custom)
  status: string;           // 'active' | 'inactive'
  createdAt: Timestamp;     // Account creation timestamp
  updatedAt: Timestamp;     // Last update timestamp
  lastLocation?: {          // Optional: Last known location (Firestore backup)
    latitude: number;       // Range: [-90, 90]
    longitude: number;      // Range: [-180, 180]
    updatedAt: Timestamp;   // When location was last updated
  }
}
```

**Example Document**:
```json
{
  "uid": "abc123xyz",
  "email": "student@example.com",
  "role": "student",
  "name": "John Doe",
  "photoURL": null,
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Indexes Required**: None (queries use single field filters)

---

## Realtime Database Paths

### `presence/{uid}`

Tracks real-time online/offline status of users.

**Structure**:
```typescript
{
  lastSeen: number;  // Unix timestamp in milliseconds
  online: boolean;   // true if currently online
}
```

**Example**:
```json
{
  "presence": {
    "abc123xyz": {
      "lastSeen": 1705318200000,
      "online": true
    }
  }
}
```

**TTL**: Data expires after 2 minutes of inactivity

---

### `sharedLocations/{uid}`

Stores real-time location data for drivers and students.

**Structure**:
```typescript
{
  latitude: number;   // Range: [-90, 90]
  longitude: number;  // Range: [-180, 180]
  timestamp: number;  // Unix timestamp in milliseconds
}
```

**Example**:
```json
{
  "sharedLocations": {
    "abc123xyz": {
      "latitude": 11.2588,
      "longitude": 124.0078,
      "timestamp": 1705318200000
    }
  }
}
```

**TTL**: Data expires after 5 minutes of inactivity

---

## Security Rules

### Firestore Rules (`firestore.rules`)

```
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
      // Anyone authenticated can read user profiles
      allow read: if request.auth != null;
      
      // Users can write their own document
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Admins can write any user document
      allow write: if isAdmin();
    }
    
    // Default deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Realtime Database Rules (`database.rules.json`)

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

---

## Initial Data Setup

### Creating an Admin User

**Option 1: Via Firebase Console**

1. Go to Firebase Console → Authentication
2. Create a new user with email/password
3. Copy the user's UID
4. Go to Firestore Database → `users` collection
5. Create a new document with the UID as the document ID
6. Add the following fields:

```json
{
  "uid": "paste-the-uid-here",
  "email": "admin@yourdomain.com",
  "role": "admin",
  "name": "Admin User",
  "photoURL": null,
  "status": "active",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Option 2: Via App Sign-up**

1. Sign up normally through the app
2. Go to Firestore Database → `users` collection
3. Find your user document
4. Edit the `role` field and change it to `"admin"`
5. Reload the app

---

## Data Validation Rules

### User Role
- Must be one of: `'student'`, `'driver'`, `'admin'`

### User Status
- Must be one of: `'active'`, `'inactive'`

### Email
- Must be a valid email format
- Must be unique (enforced by Firebase Auth)

### Name
- Must be a non-empty string when provided

### Location Coordinates
- **Latitude**: Must be in range `[-90, 90]`
- **Longitude**: Must be in range `[-180, 180]`

---

## Query Patterns

### Admin Panel Queries

**Fetch all students**:
```typescript
const studentsQuery = query(
  collection(firestore, 'users'),
  where('role', '==', 'student')
);
```

**Fetch all drivers**:
```typescript
const driversQuery = query(
  collection(firestore, 'users'),
  where('role', '==', 'driver')
);
```

**Fetch user by UID**:
```typescript
const userDoc = doc(firestore, 'users', uid);
const snapshot = await getDoc(userDoc);
```

---

## Data Migration

If you have existing users without the new fields, run this migration:

```typescript
// Migration script to add missing fields to existing users
async function migrateUsers() {
  const usersRef = collection(firestore, 'users');
  const snapshot = await getDocs(usersRef);
  
  const batch = writeBatch(firestore);
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const updates: any = {};
    
    // Add uid if missing
    if (!data.uid) {
      updates.uid = doc.id;
    }
    
    // Add status if missing
    if (!data.status) {
      updates.status = 'active';
    }
    
    // Add email if missing (from Auth)
    if (!data.email && auth.currentUser?.email) {
      updates.email = auth.currentUser.email;
    }
    
    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = serverTimestamp();
      batch.update(doc.ref, updates);
    }
  });
  
  await batch.commit();
  console.log('Migration complete!');
}
```

---

## Backup and Export

### Firestore Export Command
```bash
gcloud firestore export gs://your-bucket-name/firestore-backup
```

### Realtime Database Export
1. Go to Firebase Console → Realtime Database
2. Click the three dots menu → Export JSON
3. Save the JSON file

---

## Performance Considerations

1. **Pagination**: User lists are limited to 50 records per query
2. **Indexes**: No composite indexes required for current queries
3. **Caching**: User data is cached locally in React state
4. **Real-time Updates**: Presence and location use RTDB for low latency

---

## Troubleshooting

### Issue: "Permission denied" errors
- **Solution**: Verify Firestore rules are deployed
- **Check**: User has correct role in Firestore document

### Issue: Users not appearing in admin panel
- **Solution**: Ensure user documents have all required fields
- **Check**: Run the migration script above

### Issue: Location data not showing
- **Solution**: Check RTDB rules allow read access
- **Check**: Verify location sharing is enabled in app

---

## Related Files

- `firestore.rules` - Firestore security rules
- `database.rules.json` - Realtime Database security rules
- `hooks/useAuth.ts` - User authentication and creation
- `hooks/use-admin-users.ts` - Admin CRUD operations
- `types/admin.ts` - TypeScript interfaces
