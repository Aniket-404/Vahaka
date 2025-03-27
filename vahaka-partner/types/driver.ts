export interface Driver {
  id?: string;
  name: string;
  phone: string;
  email: string;
  experience: number;
  about: string;
  status: 'pending' | 'approved' | 'rejected';
  rating: number;
  totalTrips: number;
  availability: boolean;
  profileImage?: string;
  currentTrip?: string;
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
  createdAt: string;
  updatedAt: string;
  location: {
    latitude: number;
    longitude: number;
    lastUpdated: string;
  };
} 