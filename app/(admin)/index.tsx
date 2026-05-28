import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AdminIcon, DriverIcon, StudentIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAdminUsers } from '@/hooks/use-admin-users';

// ─── Color tokens (black palette) ────────────────────────────────────────────
// Backgrounds  #0A0A0A (root) / #111111 (card) / #1A1A1A (elevated) / #222222 (input)
// Borders      rgba(255,255,255,0.07) default / rgba(255,255,255,0.12) hover
// Text         #FFFFFF primary / #888888 secondary / #555555 muted
// Accents      #FFFFFF (primary) / #3ECF8E (green) / #F5A623 (amber) / #5B8DF6 (blue)

// ─── Sparkline ────────────────────────────────────────────────────────────────

const Sparkline = ({ data, colors }: { data: number[]; colors: string[] }) => {
  const max = Math.max(...data);
  return (
    <View style={chart.row}>
      {data.map((val, i) => (
        <View
          key={i}
          style={[chart.bar, { height: (val / max) * 20 + 4, backgroundColor: colors[i] }]}
        />
      ))}
    </View>
  );
};

// ─── Donut ────────────────────────────────────────────────────────────────────

const DonutChart = ({
  percentage,
  color,
  size = 88,
}: {
  percentage: number;
  color: string;
  size?: number;
}) => {
  const sw = 10;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Track */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: sw,
          borderColor: '#2A2A2A',
        }}
      />
      {/* Indicator */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: sw,
          borderColor: color,
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          transform: [{ rotate: `${-90 + (percentage / 100) * 180}deg` }],
        }}
      />
      {/* Hole */}
      <View
        style={{
          width: size - sw * 2 - 4,
          height: size - sw * 2 - 4,
          borderRadius: (size - sw * 2 - 4) / 2,
          backgroundColor: '#111111',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ThemedText style={{ fontSize: 15, fontWeight: '500', color: '#FFFFFF' }}>
          {Math.round(percentage)}%
        </ThemedText>
      </View>
    </View>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────

type StatCardProps = {
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  accentColor: string;
  value: string | number;
  label: string;
  growth: string;
  growthUp?: boolean;
  sparkData: number[];
  sparkColors: string[];
};

const StatCard = ({
  iconBg,
  icon,
  accentColor,
  value,
  label,
  growth,
  growthUp,
  sparkData,
  sparkColors,
}: StatCardProps) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
    </View>
    <ThemedText style={styles.statValue}>{value}</ThemedText>
    <ThemedText style={styles.statLabel}>{label}</ThemedText>
    <View style={styles.statBottom}>
      <Sparkline data={sparkData} colors={sparkColors} />
      <ThemedText style={[styles.statGrowth, growthUp && styles.statGrowthUp]}>
        {growth}
      </ThemedText>
    </View>
  </View>
);

// ─── Timeline item ────────────────────────────────────────────────────────────

type TimelineItemProps = {
  name: string;
  action: string;
  time: string;
  dot: string;
  isLast: boolean;
};

const TimelineItem = ({ name, action, time, dot, isLast }: TimelineItemProps) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineLeft}>
      <View style={[styles.timelineDot, { backgroundColor: dot }]} />
      {!isLast && <View style={styles.timelineLine} />}
    </View>
    <View style={styles.timelineContent}>
      <ThemedText style={styles.timelineName}>{name}</ThemedText>
      <ThemedText style={styles.timelineAction}>{action}</ThemedText>
      <ThemedText style={styles.timelineTime}>{time}</ThemedText>
    </View>
  </View>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const { students, drivers, isLoading, fetchUsers } = useAdminUsers();

  useEffect(() => {
    fetchUsers('student');
    fetchUsers('driver');
  }, []);

  const totalStudents = students.length;
  const totalDrivers = drivers.length;
  const totalUsers = totalStudents + totalDrivers;
  const onlineUsers = [...students, ...drivers].filter(u => u.isOnline).length;
  const activeStudents = students.filter(u => u.status === 'active').length;
  const activeDrivers = drivers.filter(u => u.status === 'active').length;

  const studentPct = totalUsers > 0 ? (totalStudents / totalUsers) * 100 : 0;
  const onlinePct = totalUsers > 0 ? (onlineUsers / totalUsers) * 100 : 0;

  const recentActivity = [
    ...students.slice(0, 2).map(u => ({
      name: u.name ?? 'Student',
      action: u.isOnline ? 'Logged in' : 'Last seen recently',
      time: '2 min ago',
      dot: u.isOnline ? '#3ECF8E' : '#333333',
    })),
    ...drivers.slice(0, 1).map(u => ({
      name: u.name ?? 'Driver',
      action: u.isOnline ? 'On route' : 'Off duty',
      time: '15 min ago',
      dot: u.isOnline ? '#F5A623' : '#333333',
    })),
  ];

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <ThemedText style={styles.loadingText}>Loading dashboard…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <ThemedText style={styles.greeting}>Hello, Admin</ThemedText>
              <ThemedText style={styles.headerSubtitle}>Here's what's happening today</ThemedText>
            </View>
            <View style={styles.headerIcons}>
              <View style={styles.iconButton}>
                <ThemedText style={styles.iconEmoji}>🔍</ThemedText>
              </View>
              <View style={styles.avatar}>
                <AdminIcon size={18} color="#000000" />
              </View>
            </View>
          </View>
          <View style={styles.searchBar}>
            <ThemedText style={styles.searchPlaceholder}>Quick search users…</ThemedText>
          </View>
        </View>

        {/* ── Stats grid ── */}
        <View style={styles.statsGrid}>
          <StatCard
            iconBg="#1E1E1E"
            iconColor="#FFFFFF"
            icon={<ThemedText style={{ fontSize: 20 }}>👥</ThemedText>}
            accentColor="#3ECF8E"
            value={totalUsers}
            label="Total users"
            growth="+12% vs last week"
            growthUp
            sparkData={[4, 7, 5, 9, 12]}
            sparkColors={['#333333', '#444444', '#555555', '#888888', '#FFFFFF']}
          />
          <StatCard
            iconBg="#1E1E1E"
            iconColor="#5B8DF6"
            icon={<StudentIcon size={18} color="#5B8DF6" />}
            accentColor="#5B8DF6"
            value={totalStudents}
            label="Students"
            growth={`${activeStudents} active`}
            sparkData={[6, 9, 8, 11, 14]}
            sparkColors={['#1E2A3A', '#1E2A3A', '#2D4070', '#3D5490', '#5B8DF6']}
          />
          <StatCard
            iconBg="#1E1E1E"
            iconColor="#F5A623"
            icon={<DriverIcon size={18} color="#F5A623" />}
            accentColor="#F5A623"
            value={totalDrivers}
            label="Drivers"
            growth={`${activeDrivers} active`}
            sparkData={[3, 5, 4, 6, 7]}
            sparkColors={['#2A1F0A', '#2A1F0A', '#4A360A', '#8A5F0A', '#F5A623']}
          />
          <StatCard
            iconBg="#1E1E1E"
            iconColor="#3ECF8E"
            icon={<ThemedText style={{ fontSize: 20 }}>●</ThemedText>}
            accentColor="#3ECF8E"
            value={onlineUsers}
            label="Online now"
            growth={`${Math.round(onlinePct)}% of total`}
            sparkData={[3, 5, 4, 6, 7]}
            sparkColors={['#0A2A1A', '#0A2A1A', '#0F3D25', '#1A6640', '#3ECF8E']}
          />
        </View>

        {/* ── User distribution ── */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>User distribution</ThemedText>
          <View style={styles.card}>
            <View style={styles.chartRow}>
              <DonutChart percentage={studentPct} color="#5B8DF6" />
              <DonutChart percentage={onlinePct} color="#3ECF8E" />
              <View style={styles.legend}>
                {[
                  { label: 'Students', color: '#5B8DF6' },
                  { label: 'Online', color: '#3ECF8E' },
                ].map(l => (
                  <View key={l.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                    <ThemedText style={styles.legendText}>{l.label}</ThemedText>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.progressList}>
              {[
                { label: 'Students', value: totalStudents, pct: studentPct, color: '#5B8DF6' },
                { label: 'Online', value: onlineUsers, pct: onlinePct, color: '#3ECF8E' },
              ].map(p => (
                <View key={p.label} style={styles.progressItem}>
                  <View style={styles.progressMeta}>
                    <ThemedText style={styles.progressLabel}>{p.label}</ThemedText>
                    <ThemedText style={styles.progressLabel}>
                      {p.value}/{totalUsers}
                    </ThemedText>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${p.pct}%` as any, backgroundColor: p.color },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Quick actions ── */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick actions</ThemedText>
          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [styles.actionCard, styles.actionStudents, pressed && styles.pressed]}
              onPress={() => router.push('/(admin)/students' as any)}
            >
              <View style={[styles.actionIconLarge, { backgroundColor: '#1A2540' }]}>
                <StudentIcon size={26} color="#5B8DF6" />
              </View>
              <ThemedText style={styles.actionTitle}>Students</ThemedText>
              <ThemedText style={styles.actionSubtitle}>{totalStudents} accounts</ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionCard, styles.actionDrivers, pressed && styles.pressed]}
              onPress={() => router.push('/(admin)/drivers' as any)}
            >
              <View style={[styles.actionIconLarge, { backgroundColor: '#251F0A' }]}>
                <DriverIcon size={26} color="#F5A623" />
              </View>
              <ThemedText style={styles.actionTitle}>Drivers</ThemedText>
              <ThemedText style={styles.actionSubtitle}>{totalDrivers} accounts</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* ── Recent activity ── */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Recent activity</ThemedText>
          <View style={styles.card}>
            {recentActivity.map((item, i) => (
              <TimelineItem
                key={i}
                {...item}
                isLast={i === recentActivity.length - 1}
              />
            ))}
            <Pressable style={styles.viewAll}>
              <ThemedText style={styles.viewAllText}>View all activity →</ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// ─── Chart styles ─────────────────────────────────────────────────────────────

const chart = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 28,
    gap: 2,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
});

// ─── Main styles ──────────────────────────────────────────────────────────────

const { width } = Dimensions.get('window');
const CARD_GAP = 14;
const H_PADDING = 24;
const CARD_WIDTH = (width - H_PADDING * 2 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#888888',
    fontWeight: '500',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: H_PADDING, paddingBottom: 50 },

  // Header
  header: { marginBottom: 28 },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { flex: 1 },
  greeting: {
    fontSize: 26,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#555555',
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  iconEmoji: { fontSize: 17 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    marginTop: 16,
    backgroundColor: '#111111',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#444444',
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginBottom: 32,
  },
  statCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    padding: 18,
    backgroundColor: '#111111',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statValue: {
    fontSize: 32,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 13,
    color: '#555555',
    marginTop: 2,
    marginBottom: 10,
  },
  statBottom: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statGrowth: { fontSize: 12, color: '#555555' },
  statGrowthUp: { color: '#3ECF8E', fontWeight: '500' },

  // Shared card
  card: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 14,
    letterSpacing: -0.3,
  },

  // Distribution chart
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  legend: { gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: 13, color: '#555555' },
  progressList: { gap: 12 },
  progressItem: { gap: 5 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12, color: '#555555' },
  progressTrack: {
    height: 5,
    backgroundColor: '#1E1E1E',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 99 },

  // Quick actions
  actionsRow: { flexDirection: 'row', gap: CARD_GAP },
  actionCard: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#111111',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  actionStudents: {
    borderLeftWidth: 2,
    borderLeftColor: '#5B8DF6',
    borderRadius: 0,
  },
  actionDrivers: {
    borderLeftWidth: 2,
    borderLeftColor: '#F5A623',
    borderRadius: 0,
  },
  actionIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#555555',
    marginTop: 3,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },

  // Timeline
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 16,
  },
  timelineLeft: { alignItems: 'center' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  timelineLine: {
    width: 1,
    height: 28,
    backgroundColor: '#222222',
    marginTop: 4,
  },
  timelineContent: { flex: 1 },
  timelineName: { fontSize: 14, fontWeight: '500', color: '#FFFFFF' },
  timelineAction: { fontSize: 13, color: '#555555', marginTop: 1 },
  timelineTime: { fontSize: 12, color: '#333333', marginTop: 2 },
  viewAll: { marginTop: 8, alignItems: 'center' },
  viewAllText: { fontSize: 13, fontWeight: '500', color: '#888888' },
});