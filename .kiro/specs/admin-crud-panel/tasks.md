# Implementation Plan: Admin CRUD Panel

## Overview

This implementation plan builds the Admin CRUD Panel feature for the ForDaGoo application. The feature adds a dedicated administrative interface for managing student and driver user accounts, including view, create, edit, and delete operations. The implementation extends the existing Firestore data model, adds a new `admin` role with protected routes, implements a `useAdminUsers` hook for all CRUD operations, and creates a complete admin UI following the existing design language.

## Tasks

- [x] 1. Extend data models and update Firestore security rules
  - [x] 1.1 Update TypeScript interfaces for extended User model
    - Add `status: 'active' | 'inactive'` field to user interface
    - Add optional `lastLocation` field with latitude/longitude structure
    - Create `AdminUser` interface merging Firestore data with presence/location
    - Create `CreateUserInput` and `UpdateUserInput` interfaces
    - _Requirements: 1.3, 9.1, 9.2, 9.5, 9.6_

  - [x] 1.2 Update Firestore security rules for admin write access
    - Add `isAdmin()` helper function that checks requester's role from Firestore
    - Update `users/{userId}` rules to allow admin write access
    - Maintain existing read access for authenticated users
    - Maintain existing write access for users updating their own documents
    - _Requirements: 1.4, 10.1, 10.2, 10.3, 10.4_

  - [x] 1.3 Update useAuth hook to support admin role
    - Extend `UserRole` type to include `'admin'`
    - Update `User` interface to support admin role
    - Ensure `saveUserRole` function handles admin role correctly
    - _Requirements: 1.3, 9.1_

- [x] 2. Implement useAdminUsers hook
  - [x] 2.1 Create hook file structure and state management
    - Create `hooks/use-admin-users.ts` file
    - Define state variables: students, drivers, isLoading, error
    - Set up Firebase imports (firestore, auth, database)
    - Implement hook return interface matching design specification
    - _Requirements: 2.1, 2.2, 2.5, 14.1_

  - [x] 2.2 Implement fetchUsers function with presence merge
    - Query Firestore for users filtered by role
    - Fetch presence snapshot from RTDB `presence/` path
    - Fetch location snapshot from RTDB `sharedLocations/` path
    - Merge Firestore data with presence (online if lastSeen < 2 min)
    - Merge location data (prioritize RTDB over Firestore)
    - Update appropriate state (students or drivers)
    - Handle errors and set error state
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 14.1, 14.2, 14.3_

  - [x] 2.3 Implement createUser function
    - Validate email format, password length (≥6), and name non-empty
    - Create Firebase Auth user with email and password
    - Create Firestore document with all user fields including status
    - Set createdAt and updatedAt to serverTimestamp
    - Add new user to local state (students or drivers)
    - Return success/error response object
    - Handle auth/email-already-in-use error specifically
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 9.1, 9.2, 9.3, 9.4_

  - [ ]* 2.4 Write property test for createUser
    - **Property 1: Create-then-fetch consistency**
    - **Validates: Requirements 4.1, 4.2, 4.7**
    - Generate valid CreateUserInput with fast-check
    - Call createUser and verify success
    - Call fetchUsers with same role
    - Assert returned list contains user with matching email and name

  - [x] 2.5 Implement updateUser function
    - Validate input contains at least one field to update
    - Validate name is non-empty if provided
    - Update Firestore document with provided fields
    - Set updatedAt to serverTimestamp
    - Apply optimistic update to local state
    - Return success/error response object
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 9.1, 9.2, 9.3_

  - [ ]* 2.6 Write property test for updateUser
    - **Property 3: Update non-destructive**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
    - Generate UpdateUserInput that only sets status field
    - Create a test user with known field values
    - Call updateUser with status-only input
    - Assert all other fields remain unchanged

  - [x] 2.7 Implement deleteUser function
    - Guard against deleting own account (uid === currentUser.uid)
    - Delete Firestore document from users collection
    - Remove RTDB presence entry at `presence/{uid}`
    - Remove RTDB location entry at `sharedLocations/{uid}`
    - Log RTDB cleanup errors but don't fail operation
    - Remove user from local state (students or drivers)
    - Return success/error response object
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 14.4, 14.5_

  - [ ]* 2.8 Write property test for deleteUser
    - **Property 2: Delete idempotency**
    - **Validates: Requirements 6.2, 6.6**
    - Create a test user
    - Call deleteUser and verify success
    - Call deleteUser again with same uid
    - Assert second call returns success: false

  - [x] 2.9 Implement utility functions
    - Implement getUserById to find user in students or drivers arrays
    - Implement refreshUsers to re-fetch both students and drivers
    - _Requirements: 2.1, 2.2_

  - [ ]* 2.10 Write unit tests for useAdminUsers hook
    - Test fetchUsers populates students and sets isLoading false
    - Test createUser with valid input creates Auth user and Firestore doc
    - Test createUser with invalid email returns success: false
    - Test deleteUser removes Firestore doc and RTDB nodes
    - Test deleteUser with own UID returns error "Cannot delete your own account"
    - Test updateUser with empty input returns error

- [x] 3. Checkpoint - Verify hook implementation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create admin route group and layout
  - [x] 4.1 Update root layout to include admin route group
    - Add `<Stack.Screen name="(admin)" />` to app/_layout.tsx
    - _Requirements: 15.1, 15.2_

  - [x] 4.2 Create admin layout with role guard
    - Create `app/(admin)/_layout.tsx` file
    - Read user and role from useAuth hook
    - Redirect to /auth if user is null
    - Redirect to /(tabs) if role is student or driver
    - Render Stack navigator with admin header style if role is admin
    - _Requirements: 1.1, 1.2, 1.3, 15.1, 15.5_

  - [x] 4.3 Update tabs layout to redirect admins
    - Add redirect to /(admin)/ if user.role === 'admin' in app/(tabs)/_layout.tsx
    - _Requirements: 1.3, 15.3, 15.4_

- [ ] 5. Implement admin dashboard screen
  - [-] 5.1 Create dashboard screen component
    - Create `app/(admin)/index.tsx` file
    - Use useAdminUsers hook to access students and drivers
    - Calculate total student count, total driver count
    - Calculate online user count from presence data
    - Display summary statistics in cards
    - Provide navigation cards to students and drivers lists
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 11.1, 11.2_

- [ ] 6. Implement user list screens
  - [~] 6.1 Create students list screen
    - Create `app/(admin)/students.tsx` file
    - Use useAdminUsers hook and call fetchUsers('student') on mount
    - Implement FlatList with UserCard components
    - Add search input with 300ms debounce
    - Filter students by name or email based on search query
    - Add floating action button (FAB) to open AddUserModal
    - Implement swipe-to-delete with confirmation dialog
    - Navigate to user-detail screen on row tap
    - Detach listeners on unmount
    - _Requirements: 2.1, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 6.1, 11.3, 11.6, 13.3, 13.4, 13.5_

  - [~] 6.2 Create drivers list screen
    - Create `app/(admin)/drivers.tsx` file
    - Use useAdminUsers hook and call fetchUsers('driver') on mount
    - Implement FlatList with UserCard components
    - Add search input with 300ms debounce
    - Filter drivers by name or email based on search query
    - Add floating action button (FAB) to open AddUserModal
    - Implement swipe-to-delete with confirmation dialog
    - Navigate to user-detail screen on row tap
    - Detach listeners on unmount
    - _Requirements: 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 6.1, 11.3, 11.6, 13.3, 13.4, 13.5_

  - [~] 6.3 Implement pagination for user lists
    - Add limit(50) to Firestore queries in fetchUsers
    - Implement cursor-based pagination with startAfter
    - Load next page when user scrolls to end of list
    - _Requirements: 2.4, 13.1, 13.2_

- [ ] 7. Implement user detail screen
  - [~] 7.1 Create user detail screen component
    - Create `app/(admin)/user-detail.tsx` file
    - Get uid from router params using useLocalSearchParams
    - Use getUserById from useAdminUsers to fetch user data
    - Display editable fields: name, email, role, status
    - Display read-only fields: UID, createdAt, lastLocation
    - Prioritize RTDB location over Firestore location
    - Show "No location data" message when location unavailable
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 14.2, 14.3_

  - [~] 7.2 Implement edit and save functionality
    - Add form inputs for editable fields
    - Call updateUser on save button press
    - Display success Toast on successful update
    - Display error Toast on failed update
    - _Requirements: 5.1, 5.2, 5.3, 5.6, 5.7, 12.1, 12.2_

  - [~] 7.3 Implement delete functionality
    - Add delete button with confirmation dialog
    - Call deleteUser on confirmation
    - Navigate back to list on successful deletion
    - Display success Toast on successful deletion
    - Display error Toast on failed deletion
    - _Requirements: 6.1, 6.2, 6.7, 12.1, 12.2_

- [ ] 8. Create admin UI components
  - [~] 8.1 Create UserCard component
    - Create `components/admin/user-card.tsx` file
    - Accept user, onPress, onDelete props
    - Display ProfileIcon avatar
    - Display name, email, role badge, status dot
    - Show online/offline indicator based on isOnline
    - Show last-known location as coordinate string if available
    - Use ThemedText and ThemedView primitives
    - Use #F56476 accent color for highlights
    - _Requirements: 2.3, 11.1, 11.2, 11.3, 11.5_

  - [~] 8.2 Create AddUserModal component
    - Create `components/admin/add-user-modal.tsx` file
    - Accept visible, role, onClose, onSuccess props
    - Add form inputs for name, email, password, status
    - Pre-fill role field based on prop
    - Validate inputs before submission
    - Call createUser from useAdminUsers on submit
    - Display inline validation errors
    - Display success Toast on successful creation
    - Close modal and call onSuccess on success
    - _Requirements: 4.3, 4.4, 4.5, 4.8, 4.9, 12.1, 12.4_

  - [~] 8.3 Create StatusBadge component
    - Create `components/admin/status-badge.tsx` file
    - Accept status and optional size props
    - Render pill badge with appropriate styling for active/inactive
    - Use green color for active, gray for inactive
    - Support sm and md sizes
    - _Requirements: 11.4_

  - [ ]* 8.4 Write property test for StatusBadge
    - **Property 4: Status badge invariant**
    - **Validates: Requirements 11.4**
    - Generate all possible UserStatus values ('active', 'inactive')
    - Create mock AdminUser with each status
    - Render StatusBadge component
    - Assert component renders without error for all status values

- [~] 9. Checkpoint - Verify UI components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement error handling and user feedback
  - [~] 10.1 Add Toast feedback for all CRUD operations
    - Show success Toast on successful create, update, delete
    - Show error Toast with descriptive message on failures
    - _Requirements: 12.1, 12.2_

  - [~] 10.2 Add error state handling in list screens
    - Display error message when fetchUsers fails
    - Show network error message with retry option
    - _Requirements: 12.3_

  - [~] 10.3 Add re-authentication prompt for permission errors
    - Detect permission-denied errors from Firestore
    - Display message prompting admin to re-authenticate
    - _Requirements: 1.5, 12.5_

- [ ] 11. Integration testing with Firebase Emulator
  - [ ]* 11.1 Set up Firebase Emulator Suite
    - Configure Firestore, Auth, and RTDB emulators
    - Create test configuration file

  - [ ]* 11.2 Write integration test for student lifecycle
    - Test full create → list → edit → delete flow for student
    - Verify data consistency across Firestore and RTDB
    - _Requirements: 4.1, 4.2, 5.1, 6.2, 14.1, 14.4_

  - [ ]* 11.3 Write integration test for driver lifecycle
    - Test full create → list → edit → delete flow for driver
    - Verify data consistency across Firestore and RTDB
    - _Requirements: 4.1, 4.2, 5.1, 6.2, 14.1, 14.4_

  - [ ]* 11.4 Write integration test for admin role guard
    - Create non-admin user in emulator
    - Attempt to write to another user's document
    - Verify Firestore rules reject the operation
    - _Requirements: 10.4_

  - [ ]* 11.5 Write integration test for presence merge
    - Create user with presence entry in RTDB
    - Call fetchUsers and verify isOnline is true
    - Remove presence entry
    - Call fetchUsers and verify isOnline is false
    - _Requirements: 2.5, 2.6, 2.7, 14.1_

- [~] 12. Final checkpoint and verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end flows with Firebase Emulator Suite
- All code uses TypeScript for type safety
- All UI components follow existing design language with ThemedText/ThemedView and #F56476 accent color
