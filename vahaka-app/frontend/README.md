# Vahaka - Driver Booking App

Vahaka is a mobile application built with React Native and Expo where users can book drivers for various purposes like business trips, weekly bookings, or for urgent travel needs.

## Features

- 🚗 Browse and search for available drivers
- 🔍 Filter drivers by trip type (Business, Weekly, Urgent, Outstation)
- 📊 View driver details, ratings, and reviews
- 📅 Book drivers for specific dates and duration
- 💰 Clear pricing with detailed breakdown
- 👤 User profile management
- 💳 Multiple payment methods support
- 🗂️ Booking history and management

## Screenshots

- Home Screen: Shows available drivers and filtering options
- Driver Details: Displays comprehensive driver information and booking options
- Profile: User profile with booking history and account settings

## Tech Stack

- Frontend:
  - React Native / Expo
  - React Navigation
  - Axios for API requests
  - React Native Elements for UI components
  - Expo Linear Gradient for visual effects

- Backend:
  - Node.js
  - Express.js
  - RESTful API architecture

## Installation & Setup

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI

### Frontend Setup

```bash
# Navigate to the project directory
cd vahaka-app

# Install dependencies
npm install

# Start the Expo development server
npm start
```

### Backend Setup

```bash
# Navigate to the backend directory
cd vahaka-app/backend

# Install dependencies
npm install

# Start the backend server
npm run dev
```

## Usage

1. Launch the app on your device or emulator
2. Browse available drivers on the home screen
3. Filter drivers based on your trip requirements
4. Select a driver to view details and pricing
5. Choose date and duration for your booking
6. Confirm booking and make payment
7. Manage your bookings and profile from the Profile tab

## API Endpoints

The backend provides the following API endpoints:

- `/api/drivers` - Get all drivers
- `/api/drivers/:id` - Get a specific driver
- `/api/bookings` - Create a new booking
- `/api/users/:userId/bookings` - Get user's bookings
- `/api/users/:userId` - Get user profile
- `/api/users/:userId/payment-methods` - Manage payment methods
- `/api/drivers/:driverId/reviews` - Add reviews for drivers

## Contributing

Contributions to Vahaka are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Firebase Setup

### Authentication
1. Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication in the Authentication section
3. Copy your Firebase config values to `.env.local` file

### Firestore Database
1. Create a Firestore database in a region close to your users
2. Configure Security Rules:
   - Go to the Firestore Database section in the Firebase Console
   - Click on the "Rules" tab
   - Copy the rules from `firestore.rules` file in this project
   - Click "Publish" to apply the rules

### Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```
# App Firebase Config (User App)
EXPO_PUBLIC_APP_FIREBASE_API_KEY=your_app_api_key
EXPO_PUBLIC_APP_FIREBASE_AUTH_DOMAIN=your_app_auth_domain
EXPO_PUBLIC_APP_FIREBASE_PROJECT_ID=your_app_project_id
EXPO_PUBLIC_APP_FIREBASE_STORAGE_BUCKET=your_app_storage_bucket
EXPO_PUBLIC_APP_FIREBASE_MESSAGING_SENDER_ID=your_app_messaging_sender_id
EXPO_PUBLIC_APP_FIREBASE_APP_ID=your_app_app_id

# Partner Firebase Config (Driver Data)
EXPO_PUBLIC_FIREBASE_API_KEY=partner_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=partner_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=partner_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=partner_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=partner_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=partner_app_id
```

## Troubleshooting

### Firebase Authentication Issues
- **API Key Not Valid**: Make sure your Firebase API key is correct in `.env.local`
- **Firebase App Already Exists**: The app may try to initialize Firebase multiple times. This is handled automatically.

### Firestore Permission Errors
If you see "Missing or insufficient permissions" errors:
1. Check Firestore security rules in the Firebase Console
2. Make sure rules allow read/write for authenticated users
3. Verify the user is properly authenticated before accessing Firestore
4. Reference the `firestore.rules` file for the correct rule configuration
