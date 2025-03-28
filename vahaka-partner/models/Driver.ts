export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  profileImage?: string;
  experience: number;
  about: string;
  status: 'pending' | 'approved' | 'rejected';
  rating: number;
  totalTrips: number;
  availability: boolean;
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    plateNumber: string;
  };
  license: {
    number: string;
    expiryDate: string;
  };
  currentTrip?: string;
  location: {
    latitude: number;
    longitude: number;
    lastUpdated: string;
  };
  documents?: {
    driverLicense?: string;
    insuranceCard?: string;
    vehicleRegistration?: string;
    profilePhoto?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
  updatedAt: string;
} 