export interface Badge {
  id: string;
  name: string;
  icon: string;
}

export interface Review {
  id: string;
  userId?: string;
  userName?: string;
  user?: string; // For backward compatibility
  userAvatar?: string;
  rating: number;
  text?: string;
  comment?: string; // For backward compatibility
  date: string;
}

export interface Vehicle {
  make: string;
  model: string;
  year?: string;
  color?: string;
  plateNumber?: string;
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  trips: number;
  price: number;
  image: string;
  badges?: Badge[] | null;
  description?: string;
  languages?: string[] | null;
  vehicle?: string | Vehicle | null;
  vehicleImage?: string;
  reviews?: Review[] | null;
  experience?: number;
  status?: string;
  phoneNumber?: string;
  email?: string;
  location?: any;
  license?: any;
  preferences?: any;
  vehicleDetails?: any;
  tripType?: string;
}

export interface TripType {
  id: string;
  name: string;
  icon: string;
}

export interface BookingDetails {
  id: string;
  driverId: string;
  driverName: string;
  driverImage: string;
  tripType: string;
  startDate: string;
  endDate: string;
  duration: string;
  location: string;
  destination: string;
  amount: number;
  paymentMethod: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

// For default export requirements
const DriverTypes = {
  Badge: {} as Badge,
  Review: {} as Review,
  Vehicle: {} as Vehicle,
  Driver: {} as Driver,
  TripType: {} as TripType,
  BookingDetails: {} as BookingDetails,
};

export default DriverTypes; 