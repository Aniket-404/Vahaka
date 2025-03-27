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
