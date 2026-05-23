import { CebuMap } from '@/components/cebu-map';
import { LocationIcon } from '@/components/icons';
import { ProfileIcon } from '@/components/profile-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocationSharing } from '@/hooks/use-location-sharing';
import { useUserPresence } from '@/hooks/use-user-presence';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Modal, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ExploreScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // Use authenticated user ID instead of random ID
  const userId = user?.uid || 'anonymous';
  const { isSharing, sharedLocations, startSharing, stopSharing } = useLocationSharing(
    userId,
    user?.name || user?.email || 'User',
    user?.photoURL
  );
  const { onlineUsers } = useUserPresence(
    userId,
    user?.name || user?.email || 'User',
    user?.photoURL
  );
  const [hasAgreed, setHasAgreed] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const [showBoundary, setShowBoundary] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState("Select Route");
  
  const menuOptions = [
    { label: "Via Kawit", type: "route" },
    { label: "Via Bagay", type: "route" },
    { label: "Both", type: "route" },
    { label: "None", type: "route" },
    { label: "Toggle Boundary", type: "action" },
  ];

  // Calculate counts
  const activeCount = Object.keys(sharedLocations || {}).length;
  const onlineCount = Object.keys(onlineUsers || {}).length;

  const handleTrackLocation = () => {
    if (!hasAgreed) {
      setShowAgreementModal(true);
      return;
    }

    if (isSharing) {
      stopSharing();
      Alert.alert('ForDaGoo', 'Tracking stopped.');
    } else {
      startSharing();
      Alert.alert('ForDaGoo', 'You are now live on the map!');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* FULL SCREEN MAP */}
      <View style={styles.mapWrapper}>
        <CebuMap 
          sharedLocations={sharedLocations} 
          activeRoute={selectedRoute} 
          showBoundary={showBoundary}
        />
      </View>

      {/* COMPACT TOP BAR WITH NAVIGATION */}
      <View style={styles.topBar}>
        {/* ROW 1: Logo + Nav + Controls */}
        <View style={styles.topBarRow}>
          {/* DROPDOWN */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity 
              style={styles.dropdownHeader} 
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <ThemedText style={styles.chevron}>
                {isDropdownOpen ? "▲" : "▼"}
              </ThemedText>
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={styles.dropdownList}>
                {menuOptions.map((option) => (
                  <TouchableOpacity 
                    key={option.label} 
                    style={[
                      styles.dropdownItem, 
                      selectedRoute === option.label && styles.dropdownItemActive
                    ]}
                    onPress={() => {
                      if (option.type === "route") setSelectedRoute(option.label);
                      else if (option.label === "Toggle Boundary") setShowBoundary(!showBoundary);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <ThemedText style={[
                      styles.dropdownItemText, 
                      selectedRoute === option.label && styles.dropdownItemTextActive
                    ]}>
                      {option.label === "Toggle Boundary" 
                        ? (showBoundary ? "Hide Boundary" : "Show Boundary") 
                        : option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* LOGO + TITLE */}
          <View style={styles.logoRow}>
            <Image 
              source={require('@/assets/images/fordagoo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <ThemedText style={styles.titleText}>ForDaGoo</ThemedText>
              <View style={styles.statusContainer}>
                <View style={styles.statusItem}>
                  <View style={[styles.statusDot, styles.activeDot]} />
                  <ThemedText style={styles.headerStatusText}>{activeCount} Active</ThemedText>
                </View>
                <View style={styles.statusItem}>
                  <View style={[styles.statusDot, styles.onlineDot]} />
                  <ThemedText style={styles.headerStatusText}>{onlineCount} Online</ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* SPACER */}
          <View style={styles.spacer} />

          {/* NAVIGATION TABS */}
          <View style={styles.navTabs}>
            <TouchableOpacity 
              style={[styles.navTab, pathname.includes('explore') && styles.navTabActive]}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <LocationIcon size={14} color={pathname.includes('explore') ? '#F56476' : '#8E8E93'} />
              <ThemedText style={[styles.navTabText, pathname.includes('explore') && styles.navTabTextActive]}>
                Tracking
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navTab, pathname.includes('profile') && styles.navTabActive]}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <ProfileIcon size={14} color={pathname.includes('profile') ? '#F56476' : '#8E8E93'} />
              <ThemedText style={[styles.navTabText, pathname.includes('profile') && styles.navTabTextActive]}>
                Profile
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* CONTROL BUTTON + STATUS */}
          <TouchableOpacity 
            style={[styles.compactButton, isSharing && styles.compactButtonActive]}
            onPress={handleTrackLocation}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.compactButtonText}>
              {isSharing 
                ? (user?.role === 'driver' ? '⏹ Stop Driving' : '⏹ Stop')
                : (user?.role === 'driver' ? '▶ Start Driving' : '▶ Share')
              }
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.statusBadge}>
            <ThemedText style={[styles.badgeStatusText, isSharing && styles.badgeStatusTextActive]}>
              {isSharing ? '● Live' : '○ Offline'}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* AGREEMENT MODAL */}
      <Modal
        visible={showAgreementModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.agreementCard}>
            <ThemedText style={styles.agreementTitle}>Location Sharing</ThemedText>
            <ThemedText style={styles.agreementText}>
              To show your location to other students, ForDaGoo needs to collect your GPS data. 
              Your location is only shared while "Sharing" is active.
            </ThemedText>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowAgreementModal(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Not Now</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={() => {
                  setHasAgreed(true);
                  setShowAgreementModal(false);
                  startSharing();
                }}
              >
                <ThemedText style={styles.confirmButtonText}>Agree & Start</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#F2F2F7' 
  },
  mapWrapper: { 
    ...StyleSheet.absoluteFillObject 
  },
  topBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 20,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  spacer: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownWrapper: {
    zIndex: 30,
  },
  dropdownHeader: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    color: '#007AFF',
    fontSize: 12,
  },
  dropdownList: {
    position: 'absolute',
    top: 45,
    left: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 150,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  dropdownItem: {
    padding: 10,
    borderRadius: 6,
    marginVertical: 1,
  },
  dropdownItemActive: {
    backgroundColor: '#007AFF',
  },
  dropdownItemText: {
    color: '#3A3A3C',
    fontSize: 13,
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  logo: {
    width: 28,
    height: 28,
  },
  titleText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#1C1C1E',
    lineHeight: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#34C759', // Green for active (sharing location)
  },
  onlineDot: {
    backgroundColor: '#007AFF', // Blue for online (in app but not sharing)
  },
  headerStatusText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeUsers: { 
    fontSize: 11, 
    fontWeight: '600',
    color: '#34A853',
  },
  compactButton: {
    backgroundColor: '#F56476',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  compactButtonActive: {
    backgroundColor: '#34A853',
  },
  compactButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  badgeStatusText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  badgeStatusTextActive: {
    color: '#34A853',
  },
  navTabs: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#F2F2F7',
    padding: 4,
    borderRadius: 10,
  },
  navTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  navTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  navTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  navTabTextActive: {
    color: '#F56476',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  agreementCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 450,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#F56476',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#F56476',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  confirmButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  agreementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  agreementText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#3A3A3C',
    textAlign: 'center',
    marginBottom: 20,
  },
});
