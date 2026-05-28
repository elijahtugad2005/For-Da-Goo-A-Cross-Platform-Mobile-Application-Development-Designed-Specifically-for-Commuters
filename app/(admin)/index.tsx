import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
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

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bgRoot:    '#07090D',
  bgSurface: '#0E1219',
  bgElevated:'#141A23',
  bgOverlay: '#1B2230',
  borderDef: 'rgba(255,255,255,0.06)',
  borderHov: 'rgba(255,255,255,0.10)',
  textPrimary:   '#EDF2F9',
  textSecondary: '#8A95A8',
  textMuted:     '#4B5566',
  green:  '#34D399',
  amber:  '#FBBF24',
  blue:   '#60A5FA',
  purple: '#A78BFA',
  greenBg:  'rgba(52,211,153,0.10)',
  amberBg:  'rgba(251,191,36,0.10)',
  blueBg:   'rgba(96,165,250,0.10)',
  purpleBg: 'rgba(167,139,250,0.10)',
  greenPill: 'rgba(52,211,153,0.12)',
  bluePill:  'rgba(96,165,250,0.12)',
  amberPill: 'rgba(251,191,36,0.12)',
} as const;

// ─── Sparkline ────────────────────────────────────────────────────────────────
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  return (
    <View style={chart.row}>
      {data.map((val, i) => (
        <View
          key={i}
          style={[
            chart.bar,
            {
              height: (val / max) * 20 + 4,
              backgroundColor: color,
              opacity: 0.2 + 0.8 * (i / (data.length - 1)),
            },
          ]}
        />
      ))}
    </View>
  );
};

// ─── Donut ────────────────────────────────────────────────────────────────────
const DonutChart = ({
  percentage,
  color,
  size = 86,
  label,
}: {
  percentage: number;
  color: string;
  size?: number;
  label?: string;
}) => {
  const sw = 9;
  const inner = size - sw * 2 - 4;
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        {/* Track */}
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: sw,
            borderColor: 'rgba(255,255,255,0.06)',
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
            width: inner,
            height: inner,
            borderRadius: inner / 2,
            backgroundColor: T.bgSurface,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ThemedText style={{ fontSize: 14, fontWeight: '600', color, letterSpacing: -0.5 }}>
            {Math.round(percentage)}%
          </ThemedText>
          {label ? (
            <ThemedText style={{ fontSize: 8, color: T.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 1 }}>
              {label}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </View>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
type StatCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  accentColor: string;
  value: string | number;
  label: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  sparkData: number[];
  delay?: number;
};

const StatCard = ({
  icon, iconBg, accentColor, value, label, badge, badgeColor, badgeBg, sparkData, delay = 0,
}: StatCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Accent top bar */}
      <View style={[styles.statAccentBar, { backgroundColor: accentColor }]} />
      <View style={styles.statTop}>
        <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>{icon}</View>
        <View style={[styles.statBadge, { backgroundColor: badgeBg }]}>
          <ThemedText style={[styles.statBadgeText, { color: badgeColor }]}>{badge}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <Sparkline data={sparkData} color={accentColor} />
    </Animated.View>
  );
};

// ─── Timeline item ────────────────────────────────────────────────────────────
type TimelineItemProps = {
  name: string;
  action: string;
  time: string;
  dot: string;
  isLast: boolean;
  isOnline?: boolean;
};

const TimelineItem = ({ name, action, time, dot, isLast, isOnline }: TimelineItemProps) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineLeft}>
      <View style={[styles.timelineDot, { backgroundColor: dot }]}>
        {isOnline && (
          <View style={[styles.timelineDotRing, { borderColor: dot }]} />
        )}
      </View>
      {!isLast && <View style={styles.timelineLine} />}
    </View>
    <View style={styles.timelineContent}>
      <ThemedText style={styles.timelineName}>{name}</ThemedText>
      <ThemedText style={styles.timelineAction}>{action}</ThemedText>
      <View style={styles.timelineTimePill}>
        <ThemedText style={styles.timelineTimeText}>{time}</ThemedText>
      </View>
    </View>
  </View>
);

// ─── Live dot ─────────────────────────────────────────────────────────────────
const LiveDot = () => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[styles.liveDot, { opacity: pulse }]} />;
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const { students, drivers, isLoading, fetchUsers } = useAdminUsers();

  useEffect(() => {
    fetchUsers('student');
    fetchUsers('driver');
  }, []);

  const totalStudents  = students.length;
  const totalDrivers   = drivers.length;
  const totalUsers     = totalStudents + totalDrivers;
  const onlineUsers    = [...students, ...drivers].filter(u => u.isOnline).length;
  const activeStudents = students.filter(u => u.status === 'active').length;
  const activeDrivers  = drivers.filter(u => u.status === 'active').length;
  const studentPct     = totalUsers > 0 ? (totalStudents / totalUsers) * 100 : 0;
  const onlinePct      = totalUsers > 0 ? (onlineUsers / totalUsers) * 100 : 0;

  const recentActivity = [
    ...students.slice(0, 2).map(u => ({
      name:     u.name ?? 'Student',
      action:   u.isOnline ? 'Logged in · Active session' : 'Last seen recently',
      time:     '2 min ago',
      dot:      u.isOnline ? T.green : T.bgOverlay,
      isOnline: u.isOnline,
    })),
    ...drivers.slice(0, 1).map(u => ({
      name:     u.name ?? 'Driver',
      action:   u.isOnline ? 'On route · Started route' : 'Off duty',
      time:     '15 min ago',
      dot:      u.isOnline ? T.amber : T.bgOverlay,
      isOnline: u.isOnline,
    })),
  ];

  // ── Loading ──
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={T.blue} />
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
              <View style={styles.eyebrow}>
                <LiveDot />
                <ThemedText style={styles.eyebrowText}>Live overview</ThemedText>
              </View>
              <ThemedText style={styles.greeting}>Hello, Admin 👋</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                Here's what's happening across your platform today.
              </ThemedText>
            </View>
            <View style={styles.headerIcons}>
              <View style={styles.iconButton}>
                <ThemedText style={styles.iconEmoji}>🔍</ThemedText>
              </View>
              <View style={styles.avatar}>
                <AdminIcon size={18} color={T.bgRoot} />
              </View>
            </View>
          </View>
          {/* Search bar */}
          <View style={styles.searchBar}>
            <ThemedText style={styles.searchIcon}>🔍</ThemedText>
            <ThemedText style={styles.searchPlaceholder}>Quick search users…</ThemedText>
            <View style={styles.searchKbd}>
              <ThemedText style={styles.searchKbdText}>⌘K</ThemedText>
            </View>
          </View>
        </View>

        {/* ── Stats grid ── */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={<ThemedText style={{ fontSize: 18 }}>👥</ThemedText>}
            iconBg={T.greenBg}
            accentColor={T.green}
            value={totalUsers}
            label="Total users"
            badge="+12% this week"
            badgeColor={T.green}
            badgeBg={T.greenPill}
            sparkData={[4, 7, 5, 9, 12]}
            delay={0}
          />
          <StatCard
            icon={<StudentIcon size={18} color={T.blue} />}
            iconBg={T.blueBg}
            accentColor={T.blue}
            value={totalStudents}
            label="Students"
            badge={`${activeStudents} active`}
            badgeColor={T.blue}
            badgeBg={T.bluePill}
            sparkData={[6, 9, 8, 11, 14]}
            delay={80}
          />
          <StatCard
            icon={<DriverIcon size={18} color={T.amber} />}
            iconBg={T.amberBg}
            accentColor={T.amber}
            value={totalDrivers}
            label="Drivers"
            badge={`${activeDrivers} active`}
            badgeColor={T.amber}
            badgeBg={T.amberPill}
            sparkData={[3, 5, 4, 6, 7]}
            delay={160}
          />
          <StatCard
            icon={<ThemedText style={{ fontSize: 18 }}>⚡</ThemedText>}
            iconBg={T.purpleBg}
            accentColor={T.purple}
            value={onlineUsers}
            label="Online now"
            badge={`${Math.round(onlinePct)}% of total`}
            badgeColor={T.purple}
            badgeBg="rgba(167,139,250,0.12)"
            sparkData={[2, 4, 3, 5, onlineUsers || 1]}
            delay={240}
          />
        </View>

        {/* ── User distribution ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <ThemedText style={styles.sectionTitle}>User distribution</ThemedText>
            <ThemedText style={styles.sectionMeta}>This week</ThemedText>
          </View>
          <View style={styles.card}>
            {/* Donuts */}
            <View style={styles.chartRow}>
              <DonutChart percentage={studentPct} color={T.blue}   label="students" />
              <DonutChart percentage={onlinePct}  color={T.green}  label="online"   />
              <DonutChart
                percentage={totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0}
                color={T.purple}
                label="active"
              />
            </View>
            {/* Progress bars */}
            <View style={styles.progressList}>
              {[
                { label: 'Students',        value: totalStudents,  pct: studentPct,                                              color: T.blue   },
                { label: 'Drivers',         value: totalDrivers,   pct: (totalDrivers / Math.max(totalUsers, 1)) * 100,          color: T.amber  },
                { label: 'Online users',    value: onlineUsers,    pct: onlinePct,                                               color: T.green  },
                { label: 'Active students', value: activeStudents, pct: (activeStudents / Math.max(totalStudents, 1)) * 100,     color: T.purple },
              ].map(p => (
                <View key={p.label} style={styles.progressItem}>
                  <View style={styles.progressMeta}>
                    <ThemedText style={styles.progressLabel}>{p.label}</ThemedText>
                    <ThemedText style={styles.progressValue}>{p.value}/{totalUsers}</ThemedText>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${p.pct}%` as any, backgroundColor: p.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Quick actions ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <ThemedText style={styles.sectionTitle}>Quick actions</ThemedText>
          </View>
          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [styles.actionCard, styles.actionStudents, pressed && styles.pressed]}
              onPress={() => router.push('/(admin)/students' as any)}
            >
              <View style={[styles.actionIconLarge, { backgroundColor: 'rgba(96,165,250,0.10)' }]}>
                <StudentIcon size={26} color={T.blue} />
              </View>
              <ThemedText style={styles.actionTitle}>Manage Students</ThemedText>
              <ThemedText style={styles.actionSubtitle}>{totalStudents} accounts · {activeStudents} active</ThemedText>
              <ThemedText style={styles.actionArrow}>→</ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionCard, styles.actionDrivers, pressed && styles.pressed]}
              onPress={() => router.push('/(admin)/drivers' as any)}
            >
              <View style={[styles.actionIconLarge, { backgroundColor: 'rgba(251,191,36,0.10)' }]}>
                <DriverIcon size={26} color={T.amber} />
              </View>
              <ThemedText style={styles.actionTitle}>Manage Drivers</ThemedText>
              <ThemedText style={styles.actionSubtitle}>{totalDrivers} accounts · {activeDrivers} active</ThemedText>
              <ThemedText style={styles.actionArrow}>→</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* ── Recent activity ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <ThemedText style={styles.sectionTitle}>Recent activity</ThemedText>
            <Pressable>
              <ThemedText style={styles.viewAllText}>View all →</ThemedText>
            </Pressable>
          </View>
          <View style={styles.card}>
            {recentActivity.map((item, i) => (
              <TimelineItem
                key={i}
                {...item}
                isLast={i === recentActivity.length - 1}
              />
            ))}
          </View>
        </View>

      </ScrollView>
    </ThemedView>
  );
}

// ─── Chart styles ─────────────────────────────────────────────────────────────
const chart = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', height: 28, gap: 3 },
  bar: { flex: 1, borderRadius: 2, minHeight: 4 },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const { width } = Dimensions.get('window');
const H_PAD   = 20;
const CARD_GAP = 12;
const CARD_W   = (width - H_PAD * 2 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  // ── Root
  root: { flex: 1, backgroundColor: T.bgRoot },
  scroll: { flex: 1 },
  scrollContent: { padding: H_PAD, paddingBottom: 60 },

  // ── Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bgRoot },
  loadingText: { marginTop: 14, fontSize: 14, color: T.textMuted, fontWeight: '500' },

  // ── Header
  header: { marginBottom: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerText: { flex: 1, paddingRight: 12 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.green },
  eyebrowText: { fontSize: 10, color: T.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  greeting: { fontSize: 24, fontWeight: '600', color: T.textPrimary, letterSpacing: -0.5, lineHeight: 30 },
  headerSubtitle: { fontSize: 13, color: T.textSecondary, marginTop: 4, lineHeight: 18 },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  iconButton: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: T.bgElevated,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 0.5, borderColor: T.borderDef,
  },
  iconEmoji: { fontSize: 15 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.textPrimary,
    justifyContent: 'center', alignItems: 'center',
  },

  // ── Search
  searchBar: {
    marginTop: 16,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: T.bgElevated,
    borderRadius: 999, paddingVertical: 11, paddingHorizontal: 16,
    borderWidth: 0.5, borderColor: T.borderDef,
  },
  searchIcon: { fontSize: 13, opacity: 0.4 },
  searchPlaceholder: { flex: 1, fontSize: 13, color: T.textMuted },
  searchKbd: {
    backgroundColor: T.bgOverlay, borderWidth: 0.5, borderColor: T.borderDef,
    borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1,
  },
  searchKbdText: { fontSize: 10, color: T.textMuted, fontWeight: '500' },

  // ── Stats grid
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: CARD_GAP, marginBottom: 28,
  },
  statCard: {
    width: CARD_W,
    backgroundColor: T.bgSurface,
    borderRadius: 12, padding: 18,
    borderWidth: 0.5, borderColor: T.borderDef,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  statAccentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  statIconWrap: { width: 36, height: 36, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  statBadge: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  statBadgeText: { fontSize: 10, fontWeight: '500', letterSpacing: 0.2 },
  statValue: { fontSize: 30, fontWeight: '600', color: T.textPrimary, letterSpacing: -1, lineHeight: 34, marginBottom: 2 },
  statLabel: { fontSize: 12, color: T.textSecondary, marginBottom: 10 },

  // ── Section
  section: { marginBottom: 28 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: T.textMuted, letterSpacing: 0.7, textTransform: 'uppercase' },
  sectionMeta:  { fontSize: 11, color: T.textMuted },

  // ── Card
  card: {
    backgroundColor: T.bgSurface,
    borderRadius: 12, padding: 20,
    borderWidth: 0.5, borderColor: T.borderDef,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 3,
  },

  // ── Distribution
  chartRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 24 },
  progressList: { gap: 12 },
  progressItem: { gap: 5 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12, color: T.textSecondary },
  progressValue: { fontSize: 12, color: T.textMuted },
  progressTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 99 },

  // ── Quick actions
  actionsRow: { flexDirection: 'row', gap: CARD_GAP },
  actionCard: {
    flex: 1, borderRadius: 12, padding: 18,
    backgroundColor: T.bgSurface,
    borderWidth: 0.5, borderColor: T.borderDef,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 3,
  },
  actionStudents: { borderLeftWidth: 2, borderLeftColor: T.blue },
  actionDrivers:  { borderLeftWidth: 2, borderLeftColor: T.amber },
  actionIconLarge: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionTitle:    { fontSize: 14, fontWeight: '600', color: T.textPrimary, letterSpacing: -0.2 },
  actionSubtitle: { fontSize: 11, color: T.textMuted, marginTop: 3 },
  actionArrow:    { fontSize: 14, color: T.textMuted, marginTop: 10 },
  pressed:        { opacity: 0.85, transform: [{ scale: 0.98 }] },

  // ── Timeline
  timelineItem: { flexDirection: 'row', gap: 12, paddingBottom: 16 },
  timelineLeft:  { alignItems: 'center' },
  timelineDot:   { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  timelineDotRing: {
    position: 'absolute', width: 16, height: 16, borderRadius: 8,
    borderWidth: 1.5, top: -3, left: -3, opacity: 0.4,
  },
  timelineLine:  { width: 1, flex: 1, backgroundColor: T.borderDef, marginTop: 4 },
  timelineContent: { flex: 1 },
  timelineName:  { fontSize: 13, fontWeight: '500', color: T.textPrimary },
  timelineAction:{ fontSize: 12, color: T.textSecondary, marginTop: 1 },
  timelineTimePill: {
    alignSelf: 'flex-start', marginTop: 5,
    backgroundColor: T.bgOverlay,
    borderWidth: 0.5, borderColor: T.borderDef,
    borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1,
  },
  timelineTimeText: { fontSize: 10, color: T.textMuted },

  // ── View all
  viewAllText: { fontSize: 12, color: T.textMuted },
});