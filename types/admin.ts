import { Timestamp } from 'firebase/firestore';

/**
 * User status enumeration for account state management
 * @see Requirements 1.3, 9.1, 9.2
 */
export type UserStatus = 'active' | 'inactive';

/**
 * Extended user role type including admin role
 * @see Requirements 1.3, 9.1
 */
export type ExtendedUserRole = 'student' | 'driver' | 'admin';

/**
 * Location data structure for user's geographic coordinates
 * @see Requirements 9.5, 9.6
 */
export interface LocationData {
  latitude: number;   // Range: [-90, 90]
  longitude: number;  // Range: [-180, 180]
  updatedAt?: Timestamp;
}

/**
 * Extended User interface with admin panel fields
 * Extends the base User model with status and location tracking
 * @see Requirements 1.3, 9.1, 9.2, 9.5, 9.6
 */
export interface ExtendedUser {
  uid: string;
  email: string | null;
  role: ExtendedUserRole;
  name: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: UserStatus;
  lastLocation?: LocationData | null;
}

/**
 * AdminUser interface merging Firestore data with real-time presence and location
 * Used by the admin panel UI to display comprehensive user information
 * @see Design Document: AdminUser data model
 */
export interface AdminUser {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  role: ExtendedUserRole;
  status: UserStatus;
  isOnline: boolean;           // Derived from Realtime DB presence
  lastSeen: number | null;     // Timestamp from presence
  lastLocation: {
    latitude: number;
    longitude: number;
  } | null;                    // From RTDB sharedLocations or Firestore
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Input interface for creating new user accounts
 * @see Design Document: CreateUserInput
 */
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'driver';  // Admins cannot create other admin accounts via UI
  status: UserStatus;
}

/**
 * Input interface for updating existing user records
 * All fields are optional to support partial updates
 * @see Design Document: UpdateUserInput
 */
export interface UpdateUserInput {
  name?: string;
  status?: UserStatus;
  role?: 'student' | 'driver';
  lastLocation?: { latitude: number; longitude: number } | null;
}
