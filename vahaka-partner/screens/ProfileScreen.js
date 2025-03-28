import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function ProfileScreen({ navigation }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [driver, setDriver] = useState({
    name: '',
    phone: '',
    email: '',
    experience: '',
    about: '',
    vehicle: {
      make: '',
      model: '',
      year: '',
      color: '',
      plateNumber: ''
    },
    license: {
      number: '',
      expiryDate: ''
    },
    preferences: {
      tripTypes: [],
      pricePerDay: '',
      preferredLocations: [],
      availability: {
        startTime: '',
        endTime: '',
        days: []
      },
      additionalServices: []
    }
  });

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Load driver profile if it exists
        try {
          const partnerRef = doc(db, 'partners', user.uid);
          const partnerDoc = await getDoc(partnerRef);
          
          if (partnerDoc.exists()) {
            const data = partnerDoc.data();
            setDriver({
              name: data.profile?.name || '',
              phone: data.auth?.phone || '',
              email: data.auth?.email || '',
              experience: data.profile?.experience?.toString() || '',
              about: data.profile?.about || '',
              vehicle: data.vehicle || {
                make: '',
                model: '',
                year: '',
                color: '',
                plateNumber: ''
              },
              license: data.license || {
                number: '',
                expiryDate: ''
              },
              preferences: {
                tripTypes: data.preferences?.tripTypes || [],
                pricePerDay: data.preferences?.pricePerDay || '',
                preferredLocations: data.preferences?.preferredLocations || [],
                availability: {
                  startTime: data.preferences?.availability?.startTime || '',
                  endTime: data.preferences?.availability?.endTime || '',
                  days: data.preferences?.availability?.days || []
                },
                additionalServices: data.preferences?.additionalServices || []
              }
            });
          } else {
            // New user, prefill email from auth
            setDriver(prev => ({
              ...prev,
              email: user.email || '',
              preferences: {
                tripTypes: [],
                pricePerDay: '',
                preferredLocations: [],
                availability: {
                  startTime: '',
                  endTime: '',
                  days: []
                },
                additionalServices: []
              }
            }));
            setIsEditing(true); // Enable editing for new users
          }
        } catch (error) {
          console.error("Error loading driver profile:", error);
          Alert.alert("Error", "Could not load your profile.");
        }
      } else {
        // For now, just show empty form in edit mode instead of redirecting
        setIsEditing(true);
        console.log("No user logged in, showing editable form");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!driver.name || !driver.phone || !driver.email) {
        Alert.alert("Error", "Name, phone number, and email are required.");
        setLoading(false);
        return;
      }

      // Validate preferences
      if (!driver.preferences.pricePerDay || driver.preferences.tripTypes.length === 0) {
        Alert.alert("Error", "Please set your daily rate and at least one preferred trip type.");
        setLoading(false);
        return;
      }

      // By this point, we should have a user
      if (!auth.currentUser) {
        Alert.alert("Error", "Could not authenticate. Please try again.");
        setLoading(false);
        return;
      }

      // Format data for Firestore
      const partnerData = {
        auth: {
          email: driver.email,
          phone: driver.phone,
          lastLogin: new Date().toISOString()
        },
        profile: {
          name: driver.name,
          experience: parseInt(driver.experience) || 0,
          about: driver.about,
          status: 'pending',
          rating: 0,
          totalTrips: 0
        },
        vehicle: {
          make: driver.vehicle.make,
          model: driver.vehicle.model,
          year: parseInt(driver.vehicle.year) || new Date().getFullYear(),
          color: driver.vehicle.color,
          plateNumber: driver.vehicle.plateNumber
        },
        license: {
          number: driver.license.number,
          expiryDate: driver.license.expiryDate
        },
        location: {
          latitude: 0,
          longitude: 0,
          lastUpdated: new Date().toISOString()
        },
        preferences: {
          tripTypes: driver.preferences.tripTypes,
          pricePerDay: parseInt(driver.preferences.pricePerDay) || 0,
          preferredLocations: driver.preferences.preferredLocations,
          availability: driver.preferences.availability,
          additionalServices: driver.preferences.additionalServices
        }
      };

      const partnerRef = doc(db, 'partners', auth.currentUser.uid);
      await setDoc(partnerRef, partnerData, { merge: true });
      
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [section, key] = field.split('.');
      setDriver({
        ...driver,
        [section]: {
          ...driver[section],
          [key]: value
        }
      });
    } else {
      setDriver({
        ...driver,
        [field]: value
      });
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Firebase - this will trigger onAuthStateChanged
      // and automatically navigate to Auth screen
      await signOut(auth);
      
      // No need to explicitly navigate since onAuthStateChanged will handle it
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Driver Profile</Text>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <FontAwesome5 name="sign-out-alt" size={18} color="#EF4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileImageContainer}>
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <FontAwesome5 name="user" size={40} color="#94A3B8" />
            </View>
            {!isEditing && (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <FontAwesome5 name="edit" size={18} color="#2563EB" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <InputField
              label="Full Name"
              value={driver.name}
              onChangeText={(value) => handleInputChange('name', value)}
              editable={isEditing}
              placeholder="Enter your full name"
            />
            
            <InputField
              label="Phone Number"
              value={driver.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              editable={isEditing}
              keyboardType="phone-pad"
              placeholder="Enter your phone number"
            />
            
            <InputField
              label="Email Address"
              value={driver.email}
              onChangeText={(value) => handleInputChange('email', value)}
              editable={isEditing}
              keyboardType="email-address"
              placeholder="Enter your email"
            />
            
            <InputField
              label="Years of Experience"
              value={driver.experience}
              onChangeText={(value) => handleInputChange('experience', value)}
              editable={isEditing}
              keyboardType="numeric"
              placeholder="Enter years of driving experience"
            />
            
            <InputField
              label="About Yourself"
              value={driver.about}
              onChangeText={(value) => handleInputChange('about', value)}
              editable={isEditing}
              multiline
              numberOfLines={4}
              placeholder="Tell us about yourself and your driving experience"
              style={styles.multilineInput}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <InputField
              label="Daily Rate (₹)"
              value={driver.preferences?.pricePerDay || ''}
              onChangeText={(value) => handleInputChange('preferences.pricePerDay', value)}
              editable={isEditing}
              keyboardType="numeric"
              placeholder="Enter your daily rate"
            />

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Preferred Trip Types</Text>
              <View style={styles.checkboxContainer}>
                {['urgent', 'outstation', 'business', 'weekly'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.checkbox,
                      driver.preferences?.tripTypes?.includes(type) && styles.checkboxChecked
                    ]}
                    onPress={() => {
                      if (isEditing) {
                        const newTypes = driver.preferences?.tripTypes?.includes(type)
                          ? driver.preferences.tripTypes.filter(t => t !== type)
                          : [...(driver.preferences?.tripTypes || []), type];
                        handleInputChange('preferences.tripTypes', newTypes);
                      }
                    }}
                  >
                    <FontAwesome5
                      name={driver.preferences?.tripTypes?.includes(type) ? "check-square" : "square"}
                      size={20}
                      color={driver.preferences?.tripTypes?.includes(type) ? "#2563EB" : "#94A3B8"}
                    />
                    <Text style={[
                      styles.checkboxLabel,
                      driver.preferences?.tripTypes?.includes(type) && styles.checkboxLabelChecked
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Availability</Text>
              <View style={[styles.timeContainer, { marginTop: 6 }]}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[
                      styles.input,
                      !isEditing && styles.disabledInput,
                      { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
                    ]}
                    value={driver.preferences?.availability?.startTime || ''}
                    onChangeText={(value) => handleInputChange('preferences.availability.startTime', value)}
                    editable={isEditing}
                    placeholder="Start (HH:MM)"
                  />
                </View>
                <Text style={styles.timeSeparator}>to</Text>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[
                      styles.input,
                      !isEditing && styles.disabledInput,
                      { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }
                    ]}
                    value={driver.preferences?.availability?.endTime || ''}
                    onChangeText={(value) => handleInputChange('preferences.availability.endTime', value)}
                    editable={isEditing}
                    placeholder="End (HH:MM)"
                  />
                </View>
              </View>
              <View style={styles.daysContainer}>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      driver.preferences?.availability?.days?.includes(day) && styles.dayButtonSelected
                    ]}
                    onPress={() => {
                      if (isEditing) {
                        const newDays = driver.preferences?.availability?.days?.includes(day)
                          ? driver.preferences.availability.days.filter(d => d !== day)
                          : [...(driver.preferences?.availability?.days || []), day];
                        handleInputChange('preferences.availability.days', newDays);
                      }
                    }}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      driver.preferences?.availability?.days?.includes(day) && styles.dayButtonTextSelected
                    ]}>
                      {day.slice(0, 3).toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Additional Services</Text>
              <View style={styles.checkboxContainer}>
                {['guide', 'food', 'ac'].map((service) => (
                  <TouchableOpacity
                    key={service}
                    style={[
                      styles.checkbox,
                      driver.preferences?.additionalServices?.includes(service) && styles.checkboxChecked
                    ]}
                    onPress={() => {
                      if (isEditing) {
                        const newServices = driver.preferences?.additionalServices?.includes(service)
                          ? driver.preferences.additionalServices.filter(s => s !== service)
                          : [...(driver.preferences?.additionalServices || []), service];
                        handleInputChange('preferences.additionalServices', newServices);
                      }
                    }}
                  >
                    <FontAwesome5
                      name={driver.preferences?.additionalServices?.includes(service) ? "check-square" : "square"}
                      size={20}
                      color={driver.preferences?.additionalServices?.includes(service) ? "#2563EB" : "#94A3B8"}
                    />
                    <Text style={[
                      styles.checkboxLabel,
                      driver.preferences?.additionalServices?.includes(service) && styles.checkboxLabelChecked
                    ]}>
                      {service.charAt(0).toUpperCase() + service.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            
            <InputField
              label="Vehicle Make"
              value={driver.vehicle.make}
              onChangeText={(value) => handleInputChange('vehicle.make', value)}
              editable={isEditing}
              placeholder="e.g. Toyota, Honda, etc."
            />
            
            <InputField
              label="Vehicle Model"
              value={driver.vehicle.model}
              onChangeText={(value) => handleInputChange('vehicle.model', value)}
              editable={isEditing}
              placeholder="e.g. Camry, Civic, etc."
            />
            
            <InputField
              label="Year"
              value={driver.vehicle.year}
              onChangeText={(value) => handleInputChange('vehicle.year', value)}
              editable={isEditing}
              keyboardType="numeric"
              placeholder="e.g. 2020"
            />
            
            <InputField
              label="Color"
              value={driver.vehicle.color}
              onChangeText={(value) => handleInputChange('vehicle.color', value)}
              editable={isEditing}
              placeholder="e.g. Silver, Black, etc."
            />
            
            <InputField
              label="License Plate Number"
              value={driver.vehicle.plateNumber}
              onChangeText={(value) => handleInputChange('vehicle.plateNumber', value)}
              editable={isEditing}
              placeholder="Enter license plate number"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>License Information</Text>
            
            <InputField
              label="License Number"
              value={driver.license.number}
              onChangeText={(value) => handleInputChange('license.number', value)}
              editable={isEditing}
              placeholder="Enter your driver's license number"
            />
            
            <InputField
              label="Expiry Date"
              value={driver.license.expiryDate}
              onChangeText={(value) => handleInputChange('license.expiryDate', value)}
              editable={isEditing}
              placeholder="YYYY-MM-DD"
            />
          </View>

          {isEditing && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <Text style={styles.saveButtonText}>Saving...</Text>
                ) : (
                  <Text style={styles.saveButtonText}>Save Profile</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const InputField = ({ label, value, onChangeText, editable, style, ...props }) => (
  <View style={styles.inputContainer}>
    {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
    <TextInput
      style={[
        styles.input, 
        !editable && styles.disabledInput,
        style
      ]}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#2563EB',
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
    marginLeft: 6,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  profileImagePlaceholder: {
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
    marginLeft: 6,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
    color: '#0F172A',
  },
  disabledInput: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkboxChecked: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  checkboxLabel: {
    marginLeft: 8,
    color: '#64748B',
    fontSize: 14,
  },
  checkboxLabelChecked: {
    color: '#2563EB',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeSeparator: {
    color: '#64748B',
    fontSize: 16,
    paddingHorizontal: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayButtonSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  dayButtonText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  dayButtonTextSelected: {
    color: '#2563EB',
  },
}); 