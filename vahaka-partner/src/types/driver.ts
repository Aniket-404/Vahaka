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
  vehicle: {
    make: string;
    model: string;
    year: string;
    color: string;
    plateNumber: string;
  };
  license: {
    number: string;
    expiryDate: string;
  };
  createdAt: Date;
  updatedAt: Date;
  profileImage?: string;
  location?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  currentTrip?: {
    id: string;
    status: 'active' | 'completed' | 'cancelled';
  };
} 