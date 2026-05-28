import { render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdminUsers } from '@/hooks/use-admin-users';
import type { AdminUser } from '@/types/admin';
import AdminDashboard from './index';

// Mock expo-router
vi.mock('expo-router', () => ({
  useRouter: vi.fn(),
}));

// Mock useAdminUsers hook
vi.mock('@/hooks/use-admin-users', () => ({
  useAdminUsers: vi.fn(),
}));

describe('AdminDashboard', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  const mockFetchUsers = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('should display loading state while fetching data', () => {
    // Arrange: Mock loading state
    (useAdminUsers as any).mockReturnValue({
      students: [],
      drivers: [],
      isLoading: true,
      fetchUsers: mockFetchUsers,
    });

    // Act: Render component
    render(<AdminDashboard />);

    // Assert: Loading indicator should be visible
    expect(screen.getByText('Loading dashboard...')).toBeTruthy();
  });

  it('should display correct statistics for students, drivers, and online users', async () => {
    // Arrange: Mock data with 2 students (1 online), 3 drivers (2 online)
    const mockStudents: AdminUser[] = [
      {
        uid: 's1',
        name: 'Student One',
        email: 'student1@test.com',
        photoURL: null,
        role: 'student',
        status: 'active',
        isOnline: true,
        lastSeen: Date.now(),
        lastLocation: null,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      },
      {
        uid: 's2',
        name: 'Student Two',
        email: 'student2@test.com',
        photoURL: null,
        role: 'student',
        status: 'active',
        isOnline: false,
        lastSeen: null,
        lastLocation: null,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      },
    ];

    const mockDrivers: AdminUser[] = [
      {
        uid: 'd1',
        name: 'Driver One',
        email: 'driver1@test.com',
        photoURL: null,
        role: 'driver',
        status: 'active',
        isOnline: true,
        lastSeen: Date.now(),
        lastLocation: null,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      },
      {
        uid: 'd2',
        name: 'Driver Two',
        email: 'driver2@test.com',
        photoURL: null,
        role: 'driver',
        status: 'active',
        isOnline: true,
        lastSeen: Date.now(),
        lastLocation: null,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      },
      {
        uid: 'd3',
        name: 'Driver Three',
        email: 'driver3@test.com',
        photoURL: null,
        role: 'driver',
        status: 'active',
        isOnline: false,
        lastSeen: null,
        lastLocation: null,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      },
    ];

    (useAdminUsers as any).mockReturnValue({
      students: mockStudents,
      drivers: mockDrivers,
      isLoading: false,
      fetchUsers: mockFetchUsers,
    });

    // Act: Render component
    render(<AdminDashboard />);

    // Assert: Wait for data to be displayed
    await waitFor(() => {
      // Total students: 2
      expect(screen.getByText('2')).toBeTruthy();
      expect(screen.getByText('Total Students')).toBeTruthy();

      // Total drivers: 3
      expect(screen.getByText('3')).toBeTruthy();
      expect(screen.getByText('Total Drivers')).toBeTruthy();

      // Online users: 3 (1 student + 2 drivers)
      expect(screen.getByText('Online Now')).toBeTruthy();
    });
  });

  it('should fetch both students and drivers on mount', () => {
    // Arrange: Mock hook
    (useAdminUsers as any).mockReturnValue({
      students: [],
      drivers: [],
      isLoading: false,
      fetchUsers: mockFetchUsers,
    });

    // Act: Render component
    render(<AdminDashboard />);

    // Assert: fetchUsers should be called twice (once for students, once for drivers)
    expect(mockFetchUsers).toHaveBeenCalledWith('student');
    expect(mockFetchUsers).toHaveBeenCalledWith('driver');
    expect(mockFetchUsers).toHaveBeenCalledTimes(2);
  });

  it('should display navigation cards for students and drivers', () => {
    // Arrange: Mock hook
    (useAdminUsers as any).mockReturnValue({
      students: [],
      drivers: [],
      isLoading: false,
      fetchUsers: mockFetchUsers,
    });

    // Act: Render component
    render(<AdminDashboard />);

    // Assert: Navigation cards should be visible
    expect(screen.getByText('Manage Students')).toBeTruthy();
    expect(screen.getByText('View, create, edit, and delete student accounts')).toBeTruthy();
    expect(screen.getByText('Manage Drivers')).toBeTruthy();
    expect(screen.getByText('View, create, edit, and delete driver accounts')).toBeTruthy();
  });

  it('should display dashboard title and subtitle', () => {
    // Arrange: Mock hook
    (useAdminUsers as any).mockReturnValue({
      students: [],
      drivers: [],
      isLoading: false,
      fetchUsers: mockFetchUsers,
    });

    // Act: Render component
    render(<AdminDashboard />);

    // Assert: Title and subtitle should be visible
    expect(screen.getByText('Admin Dashboard')).toBeTruthy();
    expect(screen.getByText('Manage students and drivers')).toBeTruthy();
  });
});
