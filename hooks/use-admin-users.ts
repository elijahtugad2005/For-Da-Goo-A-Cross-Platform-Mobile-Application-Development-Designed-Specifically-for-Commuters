import { get, ref } from 'firebase/database';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { database, firestore } from '../config/firebase';
import type {
    AdminUser,
    CreateUserInput,
    ExtendedUser,
    UpdateUserInput
} from '../types/admin';

/**
 * Hook return interface for admin user management
 * @see Design Document: useAdminUsers interface
 */
interface UseAdminUsersReturn {
  // State
  students: AdminUser[];
  drivers: AdminUser[];
  isLoading: boolean;
  error: string | null;

  // CRUD operations
  fetchUsers: (role: 'student' | 'driver') => Promise<void>;
  createUser: (input: CreateUserInput) => Promise<{ success: boolean; error?: string }>;
  updateUser: (uid: string, input: UpdateUserInput) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (uid: string) => Promise<{ success: boolean; error?: string }>;

  // Utilities
  getUserById: (uid: string) => AdminUser | undefined;
  refreshUsers: () => Promise<void>;
}

/**
 * Custom hook for admin user management operations
 * Encapsulates all Firestore and RTDB operations for the admin panel
 * 
 * @see Design Document: useAdminUsers hook specification
 * @see Requirements 2.1, 2.2, 2.5, 14.1
 */
export function useAdminUsers(): UseAdminUsersReturn {
  // State variables
  const [students, setStudents] = useState<AdminUser[]>([]);
  const [drivers, setDrivers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch users by role and merge with presence/location data
   * @see Design Document: fetchUsers specification
   * @see Requirements 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 14.1, 14.2, 14.3
   */
  const fetchUsers = async (role: 'student' | 'driver'): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Query Firestore for users filtered by role
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('role', '==', role));
      const querySnapshot = await getDocs(q);

      // Step 2: Fetch presence snapshot from RTDB
      const presenceRef = ref(database, 'presence/');
      const presenceSnapshot = await get(presenceRef);
      const presenceData = presenceSnapshot.exists() ? presenceSnapshot.val() : {};

      // Step 3: Fetch location snapshot from RTDB
      const locationRef = ref(database, 'sharedLocations/');
      const locationSnapshot = await get(locationRef);
      const locationData = locationSnapshot.exists() ? locationSnapshot.val() : {};

      // Step 4: Merge Firestore data with presence and location
      const now = Date.now();
      const TWO_MINUTES_MS = 2 * 60 * 1000;

      const mergedUsers: AdminUser[] = querySnapshot.docs.map(doc => {
        const userData = doc.data() as ExtendedUser;
        const userPresence = presenceData[userData.uid];
        const userLocation = locationData[userData.uid];

        // Determine if user is online (lastSeen < 2 minutes)
        const isOnline = userPresence?.lastSeen 
          ? (now - userPresence.lastSeen) < TWO_MINUTES_MS
          : false;

        // Prioritize RTDB location over Firestore location
        let lastLocation = null;
        if (userLocation?.latitude !== undefined && userLocation?.longitude !== undefined) {
          lastLocation = {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          };
        } else if (userData.lastLocation) {
          lastLocation = {
            latitude: userData.lastLocation.latitude,
            longitude: userData.lastLocation.longitude
          };
        }

        return {
          uid: userData.uid,
          name: userData.name,
          email: userData.email,
          photoURL: userData.photoURL,
          role: userData.role,
          status: userData.status,
          isOnline,
          lastSeen: userPresence?.lastSeen ?? null,
          lastLocation,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        };
      });

      // Step 5: Update appropriate state (students or drivers)
      if (role === 'student') {
        setStudents(mergedUsers);
      } else {
        setDrivers(mergedUsers);
      }

      setIsLoading(false);
    } catch (err) {
      // Handle errors and set error state
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  /**
   * Create a new user account
   * @see Design Document: createUser specification
   * @see Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 9.1, 9.2, 9.3, 9.4
   */
  const createUser = async (input: CreateUserInput): Promise<{ success: boolean; error?: string }> => {
    try {
      // Step 1: Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Step 2: Validate password length (≥6)
      if (input.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Step 3: Validate name is non-empty
      if (!input.name || input.name.trim().length === 0) {
        return { success: false, error: 'Name is required' };
      }

      // Step 4: Create Firebase Auth user
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('../config/firebase');
      
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, input.email, input.password);
      } catch (authError: any) {
        // Handle auth/email-already-in-use error specifically
        if (authError.code === 'auth/email-already-in-use') {
          return { success: false, error: 'This email is already registered' };
        }
        return { success: false, error: authError.message || 'Failed to create user account' };
      }

      const uid = userCredential.user.uid;

      // Step 5: Create Firestore document with all user fields
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      
      try {
        const userDocRef = doc(firestore, 'users', uid);
        await setDoc(userDocRef, {
          uid,
          name: input.name,
          email: input.email,
          role: input.role,
          status: input.status,
          photoURL: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (fsError: any) {
        // Auth user created but Firestore failed
        return { success: false, error: 'User created but profile save failed' };
      }

      // Step 6: Add new user to local state
      const newAdminUser: AdminUser = {
        uid,
        name: input.name,
        email: input.email,
        photoURL: null,
        role: input.role,
        status: input.status,
        isOnline: false,
        lastSeen: null,
        lastLocation: null,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
      };

      if (input.role === 'student') {
        setStudents([...students, newAdminUser]);
      } else {
        setDrivers([...drivers, newAdminUser]);
      }

      // Step 7: Return success response
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  /**
   * Update an existing user's information
   * @see Design Document: updateUser specification
   * @see Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 9.1, 9.2, 9.3
   */
  const updateUser = async (uid: string, input: UpdateUserInput): Promise<{ success: boolean; error?: string }> => {
    try {
      // Step 1: Validate input contains at least one field to update
      const hasFields = Object.keys(input).length > 0;
      if (!hasFields) {
        return { success: false, error: 'No fields provided to update' };
      }

      // Step 2: Validate name is non-empty if provided (Requirement 9.3)
      if (input.name !== undefined) {
        if (typeof input.name !== 'string' || input.name.trim().length === 0) {
          return { success: false, error: 'Name must be a non-empty string' };
        }
      }

      // Step 3: Validate status if provided (Requirement 9.2)
      if (input.status !== undefined) {
        if (input.status !== 'active' && input.status !== 'inactive') {
          return { success: false, error: 'Status must be either "active" or "inactive"' };
        }
      }

      // Step 4: Validate role if provided (Requirement 9.1)
      if (input.role !== undefined) {
        if (input.role !== 'student' && input.role !== 'driver') {
          return { success: false, error: 'Role must be either "student" or "driver"' };
        }
      }

      // Step 5: Validate lastLocation if provided (Requirements 9.5, 9.6)
      if (input.lastLocation !== undefined && input.lastLocation !== null) {
        const { latitude, longitude } = input.lastLocation;
        if (latitude < -90 || latitude > 90) {
          return { success: false, error: 'Latitude must be in range [-90, 90]' };
        }
        if (longitude < -180 || longitude > 180) {
          return { success: false, error: 'Longitude must be in range [-180, 180]' };
        }
      }

      // Step 6: Find the user in local state for optimistic update
      const existingUser = getUserById(uid);
      if (!existingUser) {
        return { success: false, error: 'User not found' };
      }

      // Step 7: Prepare Firestore update data
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const updateData: any = {
        updatedAt: serverTimestamp() // Requirement 5.4
      };

      // Add provided fields to update data
      if (input.name !== undefined) {
        updateData.name = input.name;
      }
      if (input.status !== undefined) {
        updateData.status = input.status;
      }
      if (input.role !== undefined) {
        updateData.role = input.role;
      }
      if (input.lastLocation !== undefined) {
        if (input.lastLocation === null) {
          updateData.lastLocation = null;
        } else {
          updateData.lastLocation = {
            latitude: input.lastLocation.latitude,
            longitude: input.lastLocation.longitude,
            updatedAt: serverTimestamp()
          };
        }
      }

      // Step 8: Apply optimistic update to local state (Requirement 5.5)
      const optimisticUser: AdminUser = {
        ...existingUser,
        ...(input.name !== undefined && { name: input.name }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.role !== undefined && { role: input.role }),
        ...(input.lastLocation !== undefined && { lastLocation: input.lastLocation })
      };

      // Update the appropriate list based on the user's current role
      if (existingUser.role === 'student') {
        setStudents(students.map(u => u.uid === uid ? optimisticUser : u));
      } else if (existingUser.role === 'driver') {
        setDrivers(drivers.map(u => u.uid === uid ? optimisticUser : u));
      }

      // Step 9: Update Firestore document (Requirements 5.1, 5.2, 5.3)
      try {
        const userDocRef = doc(firestore, 'users', uid);
        await updateDoc(userDocRef, updateData);
      } catch (fsError: any) {
        // Revert optimistic update on failure (Requirement 5.7)
        if (existingUser.role === 'student') {
          setStudents(students.map(u => u.uid === uid ? existingUser : u));
        } else if (existingUser.role === 'driver') {
          setDrivers(drivers.map(u => u.uid === uid ? existingUser : u));
        }
        return { success: false, error: fsError.message || 'Failed to update user' };
      }

      // Step 10: Handle role change - move user between lists if role was updated
      if (input.role !== undefined && input.role !== existingUser.role) {
        if (existingUser.role === 'student' && input.role === 'driver') {
          // Move from students to drivers
          setStudents(students.filter(u => u.uid !== uid));
          setDrivers([...drivers, optimisticUser]);
        } else if (existingUser.role === 'driver' && input.role === 'student') {
          // Move from drivers to students
          setDrivers(drivers.filter(u => u.uid !== uid));
          setStudents([...students, optimisticUser]);
        }
      }

      // Step 11: Return success response (Requirement 5.6)
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  /**
   * Delete a user account
   * @see Design Document: deleteUser specification
   * @see Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 14.4, 14.5
   */
  const deleteUser = async (uid: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Step 1: Guard against deleting own account (Requirement 6.5)
      const { auth } = await import('../config/firebase');
      const currentUser = auth.currentUser;
      
      if (currentUser && uid === currentUser.uid) {
        return { success: false, error: 'Cannot delete your own account' };
      }

      // Step 2: Delete Firestore document (Requirement 6.2)
      const { doc, deleteDoc } = await import('firebase/firestore');
      
      try {
        const userDocRef = doc(firestore, 'users', uid);
        await deleteDoc(userDocRef);
      } catch (fsError: any) {
        return { success: false, error: fsError.message || 'Failed to delete user' };
      }

      // Step 3: Clean up RTDB entries (Requirements 6.3, 6.4, 6.8, 14.5)
      // Best-effort cleanup - log errors but don't fail the operation
      const { ref, remove } = await import('firebase/database');
      
      try {
        // Remove presence entry (Requirement 6.3)
        const presenceRef = ref(database, `presence/${uid}`);
        await remove(presenceRef);
      } catch (presenceError: any) {
        // Log error but continue (Requirement 6.8)
        console.error(`RTDB presence cleanup failed for uid: ${uid}`, presenceError);
      }

      try {
        // Remove location entry (Requirement 6.4)
        const locationRef = ref(database, `sharedLocations/${uid}`);
        await remove(locationRef);
      } catch (locationError: any) {
        // Log error but continue (Requirement 6.8)
        console.error(`RTDB location cleanup failed for uid: ${uid}`, locationError);
      }

      // Step 4: Remove user from local state (Requirement 6.6, 14.4)
      setStudents(students.filter(u => u.uid !== uid));
      setDrivers(drivers.filter(u => u.uid !== uid));

      // Step 5: Return success response (Requirement 6.7)
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  /**
   * Get a user by UID from local state
   */
  const getUserById = (uid: string): AdminUser | undefined => {
    return [...students, ...drivers].find(user => user.uid === uid);
  };

  /**
   * Refresh both student and driver lists
   */
  const refreshUsers = async (): Promise<void> => {
    await Promise.all([
      fetchUsers('student'),
      fetchUsers('driver')
    ]);
  };

  return {
    // State
    students,
    drivers,
    isLoading,
    error,

    // CRUD operations
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,

    // Utilities
    getUserById,
    refreshUsers
  };
}
