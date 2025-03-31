export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  createdAt: Date;
}

export interface User {
  uid: string;
  profile: UserProfile;
}

export interface Booking {
  id: string;
  userId: string;
  driverId: string;
  startDate: Date | string;
  endDate: Date | string;
  createdAt: Date | string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  totalAmount?: number;
  location?: string;
  tripType?: string;
  notes?: string;
  duration?: number;
  rating?: number;
  review?: string;
  cancelReason?: string;
  driverName?: string;
  driverImage?: string;
  driverDetails?: {
    name?: string;
    phone?: string;
    vehicle?: string | {
      make?: string;
      model?: string;
      color?: string;
      plateNumber?: string;
      year?: number;
      [key: string]: any;
    };
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'bank';
  name: string;
  details: string;
  isDefault: boolean;
}

// Default export to satisfy Expo Router
export default () => null; 