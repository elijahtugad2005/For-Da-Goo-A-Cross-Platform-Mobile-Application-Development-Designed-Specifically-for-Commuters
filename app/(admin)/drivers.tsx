import { DriverIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { useAdminUsers } from '@/hooks/use-admin-users';
import type { AdminUser, CreateUserInput, UpdateUserInput } from '@/types/admin';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View
} from 'react-native';

/**
 * Drivers Management Screen
 * Full CRUD interface for managing driver accounts
 */
export default function DriversScreen() {
  const router = useRouter();
  const { drivers, isLoading, fetchUsers, createUser, updateUser, deleteUser } = useAdminUsers();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<AdminUser | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formLoading, setFormLoading] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('success');

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Fetch drivers on mount
  useEffect(() => {
    fetchUsers('driver');
  }, []);

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Filter drivers based on search and status
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || driver.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormStatus('active');
    setFormLoading(false);
  };

  // Handle create driver
  const handleCreate = async () => {
    if (!formName || !formEmail || !formPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setFormLoading(true);
    const input: CreateUserInput = {
      name: formName,
      email: formEmail,
      password: formPassword,
      role: 'driver',
      status: formStatus
    };

    const result = await createUser(input);
    setFormLoading(false);

    if (result.success) {
      showToast('Driver created successfully!', 'success');
      setShowCreateModal(false);
      resetForm();
      fetchUsers('driver');
    } else {
      showToast(result.error || 'Failed to create driver', 'error');
    }
  };

  // Handle edit driver
  const handleEdit = async () => {
    if (!selectedDriver) return;
    if (!formName) {
      showToast('Name is required', 'error');
      return;
    }

    setFormLoading(true);
    const input: UpdateUserInput = {
      name: formName,
      status: formStatus
    };

    const result = await updateUser(selectedDriver.uid, input);
    setFormLoading(false);

    if (result.success) {
      showToast('Driver updated successfully!', 'success');
      setShowEditModal(false);
      resetForm();
      setSelectedDriver(null);
      fetchUsers('driver');
    } else {
      showToast(result.error || 'Failed to update driver', 'error');
    }
  };

  // Handle delete driver
  const handleDelete = async () => {
    if (!selectedDriver) return;

    setFormLoading(true);
    const result = await deleteUser(selectedDriver.uid);
    setFormLoading(false);

    if (result.success) {
      showToast('Driver deleted successfully!', 'success');
      setShowDeleteModal(false);
      setSelectedDriver(null);
      fetchUsers('driver');
    } else {
      showToast(result.error || 'Failed to delete driver', 'error');
    }
  };

  // Open edit modal
  const openEditModal = (driver: AdminUser) => {
    setSelectedDriver(driver);
    setFormName(driver.name || '');
    setFormEmail(driver.email || '');
    setFormStatus(driver.status);
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (driver: AdminUser) => {
    setSelectedDriver(driver);
    setShowDeleteModal(true);
  };

  if (isLoading && drivers.length === 0) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <ThemedText style={styles.loadingText}>Loading drivers...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ThemedText style={styles.backButtonText}>← Back</ThemedText>
          </Pressable>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <DriverIcon size={32} color="#FFFFFF" />
              </View>
              <View>
                <ThemedText style={styles.headerTitle}>Drivers</ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                  {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''}
                </ThemedText>
              </View>
            </View>
            <Pressable
              style={styles.createButton}
              onPress={() => {
                resetForm();
                setShowCreateModal(true);
              }}
            >
              <ThemedText style={styles.createButtonText}>+ Add Driver</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <ThemedText style={styles.searchIcon}>🔍</ThemedText>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.filterContainer}>
            <Pressable
              style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
              onPress={() => setFilterStatus('all')}
            >
              <ThemedText style={[styles.filterButtonText, filterStatus === 'all' && styles.filterButtonTextActive]}>
                All
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.filterButton, filterStatus === 'active' && styles.filterButtonActive]}
              onPress={() => setFilterStatus('active')}
            >
              <ThemedText style={[styles.filterButtonText, filterStatus === 'active' && styles.filterButtonTextActive]}>
                Active
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.filterButton, filterStatus === 'inactive' && styles.filterButtonActive]}
              onPress={() => setFilterStatus('inactive')}
            >
              <ThemedText style={[styles.filterButtonText, filterStatus === 'inactive' && styles.filterButtonTextActive]}>
                Inactive
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Drivers List */}
        <View style={styles.listSection}>
          {filteredDrivers.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateEmoji}>🚌</ThemedText>
              <ThemedText style={styles.emptyStateTitle}>No drivers found</ThemedText>
              <ThemedText style={styles.emptyStateText}>
                {searchQuery ? 'Try adjusting your search' : 'Add your first driver to get started'}
              </ThemedText>
            </View>
          ) : (
            filteredDrivers.map((driver) => (
              <View key={driver.uid} style={styles.driverCard}>
                <View style={styles.driverCardContent}>
                  {/* Avatar */}
                  <View style={styles.driverAvatar}>
                    {driver.photoURL ? (
                      <Image source={{ uri: driver.photoURL }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <ThemedText style={styles.avatarText}>
                          {driver.name?.charAt(0).toUpperCase() || 'D'}
                        </ThemedText>
                      </View>
                    )}
                    {driver.isOnline && <View style={styles.onlineBadge} />}
                  </View>

                  {/* Info */}
                  <View style={styles.driverInfo}>
                    <ThemedText style={styles.driverName}>{driver.name || 'Unnamed'}</ThemedText>
                    <ThemedText style={styles.driverEmail}>{driver.email}</ThemedText>
                    <View style={styles.driverMeta}>
                      <View style={[styles.statusBadge, driver.status === 'active' ? styles.statusActive : styles.statusInactive]}>
                        <ThemedText style={styles.statusText}>
                          {driver.status === 'active' ? '✓ Active' : '✕ Inactive'}
                        </ThemedText>
                      </View>
                      {driver.isOnline && (
                        <View style={styles.onlineIndicator}>
                          <ThemedText style={styles.onlineText}>● Online</ThemedText>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.driverActions}>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => openEditModal(driver)}
                    >
                      <ThemedText style={styles.actionButtonText}>✏️</ThemedText>
                    </Pressable>
                    <Pressable
                      style={[styles.actionButton, styles.deleteActionButton]}
                      onPress={() => openDeleteModal(driver)}
                    >
                      <ThemedText style={styles.actionButtonText}>🗑️</ThemedText>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ThemedText style={styles.modalTitle}>Add New Driver</ThemedText>
            <ThemedText style={styles.modalSubtitle}>Create a new driver account</ThemedText>

            <View style={styles.formContainer}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Name *</ThemedText>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter driver name"
                  placeholderTextColor="#9CA3AF"
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Email *</ThemedText>
                <TextInput
                  style={styles.formInput}
                  placeholder="driver@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={formEmail}
                  onChangeText={setFormEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Password *</ThemedText>
                <TextInput
                  style={styles.formInput}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor="#9CA3AF"
                  value={formPassword}
                  onChangeText={setFormPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Status</ThemedText>
                <View style={styles.statusToggle}>
                  <Pressable
                    style={[styles.statusOption, formStatus === 'active' && styles.statusOptionActive]}
                    onPress={() => setFormStatus('active')}
                  >
                    <ThemedText style={[styles.statusOptionText, formStatus === 'active' && styles.statusOptionTextActive]}>
                      Active
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.statusOption, formStatus === 'inactive' && styles.statusOptionActive]}
                    onPress={() => setFormStatus('inactive')}
                  >
                    <ThemedText style={[styles.statusOptionText, formStatus === 'inactive' && styles.statusOptionTextActive]}>
                      Inactive
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                disabled={formLoading}
              >
                <ThemedText style={styles.modalCancelButtonText}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalSubmitButton, formLoading && styles.modalSubmitButtonDisabled]}
                onPress={handleCreate}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.modalSubmitButtonText}>Create Driver</ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ThemedText style={styles.modalTitle}>Edit Driver</ThemedText>
            <ThemedText style={styles.modalSubtitle}>Update driver information</ThemedText>

            <View style={styles.formContainer}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Name *</ThemedText>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter driver name"
                  placeholderTextColor="#9CA3AF"
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Email (read-only)</ThemedText>
                <TextInput
                  style={[styles.formInput, styles.formInputDisabled]}
                  value={formEmail}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Status</ThemedText>
                <View style={styles.statusToggle}>
                  <Pressable
                    style={[styles.statusOption, formStatus === 'active' && styles.statusOptionActive]}
                    onPress={() => setFormStatus('active')}
                  >
                    <ThemedText style={[styles.statusOptionText, formStatus === 'active' && styles.statusOptionTextActive]}>
                      Active
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.statusOption, formStatus === 'inactive' && styles.statusOptionActive]}
                    onPress={() => setFormStatus('inactive')}
                  >
                    <ThemedText style={[styles.statusOptionText, formStatus === 'inactive' && styles.statusOptionTextActive]}>
                      Inactive
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowEditModal(false);
                  resetForm();
                  setSelectedStudent(null);
                }}
                disabled={formLoading}
              >
                <ThemedText style={styles.modalCancelButtonText}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalSubmitButton, formLoading && styles.modalSubmitButtonDisabled]}
                onPress={handleEdit}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.modalSubmitButtonText}>Save Changes</ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.deleteIconContainer}>
              <ThemedText style={styles.deleteIcon}>⚠️</ThemedText>
            </View>
            <ThemedText style={styles.modalTitle}>Delete Driver</ThemedText>
            <ThemedText style={styles.deleteWarningText}>
              Are you sure you want to delete <ThemedText style={styles.deleteWarningName}>{selectedDriver?.name}</ThemedText>?
              This action cannot be undone.
            </ThemedText>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowDeleteModal(false);
                  setSelectedStudent(null);
                }}
                disabled={formLoading}
              >
                <ThemedText style={styles.modalCancelButtonText}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalDeleteButton, formLoading && styles.modalSubmitButtonDisabled]}
                onPress={handleDelete}
                disabled={formLoading}
              >
                {formLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.modalDeleteButtonText}>Delete</ThemedText>
                )}
              </Pressable>
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
    backgroundColor: '#F8F9FE',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FE',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#F59E0B',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#F59E0B',
    fontWeight: '600',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  createButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Search and Filter
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A2E',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },

  // List Section
  listSection: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Driver Card
  driverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  driverCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    position: 'relative',
    marginRight: 16,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  driverEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  onlineIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionButton: {
    backgroundColor: '#FEE2E2',
  },
  actionButtonText: {
    fontSize: 18,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },

  // Form
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  formInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formInputDisabled: {
    backgroundColor: '#F9FAFB',
    color: '#9CA3AF',
  },
  statusToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusOptionTextActive: {
    color: '#FFFFFF',
  },

  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalSubmitButtonDisabled: {
    opacity: 0.6,
  },
  modalSubmitButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalDeleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalDeleteButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Delete Modal
  deleteIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteIcon: {
    fontSize: 48,
  },
  deleteWarningText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  deleteWarningName: {
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
});
