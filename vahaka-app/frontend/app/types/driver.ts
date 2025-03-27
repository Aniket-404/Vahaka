export interface Badge {
  id: string;
  name: string;
  icon: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  date: string;
}

export interface Vehicle {
  make: string;
  model: string;
  year: string;
  color: string;
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  trips: number;
  price: number;
  image: string;
  badges: Badge[];
  description?: string;
  languages?: string[];
  vehicle?: Vehicle;
  vehicleImage?: string;
  reviews?: Review[];
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