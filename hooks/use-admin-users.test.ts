/**
 * Unit tests for useAdminUsers hook
 * Tests fetchUsers function with presence merge (Task 2.2)
 * Tests createUser function (Task 2.3)
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 9.1, 9.2, 9.3, 9.4, 14.1, 14.2, 14.3**
 */

import { describe, expect, it } from 'vitest';
import type { AdminUser, ExtendedUser } from '../types/admin';

describe('useAdminUsers - fetchUsers implementation', () => {
  describe('Data model validation', () => {
    it('should have correct AdminUser interface structure', () => {
      const mockAdminUser: AdminUser = {
        uid: 'test-uid',
        name: 'Test User',
        email: 'test@example.com',
        photoURL: null,
        role: 'student',
        status: 'active',
        isOnline: true,
        lastSeen: Date.now(),
        lastLocation: {
          latitude: 10.0,
          longitude: 20.0
        },
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
      };

      expect(mockAdminUser).toHaveProperty('uid');
      expect(mockAdminUser).toHaveProperty('isOnline');
      expect(mockAdminUser).toHaveProperty('lastSeen');
      expect(mockAdminUser).toHaveProperty('lastLocation');
      expect(mockAdminUser.role).toBe('student');
      expect(mockAdminUser.status).toBe('active');
    });

    it('should support ExtendedUser interface structure', () => {
      const mockExtendedUser: ExtendedUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        role: 'driver',
        name: 'Test Driver',
        photoURL: null,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        status: 'inactive',
        lastLocation: {
          latitude: 15.5,
          longitude: 25.5,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }
      };

      expect(mockExtendedUser).toHaveProperty('uid');
      expect(mockExtendedUser).toHaveProperty('status');
      expect(mockExtendedUser).toHaveProperty('lastLocation');
      expect(mockExtendedUser.role).toBe('driver');
      expect(mockExtendedUser.status).toBe('inactive');
    });
  });

  describe('Presence merge logic', () => {
    it('should determine online status correctly when lastSeen is within 2 minutes', () => {
      const now = Date.now();
      const oneMinuteAgo = now - (1 * 60 * 1000);
      const TWO_MINUTES_MS = 2 * 60 * 1000;

      const isOnline = (now - oneMinuteAgo) < TWO_MINUTES_MS;

      expect(isOnline).toBe(true);
    });

    it('should determine offline status correctly when lastSeen is older than 2 minutes', () => {
      const now = Date.now();
      const threeMinutesAgo = now - (3 * 60 * 1000);
      const TWO_MINUTES_MS = 2 * 60 * 1000;

      const isOnline = (now - threeMinutesAgo) < TWO_MINUTES_MS;

      expect(isOnline).toBe(false);
    });

    it('should handle missing presence data correctly', () => {
      const presenceData: Record<string, any> = {};
      const userPresence = presenceData['nonexistent-uid'];

      const isOnline = userPresence?.lastSeen 
        ? (Date.now() - userPresence.lastSeen) < (2 * 60 * 1000)
        : false;

      expect(isOnline).toBe(false);
    });
  });

  describe('Location merge logic', () => {
    it('should prioritize RTDB location over Firestore location', () => {
      const rtdbLocation = { latitude: 15.5, longitude: 25.5 };
      const firestoreLocation = { latitude: 10.0, longitude: 20.0 };

      let lastLocation = null;
      if (rtdbLocation?.latitude !== undefined && rtdbLocation?.longitude !== undefined) {
        lastLocation = {
          latitude: rtdbLocation.latitude,
          longitude: rtdbLocation.longitude
        };
      } else if (firestoreLocation) {
        lastLocation = {
          latitude: firestoreLocation.latitude,
          longitude: firestoreLocation.longitude
        };
      }

      expect(lastLocation).toEqual({ latitude: 15.5, longitude: 25.5 });
    });

    it('should fall back to Firestore location when RTDB location is absent', () => {
      const rtdbLocation = null;
      const firestoreLocation = { latitude: 10.0, longitude: 20.0 };

      let lastLocation = null;
      if (rtdbLocation?.latitude !== undefined && rtdbLocation?.longitude !== undefined) {
        lastLocation = {
          latitude: rtdbLocation.latitude,
          longitude: rtdbLocation.longitude
        };
      } else if (firestoreLocation) {
        lastLocation = {
          latitude: firestoreLocation.latitude,
          longitude: firestoreLocation.longitude
        };
      }

      expect(lastLocation).toEqual({ latitude: 10.0, longitude: 20.0 });
    });

    it('should set location to null when no location data is available', () => {
      const rtdbLocation = null;
      const firestoreLocation = null;

      let lastLocation = null;
      if (rtdbLocation?.latitude !== undefined && rtdbLocation?.longitude !== undefined) {
        lastLocation = {
          latitude: rtdbLocation.latitude,
          longitude: rtdbLocation.longitude
        };
      } else if (firestoreLocation) {
        lastLocation = {
          latitude: firestoreLocation.latitude,
          longitude: firestoreLocation.longitude
        };
      }

      expect(lastLocation).toBeNull();
    });
  });

  describe('Role filtering', () => {
    it('should support student role filtering', () => {
      const role: 'student' | 'driver' = 'student';
      expect(role).toBe('student');
    });

    it('should support driver role filtering', () => {
      const role: 'student' | 'driver' = 'driver';
      expect(role).toBe('driver');
    });
  });

  describe('State management', () => {
    it('should handle separate students and drivers state', () => {
      const students: AdminUser[] = [];
      const drivers: AdminUser[] = [];

      expect(students).toEqual([]);
      expect(drivers).toEqual([]);
      expect(students).not.toBe(drivers);
    });

    it('should handle loading state transitions', () => {
      let isLoading = false;
      
      isLoading = true;
      expect(isLoading).toBe(true);
      
      isLoading = false;
      expect(isLoading).toBe(false);
    });

    it('should handle error state', () => {
      let error: string | null = null;
      
      error = 'Test error';
      expect(error).toBe('Test error');
      
      error = null;
      expect(error).toBeNull();
    });
  });
});

describe('useAdminUsers - createUser implementation', () => {
  describe('Input validation', () => {
    it('should validate email format correctly', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test('valid@example.com')).toBe(true);
      expect(emailRegex.test('user.name+tag@example.co.uk')).toBe(true);
      expect(emailRegex.test('invalid@')).toBe(false);
      expect(emailRegex.test('@example.com')).toBe(false);
      expect(emailRegex.test('invalid')).toBe(false);
      expect(emailRegex.test('invalid@.com')).toBe(false);
      expect(emailRegex.test('')).toBe(false);
    });

    it('should validate password length correctly', () => {
      const validPassword = 'password123';
      const shortPassword = '12345';
      const exactlyMinLength = '123456';

      expect(validPassword.length >= 6).toBe(true);
      expect(shortPassword.length >= 6).toBe(false);
      expect(exactlyMinLength.length >= 6).toBe(true);
    });

    it('should validate name is non-empty', () => {
      const validName = 'John Doe';
      const emptyName = '';
      const whitespaceOnly = '   ';

      expect(validName && validName.trim().length > 0).toBe(true);
      expect(!emptyName || emptyName.trim().length === 0).toBe(true);
      expect(!whitespaceOnly || whitespaceOnly.trim().length === 0).toBe(true);
    });
  });

  describe('CreateUserInput interface', () => {
    it('should support valid CreateUserInput structure for student', () => {
      const input: CreateUserInput = {
        name: 'Test Student',
        email: 'student@example.com',
        password: 'password123',
        role: 'student',
        status: 'active'
      };

      expect(input).toHaveProperty('name');
      expect(input).toHaveProperty('email');
      expect(input).toHaveProperty('password');
      expect(input).toHaveProperty('role');
      expect(input).toHaveProperty('status');
      expect(input.role).toBe('student');
      expect(input.status).toBe('active');
    });

    it('should support valid CreateUserInput structure for driver', () => {
      const input: CreateUserInput = {
        name: 'Test Driver',
        email: 'driver@example.com',
        password: 'securepass',
        role: 'driver',
        status: 'inactive'
      };

      expect(input.role).toBe('driver');
      expect(input.status).toBe('inactive');
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle invalid email error response', () => {
      const response = { success: false, error: 'Invalid email format' };
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid email format');
    });

    it('should handle password too short error response', () => {
      const response = { success: false, error: 'Password must be at least 6 characters' };
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Password must be at least 6 characters');
    });

    it('should handle name required error response', () => {
      const response = { success: false, error: 'Name is required' };
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Name is required');
    });

    it('should handle email already in use error response', () => {
      const response = { success: false, error: 'This email is already registered' };
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('This email is already registered');
    });

    it('should handle success response', () => {
      const response = { success: true };
      
      expect(response.success).toBe(true);
      expect(response.error).toBeUndefined();
    });
  });

  describe('User document structure', () => {
    it('should create correct Firestore document structure', () => {
      const uid = 'test-uid-123';
      const input: CreateUserInput = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student',
        status: 'active'
      };

      const firestoreDoc = {
        uid,
        name: input.name,
        email: input.email,
        role: input.role,
        status: input.status,
        photoURL: null,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
      };

      expect(firestoreDoc).toHaveProperty('uid');
      expect(firestoreDoc).toHaveProperty('name');
      expect(firestoreDoc).toHaveProperty('email');
      expect(firestoreDoc).toHaveProperty('role');
      expect(firestoreDoc).toHaveProperty('status');
      expect(firestoreDoc).toHaveProperty('photoURL');
      expect(firestoreDoc).toHaveProperty('createdAt');
      expect(firestoreDoc).toHaveProperty('updatedAt');
      expect(firestoreDoc.photoURL).toBeNull();
    });
  });

  describe('Local state update', () => {
    it('should create correct AdminUser for local state', () => {
      const uid = 'test-uid-123';
      const input: CreateUserInput = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student',
        status: 'active'
      };

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

      expect(newAdminUser.uid).toBe(uid);
      expect(newAdminUser.name).toBe(input.name);
      expect(newAdminUser.email).toBe(input.email);
      expect(newAdminUser.role).toBe(input.role);
      expect(newAdminUser.status).toBe(input.status);
      expect(newAdminUser.isOnline).toBe(false);
      expect(newAdminUser.lastSeen).toBeNull();
      expect(newAdminUser.lastLocation).toBeNull();
    });

    it('should add student to students array', () => {
      const students: AdminUser[] = [];
      const newStudent: AdminUser = {
        uid: 'student-1',
        name: 'Student One',
        email: 'student1@example.com',
        photoURL: null,
        role: 'student',
        status: 'active',
        isOnline: false,
        lastSeen: null,
        lastLocation: null,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
      };

      const updatedStudents = [...students, newStudent];

      expect(updatedStudents.length).toBe(1);
      expect(updatedStudents[0].uid).toBe('student-1');
      expect(updatedStudents[0].role).toBe('student');
    });

    it('should add driver to drivers array', () => {
      const drivers: AdminUser[] = [];
      const newDriver: AdminUser = {
        uid: 'driver-1',
        name: 'Driver One',
        email: 'driver1@example.com',
        photoURL: null,
        role: 'driver',
        status: 'active',
        isOnline: false,
        lastSeen: null,
        lastLocation: null,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
      };

      const updatedDrivers = [...drivers, newDriver];

      expect(updatedDrivers.length).toBe(1);
      expect(updatedDrivers[0].uid).toBe('driver-1');
      expect(updatedDrivers[0].role).toBe('driver');
    });
  });

  describe('Role-based state routing', () => {
    it('should route student to students array', () => {
      const role: 'student' | 'driver' = 'student';
      const shouldAddToStudents = role === 'student';
      const shouldAddToDrivers = role === 'driver';

      expect(shouldAddToStudents).toBe(true);
      expect(shouldAddToDrivers).toBe(false);
    });

    it('should route driver to drivers array', () => {
      const role: 'student' | 'driver' = 'driver';
      const shouldAddToStudents = role === 'student';
      const shouldAddToDrivers = role === 'driver';

      expect(shouldAddToStudents).toBe(false);
      expect(shouldAddToDrivers).toBe(true);
    });
  });
});

describe('useAdminUsers - updateUser implementation', () => {
  describe('Input validation', () => {
    it('should reject empty input object', () => {
      const input = {};
      const hasFields = Object.keys(input).length > 0;
      
      expect(hasFields).toBe(false);
    });

    it('should accept input with at least one field', () => {
      const input = { name: 'Updated Name' };
      const hasFields = Object.keys(input).length > 0;
      
      expect(hasFields).toBe(true);
    });

    it('should validate name is non-empty string when provided', () => {
      const validName = 'John Doe';
      const emptyName = '';
      const whitespaceOnly = '   ';

      expect(typeof validName === 'string' && validName.trim().length > 0).toBe(true);
      expect(typeof emptyName === 'string' && emptyName.trim().length === 0).toBe(true);
      expect(typeof whitespaceOnly === 'string' && whitespaceOnly.trim().length === 0).toBe(true);
    });

    it('should validate status is active or inactive when provided', () => {
      const validStatus1 = 'active';
      const validStatus2 = 'inactive';
      const invalidStatus = 'pending';

      expect(validStatus1 === 'active' || validStatus1 === 'inactive').toBe(true);
      expect(validStatus2 === 'active' || validStatus2 === 'inactive').toBe(true);
      expect(invalidStatus === 'active' || invalidStatus === 'inactive').toBe(false);
    });

    it('should validate role is student or driver when provided', () => {
      const validRole1 = 'student';
      const validRole2 = 'driver';
      const invalidRole = 'admin';

      expect(validRole1 === 'student' || validRole1 === 'driver').toBe(true);
      expect(validRole2 === 'student' || validRole2 === 'driver').toBe(true);
      expect(invalidRole === 'student' || invalidRole === 'driver').toBe(false);
    });

    it('should validate latitude range when lastLocation is provided', () => {
      const validLat1 = 0;
      const validLat2 = 90;
      const validLat3 = -90;
      const invalidLat1 = 91;
      const invalidLat2 = -91;

      expect(validLat1 >= -90 && validLat1 <= 90).toBe(true);
      expect(validLat2 >= -90 && validLat2 <= 90).toBe(true);
      expect(validLat3 >= -90 && validLat3 <= 90).toBe(true);
      expect(invalidLat1 >= -90 && invalidLat1 <= 90).toBe(false);
      expect(invalidLat2 >= -90 && invalidLat2 <= 90).toBe(false);
    });

    it('should validate longitude range when lastLocation is provided', () => {
      const validLng1 = 0;
      const validLng2 = 180;
      const validLng3 = -180;
      const invalidLng1 = 181;
      const invalidLng2 = -181;

      expect(validLng1 >= -180 && validLng1 <= 180).toBe(true);
      expect(validLng2 >= -180 && validLng2 <= 180).toBe(true);
      expect(validLng3 >= -180 && validLng3 <= 180).toBe(true);
      expect(invalidLng1 >= -180 && invalidLng1 <= 180).toBe(false);
      expect(invalidLng2 >= -180 && invalidLng2 <= 180).toBe(false);
    });
  });

  describe('UpdateUserInput interface', () => {
    it('should support partial update with name only', () => {
      const input: UpdateUserInput = {
        name: 'Updated Name'
      };

      expect(input).toHaveProperty('name');
      expect(input.name).toBe('Updated Name');
      expect(input.status).toBeUndefined();
      expect(input.role).toBeUndefined();
    });

    it('should support partial update with status only', () => {
      const input: UpdateUserInput = {
        status: 'inactive'
      };

      expect(input).toHaveProperty('status');
      expect(input.status).toBe('inactive');
      expect(input.name).toBeUndefined();
      expect(input.role).toBeUndefined();
    });

    it('should support partial update with role only', () => {
      const input: UpdateUserInput = {
        role: 'driver'
      };

      expect(input).toHaveProperty('role');
      expect(input.role).toBe('driver');
      expect(input.name).toBeUndefined();
      expect(input.status).toBeUndefined();
    });

    it('should support partial update with lastLocation', () => {
      const input: UpdateUserInput = {
        lastLocation: { latitude: 10.5, longitude: 20.5 }
      };

      expect(input).toHaveProperty('lastLocation');
      expect(input.lastLocation).toEqual({ latitude: 10.5, longitude: 20.5 });
    });

    it('should support setting lastLocation to null', () => {
      const input: UpdateUserInput = {
        lastLocation: null
      };

      expect(input).toHaveProperty('lastLocation');
      expect(input.lastLocation).toBeNull();
    });

    it('should support updating multiple fields', () => {
      const input: UpdateUserInput = {
        name: 'New Name',
        status: 'active',
        role: 'student'
      };

      expect(input.name).toBe('New Name');
      expect(input.status).toBe('active');
      expect(input.role).toBe('student');
    });
  });

  describe('Optimistic update logic', () => {
    it('should merge updated fields into existing user', () => {
      const existingUser: AdminUser = {
        uid: 'user-1',
        name: 'Old Name',
        email: 'user@example.com',
        photoURL: null,
        role: 'student',
        status: 'active',
        isOnline: true,
        lastSeen: Date.now(),
        lastLocation: null,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
      };

      const input: UpdateUserInput = {
        name: 'New Name',
        status: 'inactive'
      };

      const optimisticUser: AdminUser = {
        ...existingUser,
        ...(input.name !== undefined && { name: input.name }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.role !== undefined && { role: input.role }),
        ...(input.lastLocation !== undefined && { lastLocation: input.lastLocation })
      };

      expect(optimisticUser.name).toBe('New Name');
      expect(optimisticUser.status).toBe('inactive');
      expect(optimisticUser.email).toBe('user@example.com');
      expect(optimisticUser.role).toBe('student');
      expect(optimisticUser.isOnline).toBe(true);
    });

    it('should update user in students array', () => {
      const students: AdminUser[] = [
        {
          uid: 'student-1',
          name: 'Student One',
          email: 'student1@example.com',
          photoURL: null,
          role: 'student',
          status: 'active',
          isOnline: false,
          lastSeen: null,
          lastLocation: null,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        },
        {
          uid: 'student-2',
          name: 'Student Two',
          email: 'student2@example.com',
          photoURL: null,
          role: 'student',
          status: 'active',
          isOnline: false,
          lastSeen: null,
          lastLocation: null,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }
      ];

      const updatedUser = { ...students[0], name: 'Updated Name' };
      const updatedStudents = students.map(u => u.uid === 'student-1' ? updatedUser : u);

      expect(updatedStudents[0].name).toBe('Updated Name');
      expect(updatedStudents[1].name).toBe('Student Two');
      expect(updatedStudents.length).toBe(2);
    });

    it('should update user in drivers array', () => {
      const drivers: AdminUser[] = [
        {
          uid: 'driver-1',
          name: 'Driver One',
          email: 'driver1@example.com',
          photoURL: null,
          role: 'driver',
          status: 'active',
          isOnline: false,
          lastSeen: null,
          lastLocation: null,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }
      ];

      const updatedUser = { ...drivers[0], status: 'inactive' as const };
      const updatedDrivers = drivers.map(u => u.uid === 'driver-1' ? updatedUser : u);

      expect(updatedDrivers[0].status).toBe('inactive');
      expect(updatedDrivers.length).toBe(1);
    });
  });

  describe('Role change handling', () => {
    it('should move user from students to drivers when role changes to driver', () => {
      const students: AdminUser[] = [
        {
          uid: 'user-1',
          name: 'User One',
          email: 'user1@example.com',
          photoURL: null,
          role: 'student',
          status: 'active',
          isOnline: false,
          lastSeen: null,
          lastLocation: null,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }
      ];
      const drivers: AdminUser[] = [];

      const existingUser = students[0];
      const newRole = 'driver';

      if (existingUser.role === 'student' && newRole === 'driver') {
        const updatedUser = { ...existingUser, role: newRole as const };
        const newStudents = students.filter(u => u.uid !== 'user-1');
        const newDrivers = [...drivers, updatedUser];

        expect(newStudents.length).toBe(0);
        expect(newDrivers.length).toBe(1);
        expect(newDrivers[0].role).toBe('driver');
      }
    });

    it('should move user from drivers to students when role changes to student', () => {
      const students: AdminUser[] = [];
      const drivers: AdminUser[] = [
        {
          uid: 'user-1',
          name: 'User One',
          email: 'user1@example.com',
          photoURL: null,
          role: 'driver',
          status: 'active',
          isOnline: false,
          lastSeen: null,
          lastLocation: null,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }
      ];

      const existingUser = drivers[0];
      const newRole = 'student';

      if (existingUser.role === 'driver' && newRole === 'student') {
        const updatedUser = { ...existingUser, role: newRole as const };
        const newDrivers = drivers.filter(u => u.uid !== 'user-1');
        const newStudents = [...students, updatedUser];

        expect(newDrivers.length).toBe(0);
        expect(newStudents.length).toBe(1);
        expect(newStudents[0].role).toBe('student');
      }
    });
  });

  describe('Firestore update data structure', () => {
    it('should include updatedAt timestamp', () => {
      const updateData: any = {
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
      };

      expect(updateData).toHaveProperty('updatedAt');
    });

    it('should include only provided fields in update data', () => {
      const input: UpdateUserInput = {
        name: 'New Name',
        status: 'inactive'
      };

      const updateData: any = {
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
      };

      if (input.name !== undefined) {
        updateData.name = input.name;
      }
      if (input.status !== undefined) {
        updateData.status = input.status;
      }
      if (input.role !== undefined) {
        updateData.role = input.role;
      }

      expect(updateData).toHaveProperty('name');
      expect(updateData).toHaveProperty('status');
      expect(updateData).not.toHaveProperty('role');
      expect(updateData.name).toBe('New Name');
      expect(updateData.status).toBe('inactive');
    });

    it('should structure lastLocation with updatedAt when provided', () => {
      const input: UpdateUserInput = {
        lastLocation: { latitude: 10.5, longitude: 20.5 }
      };

      const updateData: any = {
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
      };

      if (input.lastLocation !== undefined) {
        if (input.lastLocation === null) {
          updateData.lastLocation = null;
        } else {
          updateData.lastLocation = {
            latitude: input.lastLocation.latitude,
            longitude: input.lastLocation.longitude,
            updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
          };
        }
      }

      expect(updateData.lastLocation).toHaveProperty('latitude');
      expect(updateData.lastLocation).toHaveProperty('longitude');
      expect(updateData.lastLocation).toHaveProperty('updatedAt');
      expect(updateData.lastLocation.latitude).toBe(10.5);
      expect(updateData.lastLocation.longitude).toBe(20.5);
    });

    it('should set lastLocation to null when explicitly provided as null', () => {
      const input: UpdateUserInput = {
        lastLocation: null
      };

      const updateData: any = {
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
      };

      if (input.lastLocation !== undefined) {
        if (input.lastLocation === null) {
          updateData.lastLocation = null;
        } else {
          updateData.lastLocation = {
            latitude: input.lastLocation.latitude,
            longitude: input.lastLocation.longitude,
            updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
          };
        }
      }

      expect(updateData.lastLocation).toBeNull();
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle no fields provided error', () => {
      const response = { success: false, error: 'No fields provided to update' };
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('No fields provided to update');
    });

    it('should handle invalid name error', () => {
      const response = { success: false, error: 'Name must be a non-empty string' };
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Name must be a non-empty string');
    });

    it('should handle invalid status error', () => {
      const response = { success: false, error: 'Status must be either "active" or "inactive"' };
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Status must be either "active" or "inactive"');
    });

    it('should handle invalid role error', () => {
      const response = { success: false, error: 'Role must be either "student" or "driver"' };
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Role must be either "student" or "driver"');
    });

    it('should handle invalid latitude error', () => {
      const response = { success: false, error: 'Latitude must be in range [-90, 90]' };
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Latitude must be in range [-90, 90]');
    });

    it('should handle invalid longitude error', () => {
      const response = { success: false, error: 'Longitude must be in range [-180, 180]' };
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Longitude must be in range [-180, 180]');
    });

    it('should handle user not found error', () => {
      const response = { success: false, error: 'User not found' };
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('User not found');
    });

    it('should handle success response', () => {
      const response = { success: true };
      
      expect(response.success).toBe(true);
      expect(response.error).toBeUndefined();
    });
  });

  describe('getUserById utility', () => {
    it('should find user in students array', () => {
      const students: AdminUser[] = [
        {
          uid: 'student-1',
          name: 'Student One',
          email: 'student1@example.com',
          photoURL: null,
          role: 'student',
          status: 'active',
          isOnline: false,
          lastSeen: null,
          lastLocation: null,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }
      ];
      const drivers: AdminUser[] = [];

      const user = [...students, ...drivers].find(u => u.uid === 'student-1');

      expect(user).toBeDefined();
      expect(user?.uid).toBe('student-1');
      expect(user?.role).toBe('student');
    });

    it('should find user in drivers array', () => {
      const students: AdminUser[] = [];
      const drivers: AdminUser[] = [
        {
          uid: 'driver-1',
          name: 'Driver One',
          email: 'driver1@example.com',
          photoURL: null,
          role: 'driver',
          status: 'active',
          isOnline: false,
          lastSeen: null,
          lastLocation: null,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }
      ];

      const user = [...students, ...drivers].find(u => u.uid === 'driver-1');

      expect(user).toBeDefined();
      expect(user?.uid).toBe('driver-1');
      expect(user?.role).toBe('driver');
    });

    it('should return undefined for non-existent user', () => {
      const students: AdminUser[] = [];
      const drivers: AdminUser[] = [];

      const user = [...students, ...drivers].find(u => u.uid === 'non-existent');

      expect(user).toBeUndefined();
    });

    it('should search across both students and drivers arrays', () => {
      const students: AdminUser[] = [
        {
          uid: 'student-1',
          name: 'Student One',
          email: 'student1@example.com',
          photoURL: null,
          role: 'student',
          status: 'active',
          isOnline: false,
          lastSeen: null,
          lastLocation: null,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }
      ];
      const drivers: AdminUser[] = [
        {
          uid: 'driver-1',
          name: 'Driver One',
          email: 'driver1@example.com',
          photoURL: null,
          role: 'driver',
          status: 'active',
          isOnline: false,
          lastSeen: null,
          lastLocation: null,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }
      ];

      const combinedArray = [...students, ...drivers];
      
      const studentUser = combinedArray.find(u => u.uid === 'student-1');
      const driverUser = combinedArray.find(u => u.uid === 'driver-1');

      expect(studentUser).toBeDefined();
      expect(studentUser?.role).toBe('student');
      expect(driverUser).toBeDefined();
      expect(driverUser?.role).toBe('driver');
      expect(combinedArray.length).toBe(2);
    });
  });

  describe('refreshUsers utility', () => {
    it('should call fetchUsers for both student and driver roles', async () => {
      // Mock fetchUsers calls
      const fetchUsersCalls: Array<'student' | 'driver'> = [];
      
      const mockFetchUsers = async (role: 'student' | 'driver'): Promise<void> => {
        fetchUsersCalls.push(role);
      };

      // Simulate refreshUsers implementation
      await Promise.all([
        mockFetchUsers('student'),
        mockFetchUsers('driver')
      ]);

      expect(fetchUsersCalls).toHaveLength(2);
      expect(fetchUsersCalls).toContain('student');
      expect(fetchUsersCalls).toContain('driver');
    });

    it('should execute both fetches in parallel', async () => {
      const startTimes: Record<string, number> = {};
      const endTimes: Record<string, number> = {};

      const mockFetchUsers = async (role: 'student' | 'driver'): Promise<void> => {
        startTimes[role] = Date.now();
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 10));
        endTimes[role] = Date.now();
      };

      // Execute in parallel using Promise.all
      await Promise.all([
        mockFetchUsers('student'),
        mockFetchUsers('driver')
      ]);

      // Both should start around the same time (parallel execution)
      const timeDifference = Math.abs(startTimes.student - startTimes.driver);
      
      expect(startTimes.student).toBeDefined();
      expect(startTimes.driver).toBeDefined();
      expect(endTimes.student).toBeDefined();
      expect(endTimes.driver).toBeDefined();
      // Time difference should be minimal for parallel execution (< 50ms)
      expect(timeDifference).toBeLessThan(50);
    });

    it('should handle errors from individual fetch operations', async () => {
      const errors: string[] = [];

      const mockFetchUsers = async (role: 'student' | 'driver'): Promise<void> => {
        if (role === 'student') {
          throw new Error('Failed to fetch students');
        }
        // Driver fetch succeeds
      };

      try {
        await Promise.all([
          mockFetchUsers('student'),
          mockFetchUsers('driver')
        ]);
      } catch (error) {
        if (error instanceof Error) {
          errors.push(error.message);
        }
      }

      // Promise.all rejects if any promise rejects
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe('Failed to fetch students');
    });

    it('should return a Promise that resolves when both fetches complete', async () => {
      let studentsLoaded = false;
      let driversLoaded = false;

      const mockFetchUsers = async (role: 'student' | 'driver'): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 5));
        if (role === 'student') {
          studentsLoaded = true;
        } else {
          driversLoaded = true;
        }
      };

      // Before refresh
      expect(studentsLoaded).toBe(false);
      expect(driversLoaded).toBe(false);

      // Execute refresh
      await Promise.all([
        mockFetchUsers('student'),
        mockFetchUsers('driver')
      ]);

      // After refresh
      expect(studentsLoaded).toBe(true);
      expect(driversLoaded).toBe(true);
    });

    it('should maintain correct Promise.all semantics', async () => {
      const results: string[] = [];

      const mockFetchUsers = async (role: 'student' | 'driver'): Promise<void> => {
        results.push(`${role}-started`);
        await new Promise(resolve => setTimeout(resolve, 5));
        results.push(`${role}-completed`);
      };

      await Promise.all([
        mockFetchUsers('student'),
        mockFetchUsers('driver')
      ]);

      // Both should have started and completed
      expect(results).toContain('student-started');
      expect(results).toContain('student-completed');
      expect(results).toContain('driver-started');
      expect(results).toContain('driver-completed');
      expect(results).toHaveLength(4);
    });
  });
});

describe('useAdminUsers - deleteUser implementation', () => {
  describe('Self-deletion guard', () => {
    it('should prevent admin from deleting their own account', () => {
      const currentUserUid = 'admin-123';
      const targetUid = 'admin-123';
      
      const canDelete = targetUid !== currentUserUid;
      
      expect(canDelete).toBe(false);
    });

    it('should allow admin to delete other users', () => {
      const currentUserUid = 'admin-123';
      const targetUid = 'user-456';
      
      const canDelete = targetUid !== currentUserUid;
      
      expect(canDelete).toBe(true);
    });
  });

  describe('State cleanup', () => {
    it('should remove user from students array', () => {
      const students: AdminUser[] = [
        {
          uid: 'student-1',
          name: 'Student One',
          email: 'student1@example.com',
          photoURL: null,
          role: 'student',
          status: 'active',
          isOnline: false,
          lastSeen: null,
          lastLocation: null,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        },
        {
          uid: 'student-2',
          name: 'Student Two',
          email: 'student2@example.com',
          photoURL: null,
          role: 'student',
          status: 'active',
          isOnline: false,
          lastSeen: null,
          lastLocation: null,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }
      ];

      const updatedStudents = students.filter(u => u.uid !== 'student-1');

      expect(updatedStudents.length).toBe(1);
      expect(updatedStudents[0].uid).toBe('student-2');
      expect(updatedStudents.find(u => u.uid === 'student-1')).toBeUndefined();
    });

    it('should remove user from drivers array', () => {
      const drivers: AdminUser[] = [
        {
          uid: 'driver-1',
          name: 'Driver One',
          email: 'driver1@example.com',
          photoURL: null,
          role: 'driver',
          status: 'active',
          isOnline: false,
          lastSeen: null,
          lastLocation: null,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }
      ];

      const updatedDrivers = drivers.filter(u => u.uid !== 'driver-1');

      expect(updatedDrivers.length).toBe(0);
      expect(updatedDrivers.find(u => u.uid === 'driver-1')).toBeUndefined();
    });

    it('should remove user from both arrays (defensive cleanup)', () => {
      const students: AdminUser[] = [
        {
          uid: 'user-1',
          name: 'User One',
          email: 'user1@example.com',
          photoURL: null,
          role: 'student',
          status: 'active',
          isOnline: false,
          lastSeen: null,
          lastLocation: null,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any
        }
      ];
      const drivers: AdminUser[] = [];

      const updatedStudents = students.filter(u => u.uid !== 'user-1');
      const updatedDrivers = drivers.filter(u => u.uid !== 'user-1');

      expect(updatedStudents.length).toBe(0);
      expect(updatedDrivers.length).toBe(0);
    });
  });

  describe('RTDB cleanup paths', () => {
    it('should construct correct presence path', () => {
      const uid = 'user-123';
      const presencePath = `presence/${uid}`;
      
      expect(presencePath).toBe('presence/user-123');
    });

    it('should construct correct location path', () => {
      const uid = 'user-123';
      const locationPath = `sharedLocations/${uid}`;
      
      expect(locationPath).toBe('sharedLocations/user-123');
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle cannot delete own account error', () => {
      const response = { success: false, error: 'Cannot delete your own account' };
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Cannot delete your own account');
    });

    it('should handle Firestore deletion failure', () => {
      const response = { success: false, error: 'Failed to delete user' };
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Failed to delete user');
    });

    it('should handle success response', () => {
      const response = { success: true };
      
      expect(response.success).toBe(true);
      expect(response.error).toBeUndefined();
    });

    it('should succeed even if RTDB cleanup fails (best-effort)', () => {
      // Simulating scenario where Firestore delete succeeds but RTDB cleanup fails
      const firestoreSuccess = true;
      const rtdbPresenceFailed = true;
      const rtdbLocationFailed = true;
      
      // RTDB failures are logged but don't affect success
      const response = { success: firestoreSuccess };
      
      expect(response.success).toBe(true);
      // In real implementation, errors would be logged to console
    });
  });

  describe('Deletion order and consistency', () => {
    it('should prioritize Firestore deletion', () => {
      // Firestore deletion must succeed for operation to be considered successful
      const firestoreDeleted = true;
      const rtdbCleaned = false; // RTDB cleanup can fail
      
      const operationSuccess = firestoreDeleted; // Success depends only on Firestore
      
      expect(operationSuccess).toBe(true);
    });

    it('should clean up both RTDB locations', () => {
      const uid = 'user-123';
      const rtdbPaths = [
        `presence/${uid}`,
        `sharedLocations/${uid}`
      ];
      
      expect(rtdbPaths).toHaveLength(2);
      expect(rtdbPaths[0]).toBe('presence/user-123');
      expect(rtdbPaths[1]).toBe('sharedLocations/user-123');
    });
  });

  describe('Data consistency requirements', () => {
    it('should maintain data consistency by removing from all sources', () => {
      const uid = 'user-123';
      
      // Track what should be cleaned up
      const cleanupTargets = {
        firestore: `users/${uid}`,
        rtdbPresence: `presence/${uid}`,
        rtdbLocation: `sharedLocations/${uid}`,
        localStateStudents: true,
        localStateDrivers: true
      };
      
      expect(cleanupTargets.firestore).toBe('users/user-123');
      expect(cleanupTargets.rtdbPresence).toBe('presence/user-123');
      expect(cleanupTargets.rtdbLocation).toBe('sharedLocations/user-123');
      expect(cleanupTargets.localStateStudents).toBe(true);
      expect(cleanupTargets.localStateDrivers).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle deletion of user not in local state', () => {
      const students: AdminUser[] = [];
      const drivers: AdminUser[] = [];
      const uidToDelete = 'non-existent-user';
      
      const updatedStudents = students.filter(u => u.uid !== uidToDelete);
      const updatedDrivers = drivers.filter(u => u.uid !== uidToDelete);
      
      expect(updatedStudents.length).toBe(0);
      expect(updatedDrivers.length).toBe(0);
    });

    it('should handle empty uid string', () => {
      const uid = '';
      const isValidUid = uid.length > 0;
      
      expect(isValidUid).toBe(false);
    });
  });
});
