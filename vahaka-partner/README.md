# Vahaka Partner

A mobile application for driver partners of the Vahaka transportation platform. This app allows drivers to manage their profiles, preferences, and availability.

## Features

- **User Authentication**: Secure login and signup with Firebase Auth
- **Profile Management**: Complete driver profile creation and editing
- **Preference Settings**: Set daily rates, preferred trip types, and availability
- **Online/Offline Toggle**: Drivers can easily mark themselves as available or unavailable
- **Vehicle & License Information**: Store and manage vehicle and license details

## Tech Stack

- React Native / Expo
- Firebase Authentication
- Firestore Database
- Firebase Storage
- Expo Router for navigation

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- Expo CLI
- Firebase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/YourUsername/vahaka-partner.git
   cd vahaka-partner
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Environment Variables:
   - The app uses Firebase configuration from environment variables
   - Run the environment setup script to create a `.env` file:
   ```
   npm run setup-env
   ```
   - This script creates a `.env` file based on `.env.example` with placeholder values
   - Update the values in the `.env` file with your Firebase project details:
   ```
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-storage-bucket
   FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   FIREBASE_APP_ID=your-app-id
   FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```
   
   > **Note:** Never commit your `.env` file to version control. The `.env.example` file with placeholder values is safe to commit.

4. Start the development server:
   ```
   npx expo start
   ```

## Project Structure

```
vahaka-partner/
├── assets/           # Contains app images and static assets
├── components/       # Reusable React components
├── screens/          # Main app screens
│   ├── AuthScreen.js # Login and signup screen
│   └── ProfileScreen.js # Driver profile management screen
├── services/         # Firebase and other service configurations
├── App.js            # App entry point with navigation configuration
├── app.json          # Expo configuration
└── package.json      # Dependencies and scripts
```

## Firebase Setup

This app uses Firebase for authentication, Firestore for database, and Firebase Storage for image storage. 

### Firestore Database Structure

The app uses the following Firestore collection structure:

```
partners (collection)
  ├── {partnerId} (document)
  │   ├── auth (object)
  │   │   ├── email: string
  │   │   ├── phone: string
  │   │   ├── createdAt: timestamp
  │   │   └── lastLogin: timestamp
  │   ├── profile (object)
  │   │   ├── name: string
  │   │   ├── experience: number
  │   │   ├── about: string
  │   │   ├── status: 'pending' | 'approved' | 'rejected'
  │   │   ├── rating: number
  │   │   └── totalTrips: number
  │   ├── preferences (object)
  │   │   ├── tripTypes: string[]
  │   │   ├── pricePerDay: number
  │   │   ├── availability: object
  │   │   └── additionalServices: string[]
  │   ├── vehicle (object)
  │   │   ├── make: string
  │   │   ├── model: string
  │   │   ├── year: number
  │   │   ├── color: string
  │   │   └── plateNumber: string
  │   └── license (object)
  │       ├── number: string
  │       └── expiryDate: string
```

## Development

To run the app in development mode:

```
npx expo start
```

To run the app with a clean cache:

```
npx expo start --clear
```

Press 'a' to run on Android, 'i' for iOS, or 'w' for web.

## Build

To create a production build:

```
npx expo build:android
npx expo build:ios
```

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For any queries, please reach out to [your-email@example.com](mailto:your-email@example.com).

## Environment Variables

The app loads environment variables from two sources:

1. The `.env` file in the root directory (for local development)
2. Expo's app.json `extra` field (for production builds)

To check if your environment variables are correctly loaded:

```javascript
import { ENV, validateEnv } from './services/env';

// Check if environment is valid
const isValid = validateEnv();
console.log("Environment valid:", isValid);

// Access environment variables
console.log("Firebase Project ID:", ENV.FIREBASE_PROJECT_ID);
```

When building for production, ensure your environment variables are properly set in your CI/CD pipeline. 