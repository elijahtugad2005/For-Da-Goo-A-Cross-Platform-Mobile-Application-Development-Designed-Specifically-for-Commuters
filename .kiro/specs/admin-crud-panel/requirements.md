# Requirements Document: Admin CRUD Panel

## Introduction

The Admin CRUD Panel feature enables administrators to manage student and driver user accounts within the ForDaGoo application. Administrators can view, create, edit, and delete user records, monitor account status, and track user presence and location data through a dedicated administrative interface. This feature introduces role-based access control with a new `admin` role and provides a comprehensive user management system that operates independently from the existing student and driver interfaces.

## Glossary

- **Admin**: A user with the `admin` role who has permission to manage other user accounts
- **User_Record**: A document in the Firestore `users` collection containing user profile and account information
- **Admin_Panel**: The protected route group `app/(admin)/` containing all administrative screens
- **CRUD_Operations**: Create, Read, Update, and Delete operations on user records
- **User_Status**: An enumeration of account states: `active` or `inactive`
- **Presence_Data**: Real-time information from Firebase Realtime Database indicating whether a user is currently online
- **Location_Data**: Geographic coordinates (latitude, longitude) representing a user's last known position
- **Admin_User**: A merged data structure combining Firestore user data with real-time presence and location information
- **useAdminUsers_Hook**: A React hook that encapsulates all Firestore and RTDB operations for user management
- **User_Role**: An enumeration of user types: `student`, `driver`, or `admin`
- **Firebase_Auth**: Firebase Authentication service used for user account creation and authentication
- **Firestore**: Cloud Firestore database service storing user profile documents
- **RTDB**: Firebase Realtime Database storing presence and location data
- **Toast**: A UI component that displays temporary feedback messages to users

## Requirements

### Requirement 1: Admin Authentication and Access Control

**User Story:** As a system administrator, I want only authenticated admin users to access the admin panel, so that user management functions are protected from unauthorized access.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access the Admin_Panel THEN THE System SHALL redirect them to the authentication screen
2. WHEN a user with role `student` or `driver` attempts to access the Admin_Panel THEN THE System SHALL redirect them to the student/driver tabs interface
3. WHEN a user with role `admin` successfully authenticates THEN THE System SHALL grant access to the Admin_Panel
4. THE Admin_Panel SHALL verify the admin role using Firestore security rules on every data operation
5. WHEN an admin user's session expires THEN THE System SHALL redirect them to the authentication screen

### Requirement 2: View User Lists

**User Story:** As an administrator, I want to view paginated lists of students and drivers, so that I can browse and manage user accounts efficiently.

#### Acceptance Criteria

1. WHEN an admin navigates to the students list THEN THE System SHALL display all users with role `student`
2. WHEN an admin navigates to the drivers list THEN THE System SHALL display all users with role `driver`
3. FOR each user in the list, THE System SHALL display name, email, role badge, status indicator, and online/offline presence
4. WHEN the user list contains more than 50 records THEN THE System SHALL implement cursor-based pagination
5. WHEN displaying user presence THEN THE System SHALL merge Firestore data with real-time presence data from RTDB
6. WHEN a user's presence timestamp is within the last 2 minutes THEN THE System SHALL display them as online
7. WHEN a user's presence timestamp is older than 2 minutes or absent THEN THE System SHALL display them as offline

### Requirement 3: Search and Filter Users

**User Story:** As an administrator, I want to search for users by name or email, so that I can quickly find specific accounts.

#### Acceptance Criteria

1. WHEN an admin types in the search field THEN THE System SHALL filter the displayed user list to match the search query
2. THE System SHALL debounce search input at 300 milliseconds to optimize performance
3. WHEN the search query matches a user's name or email THEN THE System SHALL include that user in the filtered results
4. WHEN no users match the search query THEN THE System SHALL display an empty state message

### Requirement 4: Create New User Accounts

**User Story:** As an administrator, I want to create new student and driver accounts, so that I can onboard users to the system.

#### Acceptance Criteria

1. WHEN an admin submits the create user form with valid data THEN THE System SHALL create a new Firebase Auth account with the provided email and password
2. WHEN a Firebase Auth account is created THEN THE System SHALL create a corresponding Firestore document in the `users` collection with the user's profile data
3. THE System SHALL validate that the email field contains a valid email format before account creation
4. THE System SHALL validate that the password field contains at least 6 characters before account creation
5. THE System SHALL validate that the name field is a non-empty string before account creation
6. WHEN an admin attempts to create a user with an email that already exists THEN THE System SHALL return an error message "This email is already registered"
7. WHEN user creation succeeds THEN THE System SHALL add the new user to the appropriate local state list (students or drivers)
8. WHEN user creation succeeds THEN THE System SHALL display a success Toast message
9. WHEN user creation fails THEN THE System SHALL display an error Toast message with the failure reason

### Requirement 5: Update User Information

**User Story:** As an administrator, I want to edit user account information, so that I can maintain accurate user records.

#### Acceptance Criteria

1. WHEN an admin modifies a user's name and saves THEN THE System SHALL update the `name` field in the Firestore User_Record
2. WHEN an admin modifies a user's status and saves THEN THE System SHALL update the `status` field in the Firestore User_Record
3. WHEN an admin modifies a user's role and saves THEN THE System SHALL update the `role` field in the Firestore User_Record
4. WHEN any user field is updated THEN THE System SHALL set the `updatedAt` field to the current server timestamp
5. WHEN an update operation succeeds THEN THE System SHALL update the local state immediately (optimistic update)
6. WHEN an update operation succeeds THEN THE System SHALL display a success Toast message "Changes saved"
7. WHEN an update operation fails THEN THE System SHALL display an error Toast message and revert the optimistic update

### Requirement 6: Delete User Accounts

**User Story:** As an administrator, I want to delete user accounts, so that I can remove inactive or invalid users from the system.

#### Acceptance Criteria

1. WHEN an admin initiates a delete operation THEN THE System SHALL display a confirmation dialog before proceeding
2. WHEN an admin confirms deletion THEN THE System SHALL delete the Firestore document from the `users` collection
3. WHEN a Firestore user document is deleted THEN THE System SHALL remove the corresponding presence entry from RTDB at `presence/{uid}`
4. WHEN a Firestore user document is deleted THEN THE System SHALL remove the corresponding location entry from RTDB at `sharedLocations/{uid}`
5. WHEN an admin attempts to delete their own account THEN THE System SHALL prevent the deletion and return an error message "Cannot delete your own account"
6. WHEN a delete operation succeeds THEN THE System SHALL remove the user from the local state list
7. WHEN a delete operation succeeds THEN THE System SHALL display a success Toast message "User deleted"
8. IF RTDB cleanup fails during deletion THEN THE System SHALL log the error but still return success (Firestore deletion succeeded)

### Requirement 7: Display User Details

**User Story:** As an administrator, I want to view detailed information about a specific user, so that I can review their complete profile and activity.

#### Acceptance Criteria

1. WHEN an admin selects a user from the list THEN THE System SHALL navigate to the user detail screen
2. THE user detail screen SHALL display all editable fields: name, email, role, and status
3. THE user detail screen SHALL display read-only fields: UID, createdAt timestamp, and last known location coordinates
4. WHEN Location_Data is available from RTDB THEN THE System SHALL display the latitude and longitude
5. WHEN Location_Data is not available from RTDB but exists in Firestore THEN THE System SHALL display the Firestore location data
6. WHEN no Location_Data is available THEN THE System SHALL display a message indicating no location data

### Requirement 8: Admin Dashboard

**User Story:** As an administrator, I want to see a dashboard with summary statistics, so that I can quickly understand the current state of the system.

#### Acceptance Criteria

1. WHEN an admin navigates to the Admin_Panel root THEN THE System SHALL display the admin dashboard
2. THE dashboard SHALL display the total count of users with role `student`
3. THE dashboard SHALL display the total count of users with role `driver`
4. THE dashboard SHALL display the count of currently online users based on Presence_Data
5. THE dashboard SHALL provide navigation cards to the students list and drivers list screens

### Requirement 9: Data Validation

**User Story:** As a system administrator, I want all user data to be validated before storage, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN storing a User_Record THEN THE System SHALL validate that the `role` field is one of `student`, `driver`, or `admin`
2. WHEN storing a User_Record THEN THE System SHALL validate that the `status` field is one of `active` or `inactive`
3. WHEN storing a User_Record with a name THEN THE System SHALL validate that the name is a non-empty string
4. WHEN storing a User_Record with an email THEN THE System SHALL validate that the email matches a valid email format
5. WHEN storing Location_Data THEN THE System SHALL validate that latitude is in the range [-90, 90]
6. WHEN storing Location_Data THEN THE System SHALL validate that longitude is in the range [-180, 180]

### Requirement 10: Firestore Security Rules

**User Story:** As a system architect, I want server-side security rules to enforce admin permissions, so that user management operations are protected at the database level.

#### Acceptance Criteria

1. THE Firestore security rules SHALL allow any authenticated user to read documents from the `users` collection
2. THE Firestore security rules SHALL allow users to write to their own user document
3. THE Firestore security rules SHALL allow users with role `admin` to write to any user document
4. WHEN a non-admin user attempts to write to another user's document THEN THE Firestore SHALL reject the operation with a permission-denied error

### Requirement 11: User Interface Components

**User Story:** As an administrator, I want a consistent and intuitive user interface, so that I can efficiently perform user management tasks.

#### Acceptance Criteria

1. THE Admin_Panel SHALL use the existing design language with ThemedText and ThemedView components
2. THE Admin_Panel SHALL use the accent color `#F56476` for primary actions and highlights
3. WHEN displaying user lists THEN THE System SHALL use FlatList with keyExtractor for optimal scrolling performance
4. WHEN displaying user status THEN THE System SHALL render a StatusBadge component with appropriate styling for `active` or `inactive` states
5. WHEN displaying user cards THEN THE System SHALL show an avatar using the ProfileIcon component
6. THE System SHALL provide a floating action button (FAB) on list screens to initiate user creation

### Requirement 12: Error Handling and User Feedback

**User Story:** As an administrator, I want clear feedback on all operations, so that I understand whether my actions succeeded or failed.

#### Acceptance Criteria

1. WHEN any CRUD_Operations succeeds THEN THE System SHALL display a Toast message indicating success
2. WHEN any CRUD_Operations fails THEN THE System SHALL display a Toast message with a descriptive error message
3. WHEN a network error occurs during data fetching THEN THE System SHALL set the error state and display an error message
4. WHEN Firebase Auth returns an error during user creation THEN THE System SHALL display the error message inline in the creation form
5. WHEN Firestore rules deny an operation THEN THE System SHALL display a message prompting the admin to re-authenticate

### Requirement 13: Performance Optimization

**User Story:** As an administrator, I want the admin panel to be responsive and performant, so that I can manage users efficiently even with large datasets.

#### Acceptance Criteria

1. WHEN fetching user lists THEN THE System SHALL limit initial queries to 50 records
2. WHEN the user scrolls to the end of a list THEN THE System SHALL load the next page using cursor-based pagination
3. WHEN an admin performs an update or delete operation THEN THE System SHALL apply optimistic updates to the local state before the server operation completes
4. WHEN an admin types in the search field THEN THE System SHALL debounce the input at 300 milliseconds before filtering
5. WHEN an admin navigates away from a list screen THEN THE System SHALL detach all real-time listeners to prevent memory leaks

### Requirement 14: Data Consistency

**User Story:** As a system architect, I want user data to remain consistent across Firestore and RTDB, so that the admin panel displays accurate information.

#### Acceptance Criteria

1. WHEN fetching users THEN THE System SHALL merge Firestore User_Record data with RTDB Presence_Data and Location_Data
2. WHEN RTDB Location_Data is available THEN THE System SHALL prioritize it over Firestore location data
3. WHEN RTDB Location_Data is not available THEN THE System SHALL fall back to Firestore location data
4. WHEN deleting a user THEN THE System SHALL remove data from both Firestore and RTDB to maintain consistency
5. IF RTDB cleanup fails during deletion THEN THE System SHALL log the failure but not block the operation (stale RTDB entries will expire naturally)

### Requirement 15: Routing and Navigation

**User Story:** As an administrator, I want clear navigation within the admin panel, so that I can easily access different management functions.

#### Acceptance Criteria

1. THE Admin_Panel SHALL be implemented as a separate route group `app/(admin)/` independent from the `(tabs)` group
2. THE root layout SHALL include the Admin_Panel as a Stack screen
3. WHEN an admin user authenticates THEN THE System SHALL redirect them to the Admin_Panel dashboard
4. WHEN a student or driver user authenticates THEN THE System SHALL redirect them to the tabs interface
5. THE Admin_Panel layout SHALL render a Stack navigator with consistent header styling for all admin screens

## Non-Functional Requirements

### Security

1. THE System SHALL enforce role-based access control at both the client and server levels
2. THE System SHALL never store user passwords in Firestore
3. THE System SHALL use Firebase server timestamps for all audit fields to prevent client-side timestamp manipulation
4. THE System SHALL prevent admins from deleting their own accounts to avoid lockout scenarios

### Performance

1. THE System SHALL render user lists with smooth scrolling performance for datasets up to 1000 records
2. THE System SHALL complete user creation operations within 3 seconds under normal network conditions
3. THE System SHALL complete user update operations within 2 seconds under normal network conditions
4. THE System SHALL complete user deletion operations within 2 seconds under normal network conditions

### Accessibility

1. THE System SHALL provide sufficient color contrast for all text elements to meet WCAG AA standards
2. THE System SHALL provide descriptive labels for all interactive elements
3. THE System SHALL support keyboard navigation for all admin panel functions on web platforms

### Maintainability

1. THE System SHALL encapsulate all data operations within the useAdminUsers_Hook to maintain separation of concerns
2. THE System SHALL use TypeScript interfaces for all data models to ensure type safety
3. THE System SHALL follow the existing project structure and naming conventions
