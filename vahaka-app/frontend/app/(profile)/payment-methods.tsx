import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText, ThemedView } from '../../components/Themed';
import { getUserPaymentMethods, addPaymentMethod, deletePaymentMethod } from '../services/userService';
import { PaymentMethod } from '../types/user';
import { useAuth } from '../context/auth';
import { router } from 'expo-router';

const PaymentMethodsScreen = () => {
  const { refreshUserData } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card',
    name: '',
    details: '',
    isDefault: false
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const methods = await getUserPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
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
      await addPaymentMethod(newPaymentMethod);
      setModalVisible(false);
      setNewPaymentMethod({
        type: 'card',
        name: '',
        details: '',
        isDefault: false
      });
      loadPaymentMethods();
      Alert.alert('Success', 'Payment method added successfully');
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', 'Failed to add payment method');
    }
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
      <View style={styles.paymentMethodInfo}>
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
      </View>
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

  return (
    <ThemedView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
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
            <ThemedText style={styles.sectionTitle}>Saved Cards</ThemedText>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <ThemedText style={styles.loadingText}>Loading payment methods...</ThemedText>
              </View>
            ) : paymentMethods.length > 0 ? (
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
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          <ThemedText style={styles.addButtonText}>Add Payment Method</ThemedText>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add Payment Method</ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setNewPaymentMethod({
                    type: 'card',
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
                    onPress={() => setNewPaymentMethod(prev => ({ ...prev, type: 'card' }))}
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
                    onPress={() => setNewPaymentMethod(prev => ({ ...prev, type: 'bank' }))}
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
                    onPress={() => setNewPaymentMethod(prev => ({ ...prev, type: 'upi' }))}
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
              <ThemedText style={styles.addMethodButtonText}>Add Payment Method</ThemedText>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
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
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
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
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
});

export default PaymentMethodsScreen; 