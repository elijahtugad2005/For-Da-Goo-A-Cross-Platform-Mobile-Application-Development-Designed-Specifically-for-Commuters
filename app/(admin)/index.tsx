import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { DriverIcon, StudentIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAdminUsers } from '@/hooks/use-admin-users';

/**
 * Admin Dashboard Screen
 * Landing screen showing summary statistics and navigation cards
 * 
 * @see Design Document: app/(admin)/index.tsx component
 * @see Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 11.1, 11.2
 */
export default function AdminDashboard() {
  const router = useRouter();
  const { students, drivers, isLoading, fetchUsers } = useAdminUsers();

  // Fetch both students and drivers on mount
  useEffect(() => {
    fetchUsers('student');
    fetchUsers('driver');
  }, []);

  // Calculate summary statistics
  const totalStudents = students.length;
  const totalDrivers = drivers.length;
  const onlineUsers = [...students, ...drivers].filter(user => user.isOnline).length;

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F56476" />
        <ThemedText style={styles.loadingText}>Loading dashboard...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <ThemedText type="title" style={styles.welcomeTitle}>
            Admin Dashboard
          </ThemedText>
          <ThemedText style={styles.welcomeSubtitle}>
            Manage students and drivers
          </ThemedText>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Overview
          </ThemedText>
          
          <View style={styles.statsGrid}>
            {/* Total Students Card */}
            <View style={[styles.statCard, styles.studentCard]}>
              <View style={styles.statIconContainer}>
                <StudentIcon size={32} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.statValue}>{totalStudents}</ThemedText>
              <ThemedText style={styles.statLabel}>Total Students</ThemedText>
            </View>

            {/* Total Drivers Card */}
            <View style={[styles.statCard, styles.driverCard]}>
              <View style={styles.statIconContainer}>
                <DriverIcon size={32} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.statValue}>{totalDrivers}</ThemedText>
              <ThemedText style={styles.statLabel}>Total Drivers</ThemedText>
            </View>

            {/* Online Users Card */}
            <View style={[styles.statCard, styles.onlineCard]}>
              <View style={styles.statIconContainer}>
                <View style={styles.onlineDot} />
              </View>
              <ThemedText style={styles.statValue}>{onlineUsers}</ThemedText>
              <ThemedText style={styles.statLabel}>Online Now</ThemedText>
            </View>
          </View>
        </View>

        {/* Navigation Cards */}
        <View style={styles.navigationSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Access
          </ThemedText>

          {/* Students List Navigation Card */}
          <Pressable
            style={({ pressed }) => [
              styles.navCard,
              pressed && styles.navCardPressed
            ]}
            onPress={() => router.push('/(admin)/students')}
          >
            <View style={styles.navCardContent}>
              <View style={[styles.navIconContainer, styles.studentNavIcon]}>
                <StudentIcon size={28} color="#FFFFFF" />
              </View>
              <View style={styles.navTextContainer}>
                <ThemedText type="defaultSemiBold" style={styles.navTitle}>
                  Manage Students
                </ThemedText>
                <ThemedText style={styles.navDescription}>
                  View, create, edit, and delete student accounts
                </ThemedText>
              </View>
              <ThemedText style={styles.navArrow}>›</ThemedText>
            </View>
          </Pressable>

          {/* Drivers List Navigation Card */}
          <Pressable
            style={({ pressed }) => [
              styles.navCard,
              pressed && styles.navCardPressed
            ]}
            onPress={() => router.push('/(admin)/drivers')}
          >
            <View style={styles.navCardContent}>
              <View style={[styles.navIconContainer, styles.driverNavIcon]}>
                <DriverIcon size={28} color="#FFFFFF" />
              </View>
              <View style={styles.navTextContainer}>
                <ThemedText type="defaultSemiBold" style={styles.navTitle}>
                  Manage Drivers
                </ThemedText>
                <ThemedText style={styles.navDescription}>
                  View, create, edit, and delete driver accounts
                </ThemedText>
              </View>
              <ThemedText style={styles.navArrow}>›</ThemedText>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#F56476',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentCard: {
    backgroundColor: '#4A90E2',
  },
  driverCard: {
    backgroundColor: '#F5A623',
  },
  onlineCard: {
    backgroundColor: '#7ED321',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  onlineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  navigationSection: {
    marginBottom: 16,
  },
  navCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  navCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  navCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  studentNavIcon: {
    backgroundColor: '#4A90E2',
  },
  driverNavIcon: {
    backgroundColor: '#F5A623',
  },
  navTextContainer: {
    flex: 1,
  },
  navTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  navDescription: {
    fontSize: 14,
    opacity: 0.6,
  },
  navArrow: {
    fontSize: 32,
    color: '#F56476',
    fontWeight: 'bold',
  },
});
