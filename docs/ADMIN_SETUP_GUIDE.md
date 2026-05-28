# Admin User Setup Guide

This guide will help you create your first admin user for the ForDaGoo admin panel.

## Quick Setup (Recommended)

### Step 1: Sign Up Through the App

1. Open the ForDaGoo app
2. Click "Sign Up"
3. Select either "Student" or "Driver" (we'll change this to admin)
4. Fill in your details:
   - **Name**: Your admin name
   - **Email**: Your admin email
   - **Password**: Your admin password (min 6 characters)
5. Accept terms and click "Sign Up"
6. You'll be logged in as a student/driver

### Step 2: Upgrade to Admin in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your ForDaGoo project
3. Click **Firestore Database** in the left menu
4. You should see a `users` collection
5. Click on the `users` collection
6. Find your user document (it will have your email)
7. Click on the document to edit it
8. Find the `role` field
9. Change the value from `"student"` or `"driver"` to `"admin"`
10. Click **Update**

### Step 3: Reload the App

1. Close and reopen the app (or refresh if on web)
2. You should now see the **Admin Dashboard** instead of the student/driver interface
3. You can now manage all users!

---

## Alternative: Create Admin User Directly in Firebase

If you prefer to create the admin user directly in Firebase without signing up through the app:

### Step 1: Create User in Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Authentication** in the left menu
4. Click the **Users** tab
5. Click **Add User** button
6. Enter:
   - **Email**: admin@yourdomain.com
   - **Password**: YourSecurePassword123
7. Click **Add User**
8. **Copy the User UID** (you'll need this in the next step)

### Step 2: Create User Document in Firestore

1. Go to **Firestore Database** in the left menu
2. Click **Start Collection**
3. Enter collection ID: `users`
4. Click **Next**
5. For the first document:
   - **Document ID**: Paste the UID you copied from Step 1
   - Add the following fields:

| Field | Type | Value |
|-------|------|-------|
| `uid` | string | (paste the UID again) |
| `email` | string | admin@yourdomain.com |
| `role` | string | admin |
| `name` | string | Admin User |
| `photoURL` | null | null |
| `status` | string | active |
| `createdAt` | timestamp | (click "Set to current time") |
| `updatedAt` | timestamp | (click "Set to current time") |

6. Click **Save**

### Step 3: Login to the App

1. Open the ForDaGoo app
2. Click "Login"
3. Enter your admin credentials
4. You should see the Admin Dashboard!

---

## Verifying Admin Access

Once logged in as admin, you should see:

✅ **Admin Dashboard** with:
- Total Students count
- Total Drivers count
- Online Users count
- "Manage Students" button
- "Manage Drivers" button

✅ **Admin Header** with red background (#F56476)

✅ **Navigation** to:
- Students list
- Drivers list
- User detail pages

---

## Troubleshooting

### Problem: Still seeing student/driver interface after changing role

**Solution**: 
1. Completely close the app
2. Clear app cache (if on mobile)
3. Reopen the app
4. If still not working, sign out and sign back in

### Problem: "Permission denied" error

**Solution**:
1. Check that Firestore rules are deployed
2. Verify the `role` field is exactly `"admin"` (lowercase, no spaces)
3. Make sure you're logged in with the correct account

### Problem: Can't see any users in the admin panel

**Solution**:
1. Make sure other users have signed up through the app
2. Check that the `users` collection exists in Firestore
3. Verify Firestore rules allow read access for authenticated users

### Problem: White screen after login

**Solution**:
1. Check browser/app console for errors
2. Verify all required fields exist in your user document
3. Make sure Firebase configuration is correct in `config/firebase.ts`

---

## Security Best Practices

1. **Use a strong password** for admin accounts (min 12 characters, mix of letters, numbers, symbols)
2. **Don't share admin credentials** with unauthorized users
3. **Regularly review** who has admin access
4. **Enable 2FA** in Firebase Console for extra security
5. **Monitor admin actions** through Firebase Console logs

---

## Creating Multiple Admins

To create additional admin users, repeat the setup process with different email addresses. You can also:

1. Use the admin panel to create a new user (student/driver)
2. Then manually change their role to "admin" in Firestore
3. They'll have admin access on next login

---

## Removing Admin Access

To revoke admin access from a user:

1. Go to Firestore Database → `users` collection
2. Find the user's document
3. Change the `role` field from `"admin"` to `"student"` or `"driver"`
4. The user will lose admin access on next login

---

## Need Help?

If you encounter issues:

1. Check the [Database Structure Documentation](./DATABASE_STRUCTURE.md)
2. Review the [Firestore Security Rules](../firestore.rules)
3. Check the browser/app console for error messages
4. Verify your Firebase project configuration

---

## Quick Reference

### Required User Document Fields

```json
{
  "uid": "firebase-auth-uid",
  "email": "user@example.com",
  "role": "admin",
  "name": "User Name",
  "photoURL": null,
  "status": "active",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Valid Role Values
- `"student"` - Regular student user
- `"driver"` - Driver user
- `"admin"` - Administrator with full access

### Valid Status Values
- `"active"` - User can login and use the app
- `"inactive"` - User account is disabled
