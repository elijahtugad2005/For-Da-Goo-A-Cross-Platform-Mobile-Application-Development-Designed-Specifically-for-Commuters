import { AdminIcon, DriverIcon, LocationIcon, LogoutIcon, StudentIcon } from '@/components/icons';
import { ProfileIcon } from '@/components/profile-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { user, signOut, linkWithEmail, linkWithGoogle } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [linkMethod, setLinkMethod] = useState<'email' | 'google'>('email');
  const [linkEmail, setLinkEmail] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [linkName, setLinkName] = useState('');
  const [loading, setLoading] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('error');

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleLogout = async () => {
    // Show warning if user is anonymous/guest
    if (user?.isAnonymous) {
      setShowLogoutWarning(true);
      return;
    }
    
    // Proceed with logout for linked accounts
    const result = await signOut();
    if (result.success) {
      router.replace('/auth');
    }
  };

  const confirmLogout = async () => {
    setShowLogoutWarning(false);
    const result = await signOut();
    if (result.success) {
      router.replace('/auth');
    }
  };

  const handleLinkAccount = () => {
    setShowLinkModal(true);
  };

  const handleLinkWithEmail = async () => {
    if (!linkEmail || !linkPassword) {
      showToast('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await linkWithEmail(linkEmail, linkPassword, linkName);
    
    if (result.success) {
      showToast('Account linked successfully!', 'success');
      setShowLinkModal(false);
      setLinkEmail('');
      setLinkPassword('');
      setLinkName('');
      // Auth state will update automatically via onAuthStateChanged listener
    } else {
      showToast(result.error || 'Failed to link account');
    }
    
    setLoading(false);
  };

  const handleLinkWithGoogle = async () => {
    setLoading(true);
    const result = await linkWithGoogle();
    
    if (result.success) {
      showToast('Account linked with Google!', 'success');
      setShowLinkModal(false);
      // Auth state will update automatically via onAuthStateChanged listener
    } else {
      showToast(result.error || 'Failed to link with Google');
    }
    
    setLoading(false);
  };

  return (
    <ThemedView style={styles.container}>
      <Toast 
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
      
      {/* TOP NAVIGATION BAR */}
      <View style={styles.topBar}>
        <View style={styles.headerCard}>
          <Image 
            source={require('@/assets/images/fordagoo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText style={styles.titleText}>ForDaGoo</ThemedText>
        </View>

        {/* NAVIGATION TABS */}
        <View style={styles.navTabs}>
          <TouchableOpacity 
            style={[styles.navTab, pathname.includes('explore') && styles.navTabActive]}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <LocationIcon size={16} color={pathname.includes('explore') ? '#F56476' : '#8E8E93'} />
            <ThemedText style={[styles.navTabText, pathname.includes('explore') && styles.navTabTextActive]}>
              Tracking
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navTab, pathname.includes('profile') && styles.navTabActive]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <ProfileIcon size={16} color={pathname.includes('profile') ? '#F56476' : '#8E8E93'} />
            <ThemedText style={[styles.navTabText, pathname.includes('profile') && styles.navTabTextActive]}>
              Profile
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentWrapper}>
          {/* Profile Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {user?.photoURL ? (
                <Image 
                  source={{ uri: user.photoURL }} 
                  style={styles.avatarImage}
                />
              ) : (
                <Image 
                  source={require('@/assets/images/default_System_Profile.jpg')} 
                  style={styles.avatarImage}
                />
              )}
            </View>
            <ThemedText style={styles.nameText}>{user?.name || 'User'}</ThemedText>
            <ThemedText style={styles.emailText}>{user?.email || 'Guest User'}</ThemedText>
          </View>

          {/* Role Badge */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Account Type</ThemedText>
            <View style={styles.card}>
              <View style={styles.roleCard}>
                <View style={styles.roleIconContainer}>
                  {user?.role === 'admin' ? (
                    <AdminIcon size={26} color="#FFFFFF" />
                  ) : user?.role === 'driver' ? (
                    <DriverIcon size={26} color="#FFFFFF" />
                  ) : (
                    <StudentIcon size={26} color="#FFFFFF" />
                  )}
                </View>
                <View style={styles.roleInfo}>
                  <ThemedText style={styles.roleTitle}>
                    {user?.role === 'admin' ? 'Admin' : user?.role === 'driver' ? 'Driver' : 'Student'}
                  </ThemedText>
                  <ThemedText style={styles.roleDescription}>
                    {user?.role === 'admin'
                      ? 'You have full access to manage users and system settings'
                      : user?.role === 'driver' 
                        ? 'You can share your location while driving'
                        : 'You can track buses in real-time'
                    }
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* Account Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Account Information</ThemedText>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Email</ThemedText>
                <ThemedText style={styles.infoValue}>{user?.email}</ThemedText>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Name</ThemedText>
                <ThemedText style={styles.infoValue}>{user?.name || 'Not set'}</ThemedText>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Role</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {user?.role === 'admin' ? 'Admin' : user?.role === 'driver' ? 'Driver' : 'Student'}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* App Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>About</ThemedText>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>App Version</ThemedText>
                <ThemedText style={styles.infoValue}>1.0.0</ThemedText>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Project</ThemedText>
                <ThemedText style={styles.infoValue}>ForDaGoo</ThemedText>
              </View>
            </View>
          </View>

          {/* Admin Panel Button - Only visible for admin users */}
          {user?.role === 'admin' && (
            <View style={styles.adminSection}>
              <TouchableOpacity 
                style={styles.adminPanelButton} 
                onPress={() => router.push('/(admin)' as any)}
              >
                <View style={styles.adminPanelContent}>
                  <AdminIcon size={20} color="#FFFFFF" />
                  <ThemedText style={styles.adminPanelButtonText}>Admin Panel</ThemedText>
                </View>
                <ThemedText style={styles.adminPanelArrow}>→</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            {/* Link Account Button for Guest Users */}
            {user?.isAnonymous && (
              <TouchableOpacity style={styles.linkButton} onPress={handleLinkAccount}>
                <ThemedText style={styles.linkButtonText}>🔗 Link Account</ThemedText>
              </TouchableOpacity>
            )}

            {/* Logout Button */}
            <TouchableOpacity style={[styles.logoutButton, user?.isAnonymous && styles.logoutButtonHalf]} onPress={handleLogout}>
              <View style={styles.logoutContent}>
                <LogoutIcon size={16} color="#FFFFFF" />
                <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              CTU Daanbantayan Transportation Tracker
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Link Account Modal */}
      <Modal visible={showLinkModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ThemedText style={styles.modalTitle}>Link Your Account</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              Upgrade your guest account to save your data permanently
            </ThemedText>

            {/* Link Method Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, linkMethod === 'email' && styles.tabActive]}
                onPress={() => setLinkMethod('email')}
              >
                <ThemedText style={[styles.tabText, linkMethod === 'email' && styles.tabTextActive]}>
                  Email
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, linkMethod === 'google' && styles.tabActive]}
                onPress={() => setLinkMethod('google')}
              >
                <ThemedText style={[styles.tabText, linkMethod === 'google' && styles.tabTextActive]}>
                  Google
                </ThemedText>
              </TouchableOpacity>
            </View>

            {linkMethod === 'email' ? (
              <View style={styles.formContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={linkName}
                  onChangeText={setLinkName}
                  placeholderTextColor="#8E8E93"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={linkEmail}
                  onChangeText={setLinkEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#8E8E93"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={linkPassword}
                  onChangeText={setLinkPassword}
                  secureTextEntry
                  placeholderTextColor="#8E8E93"
                />
                <TouchableOpacity 
                  style={styles.linkSubmitButton} 
                  onPress={handleLinkWithEmail}
                  disabled={loading}
                >
                  <ThemedText style={styles.linkSubmitButtonText}>
                    {loading ? 'Linking...' : 'Link with Email'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <ThemedText style={styles.googleInfo}>
                  Link your account with Google to access it from any device
                </ThemedText>
                <TouchableOpacity 
                  style={[styles.linkSubmitButton, styles.googleButton]} 
                  onPress={handleLinkWithGoogle}
                  disabled={loading}
                >
                  <ThemedText style={styles.linkSubmitButtonText}>
                    {loading ? 'Linking...' : 'Link with Google'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowLinkModal(false)}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Logout Warning Modal for Guest Users */}
      <Modal visible={showLogoutWarning} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.warningIconContainer}>
            </View>
            <ThemedText style={styles.modalTitle}>Warning!</ThemedText>
            <ThemedText style={styles.warningText}>
              You are logged in as a guest. If you logout without linking your account, all your data will be lost permanently.
            </ThemedText>
            <ThemedText style={styles.warningSubtext}>
              Would you like to link your account first?
            </ThemedText>

            <View style={styles.warningButtonsRow}>
              <TouchableOpacity 
                style={styles.linkNowButton} 
                onPress={() => {
                  setShowLogoutWarning(false);
                  setShowLinkModal(true);
                }}
              >
                <ThemedText style={styles.linkNowButtonText}>
                  Link Account
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.logoutAnywayButton} 
                onPress={confirmLogout}
              >
                <ThemedText style={styles.logoutAnywayButtonText}>
                  Logout Anyway
                </ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowLogoutWarning(false)}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    gap: 15,
  },
  headerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F56476',
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
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 30,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 700,
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 25,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F56476',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 5,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  roleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F56476',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'right',
    flex: 1,
    marginLeft: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  adminSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  adminPanelButton: {
    backgroundColor: '#8B5CF6',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  adminPanelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adminPanelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  adminPanelArrow: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  logoutButtonHalf: {
    flex: 1,
  },
  linkButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 25,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 450,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  formContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: '#F2F2F7',
    padding: 14,
    borderRadius: 10,
    fontSize: 14,
    color: '#1C1C1E',
  },
  googleInfo: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 18,
  },
  linkSubmitButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  linkSubmitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
  warningIconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  warningIcon: {
    fontSize: 48,
  },
  warningText: {
    fontSize: 14,
    color: '#1C1C1E',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  warningSubtext: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  warningButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  linkNowButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  linkNowButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutAnywayButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutAnywayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
