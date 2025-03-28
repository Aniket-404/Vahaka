export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Trip {
  id: string;
  driverId: string;
  passengerId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  pickup: {
    location: {
      latitude: number;
      longitude: number;
    };
    address: string;
  };
  dropoff: {
    location: {
      latitude: number;
      longitude: number;
    };
    address: string;
  };
  distance: number; // in kilometers
  duration: number; // estimated in minutes
  fare: number;
  paymentMethod: 'cash' | 'card' | 'wallet';
  paymentStatus: 'pending' | 'completed';
  rating?: number;
  feedback?: string;
  requestTime: Date;
  acceptTime?: Date;
  pickupTime?: Date;
  dropoffTime?: Date;
  cancelTime?: Date;
  cancelledBy?: 'driver' | 'passenger';
  cancellationReason?: string;
} 