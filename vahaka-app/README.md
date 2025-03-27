# Vahaka - Driver Booking App

Vahaka is a mobile application built with React Native (frontend) and Express.js (backend) where users can book drivers for various purposes like business trips, weekly bookings, or for urgent travel needs.

## Project Structure

This project is organized into two main directories:

- `frontend/`: Contains the React Native mobile application
- `backend/`: Contains the Express.js API server

## Technologies Used

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Express.js, Node.js
- **API Communication**: Axios
- **UI Components**: Custom components with theming support

## TypeScript Types

The project uses TypeScript for type safety. Key type definitions can be found in:

- `frontend/app/types/driver.ts`: Contains interfaces for Driver, Trip, Booking, etc.

These types ensure consistency across the application and help catch errors at compile time.

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm run dev
   ```
   The backend server will run on port 3000 by default.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm start
   ```

4. Run on a physical device:
   - Install the Expo Go app on your device
   - Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android)
   - Make sure your phone and computer are on the same Wi-Fi network

5. Run on an emulator:
   - For Android: Press 'a' in the terminal or click "Run on Android device/emulator"
   - For iOS: Press 'i' in the terminal or click "Run on iOS simulator" (macOS only)

### API URL Configuration

The application automatically handles API URL configuration based on your environment:

- **Android Emulator**: Uses `10.0.2.2:3000` (automatically configured)
- **iOS Simulator**: Uses `localhost:3000` (automatically configured)
- **Physical Device**: For physical devices, the app will attempt to use a configured IP
- **Production**: Uses the production URL (configured in the build)

API configurations are in `frontend/app/services/api.js`.

## Features

- Browse and search for drivers
- Filter drivers by trip type
- View driver details, pricing, and reviews
- Book drivers for specific dates and duration
- Manage user profile and bookings
- Multiple payment methods support

## Development Notes

- **Error Handling**: The API client includes comprehensive error handling
- **TypeScript**: Strict type checking is enabled in `tsconfig.json`
- **Responsive Design**: UI components adapt to different screen sizes
- **Mock Data**: Sample data is provided in both frontend and backend

## License

This project is licensed under the MIT License. 