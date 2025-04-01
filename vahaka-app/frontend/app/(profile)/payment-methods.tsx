import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, ThemedView } from '../../components/Themed';
import { getUserPaymentMethods, addPaymentMethod, deletePaymentMethod, updatePaymentMethod } from '../services/userService';
import { PaymentMethod } from '../types/user';
import { useAuth } from '../context/auth';
import { router } from 'expo-router';

// Define payment method type to match the one in userService.ts
type PaymentMethodType = 'card' | 'upi' | 'bank';

const PaymentMethodsScreen = () => {
  const { refreshUserData, user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card' as PaymentMethodType, // Type assertion to ensure it's the correct type
    name: '',
    details: '',
    isDefault: false
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPaymentMethodId, setEditingPaymentMethodId] = useState<string | null>(null);

  useEffect(() => {
    // Only attempt to load payment methods if user is authenticated
    if (user) {
      loadPaymentMethods();
    } else {
      setIsLoading(false);
      setError('Please log in to view payment methods');
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Loading payment methods for user:', user?.uid);
      const methods = await getUserPaymentMethods();
      setPaymentMethods(methods);
    } catch (error: any) {
      console.error('Error loading payment methods:', error);
      
      // Check for Firebase initialization errors
      if (error.message?.includes('Firebase') || 
          error.message?.includes('initialization') ||
          error.message?.includes('app/no-app')) {
        setError('Firebase is still initializing. Please try again in a moment.');
      } else if (error.message?.includes('not authenticated')) {
        setError('You must be logged in to view payment methods');
      } else {
        setError('Failed to load payment methods');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.name || !newPaymentMethod.details) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      if (isEditMode && editingPaymentMethodId) {
        // Update existing payment method
        await updatePaymentMethod(editingPaymentMethodId, newPaymentMethod);
        Alert.alert('Success', 'Payment method updated successfully');
      } else {
        // Add new payment method
        await addPaymentMethod(newPaymentMethod);
        Alert.alert('Success', 'Payment method added successfully');
      }
      
      setModalVisible(false);
      // Reset the form
      setNewPaymentMethod({
        type: 'card' as PaymentMethodType,
        name: '',
        details: '',
        isDefault: false
      });
      setIsEditMode(false);
      setEditingPaymentMethodId(null);
      loadPaymentMethods();
    } catch (error: any) {
      console.error('Error with payment method:', error);
      
      // Check for Firebase initialization errors
      if (error.message?.includes('Firebase') || 
          error.message?.includes('initialization') ||
          error.message?.includes('app/no-app')) {
        Alert.alert('Error', 'Firebase is still initializing. Please try again in a moment.');
      } else {
        Alert.alert('Error', isEditMode ? 'Failed to update payment method' : 'Failed to add payment method');
      }
    }
  };

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    // Set the form values to the selected payment method
    setNewPaymentMethod({
      type: method.type as PaymentMethodType,
      name: method.name,
      details: method.details,
      isDefault: method.isDefault
    });
    setIsEditMode(true);
    setEditingPaymentMethodId(method.id);
    setModalVisible(true);
  };

  const handleDeletePaymentMethod = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePaymentMethod(id);
              loadPaymentMethods();
              Alert.alert('Success', 'Payment method deleted successfully');
              refreshUserData();
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method');
            }
          }
        }
      ]
    );
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <Ionicons name="card-outline" size={24} color="#2563EB" />;
      case 'bank':
        return <Ionicons name="business-outline" size={24} color="#2563EB" />;
      case 'upi':
        return <Ionicons name="phone-portrait-outline" size={24} color="#2563EB" />;
      default:
        return <Ionicons name="wallet-outline" size={24} color="#2563EB" />;
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method.id} style={styles.paymentMethodCard}>
      <TouchableOpacity 
        style={styles.paymentMethodInfo}
        onPress={() => handleEditPaymentMethod(method)}
      >
        {getPaymentMethodIcon(method.type)}
        <View style={styles.paymentMethodDetails}>
          <ThemedText style={styles.paymentMethodName}>{method.name}</ThemedText>
          <ThemedText style={styles.paymentMethodText}>{method.details}</ThemedText>
          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <ThemedText style={styles.defaultText}>Default</ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleDeletePaymentMethod(method.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="card-outline" size={64} color="#94A3B8" />
      <ThemedText style={styles.emptyTitle}>No payment methods</ThemedText>
      <ThemedText style={styles.emptyText}>
        Add a payment method to make booking easier.
      </ThemedText>
    </View>
  );

  // Render loading state
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <ThemedText style={styles.loadingText}>Loading payment methods...</ThemedText>
      </ThemedView>
    );
  }

  // Render error state
  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <ThemedText style={styles.errorTitle}>Error</ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={loadPaymentMethods}>
          <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.errorBackButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Payment Methods</ThemedText>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Saved Cards Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Saved Card/UPI</ThemedText>
            
            {paymentMethods.length > 0 ? (
              paymentMethods.map(renderPaymentMethod)
            ) : (
              renderEmptyList()
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Add Payment Method Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            // Reset form for adding new payment method
            setNewPaymentMethod({
              type: 'card' as PaymentMethodType,
              name: '',
              details: '',
              isDefault: false
            });
            setIsEditMode(false);
            setEditingPaymentMethodId(null);
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          <ThemedText style={styles.addButtonText}>Add Payment Method</ThemedText>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setIsEditMode(false);
          setEditingPaymentMethodId(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {isEditMode ? 'Edit Payment Method' : 'Add Payment Method'}
              </ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setIsEditMode(false);
                  setEditingPaymentMethodId(null);
                  setNewPaymentMethod({
                    type: 'card' as PaymentMethodType,
                    name: '',
                    details: '',
                    isDefault: false
                  });
                }}
                hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Payment Type</ThemedText>
                <View style={styles.paymentTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.paymentTypeButton,
                      newPaymentMethod.type === 'card' && styles.paymentTypeSelected
                    ]}
                    onPress={() => setNewPaymentMethod(prev => ({ ...prev, type: 'card' as PaymentMethodType }))}
                  >
                    <Ionicons name="card-outline" size={20} color={newPaymentMethod.type === 'card' ? '#2563EB' : '#64748B'} />
                    <ThemedText style={[
                      styles.paymentTypeText,
                      newPaymentMethod.type === 'card' && styles.paymentTypeTextSelected
                    ]}>Card</ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.paymentTypeButton,
                      newPaymentMethod.type === 'bank' && styles.paymentTypeSelected
                    ]}
                    onPress={() => setNewPaymentMethod(prev => ({ ...prev, type: 'bank' as PaymentMethodType }))}
                  >
                    <Ionicons name="business-outline" size={20} color={newPaymentMethod.type === 'bank' ? '#2563EB' : '#64748B'} />
                    <ThemedText style={[
                      styles.paymentTypeText,
                      newPaymentMethod.type === 'bank' && styles.paymentTypeTextSelected
                    ]}>Bank</ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.paymentTypeButton,
                      newPaymentMethod.type === 'upi' && styles.paymentTypeSelected
                    ]}
                    onPress={() => setNewPaymentMethod(prev => ({ ...prev, type: 'upi' as PaymentMethodType }))}
                  >
                    <Ionicons name="phone-portrait-outline" size={20} color={newPaymentMethod.type === 'upi' ? '#2563EB' : '#64748B'} />
                    <ThemedText style={[
                      styles.paymentTypeText,
                      newPaymentMethod.type === 'upi' && styles.paymentTypeTextSelected
                    ]}>UPI</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Name</ThemedText>
                <TextInput
                  style={styles.input}
                  value={newPaymentMethod.name}
                  onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, name: text }))}
                  placeholder="Enter card/bank/UPI name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Details</ThemedText>
                <TextInput
                  style={styles.input}
                  value={newPaymentMethod.details}
                  onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, details: text }))}
                  placeholder="Enter card number/account/UPI ID"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.switchContainer}>
                <ThemedText style={styles.switchLabel}>Set as default</ThemedText>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    newPaymentMethod.isDefault && styles.switchButtonActive
                  ]}
                  onPress={() => setNewPaymentMethod(prev => ({ ...prev, isDefault: !prev.isDefault }))}
                >
                  <View style={[
                    styles.switchKnob,
                    newPaymentMethod.isDefault && styles.switchKnobActive
                  ]} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addMethodButton}
              onPress={handleAddPaymentMethod}
            >
              <ThemedText style={styles.addMethodButtonText}>
                {isEditMode ? 'Update Payment Method' : 'Add Payment Method'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 55 : 20,
    paddingHorizontal: 16,
    borderBottomColor: '#E5E7EB',
  },
  headerBackButton: {
    marginRight: 8,
    paddingVertical: 30,
    paddingHorizontal: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#EF4444',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBackButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#2563EB',
    fontSize: 16,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentMethodInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#64748B',
  },
  defaultBadge: {
    backgroundColor: '#E0F2FE',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  defaultText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalBody: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentTypeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  paymentTypeSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  paymentTypeText: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
  },
  paymentTypeTextSelected: {
    color: '#2563EB',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  switchButton: {
    width: 46,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    padding: 2,
  },
  switchButtonActive: {
    backgroundColor: '#2563EB',
  },
  switchKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  switchKnobActive: {
    transform: [{ translateX: 22 }],
  },
  addMethodButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  addMethodButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  addButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalBackButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
});

export default PaymentMethodsScreen; 