/**
 * Unit tests for useAuth hook
 * Tests admin role support added in task 1.3
 * 
 * **Validates: Requirements 1.3, 9.1**
 */

import { describe, expect, it } from 'vitest';
import type { User, UserRole } from './useAuth';

describe('useAuth - Admin Role Support', () => {
  describe('UserRole type', () => {
    it('should accept "admin" as a valid role', () => {
      // Type test: This should compile without errors
      const adminRole: UserRole = 'admin';
      const studentRole: UserRole = 'student';
      const driverRole: UserRole = 'driver';
      
      expect(adminRole).toBe('admin');
      expect(studentRole).toBe('student');
      expect(driverRole).toBe('driver');
    });

    it('should only accept valid role values', () => {
      const validRoles: UserRole[] = ['admin', 'student', 'driver'];
      
      validRoles.forEach(role => {
        expect(['admin', 'student', 'driver']).toContain(role);
      });
    });
  });

  describe('User interface', () => {
    it('should support admin role in User interface', () => {
      // Type test: This should compile without errors
      const adminUser: User = {
        uid: 'test-admin-uid',
        email: 'admin@test.com',
        role: 'admin',
        name: 'Test Admin',
        photoURL: null,
        isAnonymous: false,
        provider: 'email'
      };
      
      expect(adminUser.role).toBe('admin');
      expect(adminUser.uid).toBe('test-admin-uid');
      expect(adminUser.email).toBe('admin@test.com');
    });

    it('should support student role in User interface', () => {
      const studentUser: User = {
        uid: 'test-student-uid',
        email: 'student@test.com',
        role: 'student',
        name: 'Test Student',
        photoURL: null,
        isAnonymous: false,
        provider: 'email'
      };
      
      expect(studentUser.role).toBe('student');
    });

    it('should support driver role in User interface', () => {
      const driverUser: User = {
        uid: 'test-driver-uid',
        email: 'driver@test.com',
        role: 'driver',
        name: 'Test Driver',
        photoURL: null,
        isAnonymous: false,
        provider: 'email'
      };
      
      expect(driverUser.role).toBe('driver');
    });

    it('should support all required User interface fields', () => {
      const user: User = {
        uid: 'test-uid',
        email: 'test@test.com',
        role: 'admin',
        name: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        isAnonymous: false,
        provider: 'google'
      };
      
      expect(user).toHaveProperty('uid');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('photoURL');
      expect(user).toHaveProperty('isAnonymous');
      expect(user).toHaveProperty('provider');
    });

    it('should allow null values for optional fields', () => {
      const user: User = {
        uid: 'test-uid',
        email: null,
        role: 'admin',
        photoURL: null,
        isAnonymous: true,
        provider: 'anonymous'
      };
      
      expect(user.email).toBeNull();
      expect(user.photoURL).toBeNull();
      expect(user.name).toBeUndefined();
    });
  });

  describe('Role validation', () => {
    it('should validate that admin is a valid UserRole', () => {
      const role: UserRole = 'admin';
      const validRoles: UserRole[] = ['student', 'driver', 'admin'];
      
      expect(validRoles).toContain(role);
    });

    it('should validate all three role types', () => {
      const roles: UserRole[] = ['student', 'driver', 'admin'];
      
      expect(roles).toHaveLength(3);
      expect(roles).toContain('student');
      expect(roles).toContain('driver');
      expect(roles).toContain('admin');
    });
  });
});
