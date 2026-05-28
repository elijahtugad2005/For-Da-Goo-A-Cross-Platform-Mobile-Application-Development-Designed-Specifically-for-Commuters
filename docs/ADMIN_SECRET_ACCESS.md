# 🔐 Hidden Admin Account Creation

## How to Create an Admin Account

The admin account creation feature is **hidden** and can only be accessed with secret credentials.

### Step-by-Step Instructions

1. **Open the app** and go to the Login screen

2. **Enter the secret credentials**:
   - **Username**: `burgers`
   - **Password**: `cookies`

3. **Click "Login"** button

4. **Admin Mode Activated!** 🎉
   - You'll see a success message: "Admin mode activated!"
   - The screen will automatically switch to Sign Up mode
   - You'll see a red banner: "🔐 Admin Mode Active - Creating Admin Account"
   - The role selection (Student/Driver) will be hidden

5. **Fill in the admin account details**:
   - **Full Name**: Your admin name
   - **Username**: Your admin email (e.g., admin@example.com)
   - **Password**: Your admin password (min 6 characters)
   - **Confirm Password**: Same password again
   - ⚠️ **Note**: Terms & Conditions checkbox is NOT required in admin mode

6. **Click "Sign Up"**
   - You'll see: "Admin account created successfully!"
   - The account will be created with `role: "admin"`
   - You'll be logged in automatically

7. **You're now an admin!** 
   - You'll see the Admin Dashboard
   - You can manage all students and drivers

---

## Security Features

✅ **Hidden Access**: No visible button or link to admin creation
✅ **Secret Credentials**: Only accessible with "burgers" / "cookies"
✅ **Auto-Reset**: Admin mode resets after creating one account
✅ **No Terms Required**: Admins don't need to accept terms
✅ **Role Locked**: Automatically creates with admin role

---

## Secret Credentials

| Field | Value |
|-------|-------|
| Username | `burgers` |
| Password | `cookies` |

⚠️ **Keep these credentials secret!** Anyone with these can create admin accounts.

---

## What Happens Behind the Scenes

1. When you enter "burgers" and "cookies" and click Login
2. The app checks if these match the secret credentials
3. If they match:
   - Admin mode is activated
   - Form switches to Sign Up mode
   - Role is automatically set to "admin"
   - Terms checkbox is hidden
4. When you create the account:
   - Firebase Auth user is created
   - Firestore document is created with `role: "admin"`
   - Admin mode is deactivated
   - You're logged in as admin

---

## Troubleshooting

### Problem: "Invalid username or password" error
**Solution**: Make sure you typed exactly:
- Username: `burgers` (all lowercase)
- Password: `cookies` (all lowercase)

### Problem: Admin mode doesn't activate
**Solution**: 
1. Make sure you're on the **Login** screen (not Sign Up)
2. Clear the username and password fields
3. Type the secret credentials again
4. Click Login

### Problem: Created account but not admin
**Solution**: 
1. Check that you saw the red "Admin Mode Active" banner
2. If not, the account was created as student/driver
3. You can manually change the role in Firestore:
   - Go to Firestore → users → your document
   - Change `role` to `"admin"`

---

## Changing the Secret Credentials

If you want to change the secret credentials, edit `app/auth.tsx`:

```typescript
// Find this function:
const checkAdminAccess = () => {
  if (email.toLowerCase() === 'burgers' && password.toLowerCase() === 'cookies') {
    // Change 'burgers' and 'cookies' to your new credentials
    setAdminModeEnabled(true);
    // ...
  }
};
```

---

## Best Practices

1. **Don't share the secret credentials** with unauthorized users
2. **Create only one admin account** initially
3. **Use the admin panel** to manage other users
4. **Change the secret credentials** after creating your first admin
5. **Use strong passwords** for admin accounts

---

## Quick Reference

### To Create Admin Account:
```
1. Login screen
2. Username: burgers
3. Password: cookies
4. Click Login
5. Fill admin details
6. Click Sign Up
7. Done! 🎉
```

### To Login as Admin:
```
1. Login screen
2. Username: your-admin-email
3. Password: your-admin-password
4. Click Login
5. See Admin Dashboard
```
