import { CebuMap } from '@/components/cebu-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocationSharing } from '@/hooks/use-location-sharing';
import { useUserPresence } from '@/hooks/use-user-presence';
import { useAuth } from '@/hooks/useAuth';
import  { useRef, useState } from 'react';
import { Alert, Animated, Modal, PanResponder, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ExploreScreen() {
  const { user } = useAuth();
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

  // --- 1. DROPDOWN & MAP STATE ---
  const [showBoundary, setShowBoundary] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState("Select Route");
  
  // Calculate counts
  const activeCount = Object.keys(sharedLocations || {}).length;
  const onlineCount = Object.keys(onlineUsers || {}).length;
  
  const menuOptions = [
    { label: "Via Kawit", type: "route" },
    { label: "Via Bagay", type: "route" },
    { label: "Both", type: "route" },
    { label: "None", type: "route" },
    { label: "Toggle Boundary", type: "action" },
  ];

  // --- 2. SLIDING SHEET LOGIC (PanResponder) ---
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      // Do not grab the touch immediately so the button can be pressed
      onStartShouldSetPanResponder: () => false,
      // Only start sliding if the user moves their finger more than 10 pixels vertically
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (event, gestureState) => {
        // Only allow dragging downwards (positive dy)
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        if (gestureState.dy > 100) {
          // Snap down to a "Mini" state (showing just the handle and title)
          Animated.spring(translateY, {
            toValue: 130, 
            useNativeDriver: true,
            friction: 8,
          }).start();
        } else {
          // Snap back up to full view
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleTrackLocation = () => {
    // If they haven't agreed yet, don't start tracking—show the modal instead!
    if (!hasAgreed) {
      setShowAgreementModal(true);
      return;
    }

    // If they HAVE agreed, proceed with your existing sharing logic
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

      {/* LAYER 1: FULL SCREEN MAP */}
      <View style={styles.mapWrapper}>
        <CebuMap 
          sharedLocations={sharedLocations} 
          activeRoute={selectedRoute} 
          showBoundary={showBoundary}
        />
      </View>

      {/* LAYER 2: FLOATING TOP HEADER */}
      <SafeAreaView style={styles.floatingHeader}>
        <View style={styles.headerRow}>
          
          {/* COMPACT DROPDOWN */}
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

          {/* HEADER INFO CARD */}
          <View style={styles.headerCard}>
            <ThemedText style={styles.titleText}>ForDaGoo Tracker</ThemedText>
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, styles.activeDot]} />
                <ThemedText style={styles.statusText}>{activeCount} Active</ThemedText>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, styles.onlineDot]} />
                <ThemedText style={styles.statusText}>{onlineCount} Online</ThemedText>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* LAYER 3: SLIDING BOTTOM SHEET */}
      <Animated.View 
        style={[
          styles.bottomSheet, 
          { transform: [{ translateY: translateY }] } 
        ]}
        {...panResponder.panHandlers} 
      >
        <View style={styles.sheetHandle} />
        
        <ThemedText style={styles.sheetTitle}>
          {user?.role === 'driver' ? 'Driver Controls' : 'Trip Overview'}
        </ThemedText>

        <View style={styles.sheetContent}>
          {user?.role === 'driver' && (
            <ThemedText style={styles.driverInfo}>
              Share your location to help students track the bus in real-time
            </ThemedText>
          )}
          
          <TouchableOpacity 
            style={[styles.mainButton, isSharing && styles.buttonActive]}
            onPress={handleTrackLocation}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.buttonText}>
              {isSharing 
                ? (user?.role === 'driver' ? 'STOP DRIVING' : 'STOP SHARING')
                : (user?.role === 'driver' ? 'START DRIVING' : 'START MY LOCATION')
              }
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.statusRow}>
            <ThemedText style={styles.statusLabel}>Status:</ThemedText>
            <ThemedText style={isSharing ? styles.statusActive : styles.statusInactive}>
              {isSharing 
                ? (user?.role === 'driver' ? " ● Driving" : " ● Live Tracking")
                : " ○ Offline"
              }
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* --- USER AGREEMENT MODAL --- */}
      <Modal
        visible={showAgreementModal}
        transparent={true}
        animationType="slide" // Slide up feels more natural on mobile
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
                  startSharing(); // Immediately start after they agree
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
  floatingHeader: {
    position: 'absolute',
    top: 50, 
    left: 20,
    right: 20,
    zIndex: 20,
  },
  headerRow: {
    flexDirection: 'row', 
    alignItems: 'center'
  },
  headerCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleText: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#1C1C1E' 
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
  statusText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeUsers: { 
    fontSize: 11, 
    fontWeight: '600',
    color: '#34A853',
  },
  dropdownWrapper: {
    zIndex: 30,
  },
  dropdownHeader: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chevron: {
    color: '#007AFF',
    fontSize: 12,
  },
  dropdownList: {
    position: 'absolute',
    top: 55,
    left: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 160,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  dropdownItem: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  dropdownItemActive: {
    backgroundColor: '#007AFF',
  },
  dropdownItemText: {
    color: '#3A3A3C',
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 12,
    paddingBottom: 40,
    zIndex: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#D1D1D6',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 15,
  },
  sheetContent: {
    alignItems: 'center',
    width: '100%',
  },
  driverInfo: {
    fontSize: 13,
    color: '#5E4352',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  mainButton: {
    backgroundColor: '#F56476',
    width: '100%',
    height: 54, 
    borderRadius: 16, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: { 
    backgroundColor: '#34A853',
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16,
    letterSpacing: 0.5 
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginRight: 5,
  },
  statusActive: {
    fontSize: 13,
    color: '#34A853',
    fontWeight: '700',
  },
  statusInactive: {
    fontSize: 13,
    color: '#8E8E93',
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
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 500, // Limit width on web
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 13,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#F56476',
    padding: 13,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#F56476',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  confirmButtonText: {
    fontSize: 15,
    color: 'white',
    fontWeight: 'bold',
  },
  agreementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  agreementText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#3A3A3C',
    textAlign: 'center',
    marginBottom: 24,
  },
  



});