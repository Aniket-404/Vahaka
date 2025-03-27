declare module '*/components' {
  import { ViewStyle, TextStyle, TextInputProps } from 'react-native';
  
  export interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
  }
  
  export interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
  }
  
  export interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
  }
  
  export const Card: React.FC<CardProps>;
  export const Button: React.FC<ButtonProps>;
  export const Input: React.FC<InputProps>;
}

declare module '*/services' {
  import { Firestore } from 'firebase/firestore';
  import { Driver } from '*/types';
  
  export interface TestDocumentsResult {
    testDocId: string;
    driverDocId: string;
  }
  
  export const db: Firestore;
  
  export const driverService: {
    createTestDocuments: () => Promise<TestDocumentsResult>;
    createDriver: (driverData: Omit<Driver, 'id'>) => Promise<string>;
    updateDriver: (driverId: string, driverData: Partial<Driver>) => Promise<void>;
    getDriver: (driverId: string) => Promise<Driver | null>;
    getApprovedDrivers: () => Promise<Driver[]>;
    updateDriverLocation: (driverId: string, location: { latitude: number; longitude: number }) => Promise<void>;
    updateDriverAvailability: (driverId: string, isAvailable: boolean) => Promise<void>;
  };
}

declare module '*/types' {
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
}

declare module '*/constants/theme' {
  export const COLORS: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  
  export const SPACING: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  
  export const FONTS: {
    regular: string;
    medium: string;
    bold: string;
  };
  
  export const FONT_SIZES: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  
  export const BORDER_RADIUS: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    round: number;
  };
  
  export const SHADOWS: {
    small: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    large: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
} 