# 🚗 Vahaka - Driver Booking Platform

Welcome to the Vahaka Driver Booking platform! This repository contains two distinct yet interconnected applications:

1. 📱 **Vahaka App** - Mobile application for users who want to book drivers
2. 🧑‍✈️ **Vahaka Partner** - Mobile application for drivers who provide services

## 📋 Project Overview

Vahaka is a comprehensive driver booking platform that connects passengers with professional drivers. The platform consists of two main applications:

### 🧭 Vahaka App (User Application)

An intuitive mobile application built with React Native and Expo where users can:
- Browse and search for available drivers
- Filter drivers by trip type (Business, Weekly, Urgent, Outstation)
- Book drivers for specific dates and durations
- Manage bookings and view booking history
- Manage their profile and payment methods
- Rate and review drivers

### 🚘 Vahaka Partner (Driver Application)

A dedicated mobile application for drivers to:
- Create and manage their professional profile
- Set their availability and pricing
- Manage their vehicle and license information
- Accept or reject booking requests
- Track their earnings and reviews
- Toggle online/offline status

## 🛠️ Tech Stack

The Vahaka platform is built with modern technologies:

- **Frontend**:
  - React Native / Expo
  - TypeScript
  - Expo Router for navigation
  - Linear Gradient for UI effects
  - Custom UI components

- **Backend**:
  - Firebase Authentication
  - Firestore Database
  - Firebase Storage
  - Cloud Functions (for notifications)

## 🚀 Getting Started

Follow these instructions to set up both applications for development.

### 📱 Vahaka App (User App) Setup

#### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Firebase account

#### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/vahaka.git
   cd vahaka
   ```

2. **Set up the backend server**:
   ```bash
   cd vahaka-app/backend
   npm install
   npm run dev
   ```
   This will start the backend server required for the app to function properly. Keep this terminal window open while running the frontend.

3. **Install frontend dependencies** (in a new terminal window):
   ```bash
   cd vahaka-app/frontend
   npm install
   ```

4. **Configure Firebase**:
   - Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/)
   - Enable Email/Password authentication
   - Create a Firestore database in a region close to your users
   - Set up storage for profile images
   
5. **Set up environment variables**:
   - Create a `.env.local` file in the `vahaka-app/frontend` directory
   - Add your Firebase configuration:
   ```
   EXPO_PUBLIC_APP_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_APP_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   EXPO_PUBLIC_APP_FIREBASE_APP_ID=your_app_id
   ```

6. **Start the development server**:
   ```bash
   npx expo start --clear
   ```

7. **Launch on a device or emulator**:
   - Scan the QR code with Expo Go app on your physical device
   - Press 'a' to launch on Android emulator or 'i' for iOS simulator

### 🧑‍✈️ Vahaka Partner (Driver App) Setup

#### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Firebase account (you can use the same project as the user app)

#### Installation Steps

1. **Navigate to the partner app directory**:
   ```bash
   cd vahaka-partner
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   - You can use the same Firebase project as the user app
   - Ensure the Firestore rules are set up correctly for partner access
   
4. **Set up environment variables**:
   - Create a `.env` file in the `vahaka-partner` directory
   - Add your Firebase configuration:
   ```
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

5. **Start the development server**:
   ```bash
   npx expo start --clear
   ```

6. **Launch on a device or emulator**:
   - Scan the QR code with Expo Go app on your physical device
   - Press 'a' to launch on Android emulator or 'i' for iOS simulator

## 📱 App Usage

### 👤 Vahaka User App

1. **Authentication**:
   - Sign up for a new account or log in to an existing account
   - Complete your profile information

2. **Finding Drivers**:
   - Browse available drivers on the home screen
   - Use filters to narrow down by trip type or preferences
   - Search for drivers by name

3. **Booking a Driver**:
   - Select a driver to view their details and pricing
   - Choose booking dates and duration
   - Review booking details and pricing
   - Confirm and pay for the booking

4. **Managing Bookings**:
   - View upcoming and past bookings
   - Cancel bookings if needed
   - Rate and review drivers after completed trips

5. **Profile Management**:
   - Update personal information
   - Manage payment methods
   - View booking history

### 🚘 Vahaka Partner App

1. **Authentication**:
   - Sign up for a driver account or log in
   - Complete your driver profile and vehicle information

2. **Profile Setup**:
   - Add vehicle details (make, model, year, color, plate number)
   - Upload license information
   - Set your experience level and about section
   - Upload profile photo

3. **Setting Preferences**:
   - Set your daily rate
   - Select trip types you prefer (Business, Weekly, Urgent, Outstation)
   - Configure your availability calendar

4. **Managing Bookings**:
   - View incoming booking requests
   - Accept or reject bookings
   - View upcoming and past bookings
   - Contact customers if needed

5. **Status Management**:
   - Toggle your online/offline status
   - Set vacation mode when unavailable for extended periods

## 📊 Firestore Database Structure

The application uses the following Firestore collections:

### Collections

- **users**: User accounts and profiles
- **partners**: Driver partner accounts and profiles
- **bookings**: Booking records between users and drivers
- **vehicles**: Vehicle information
- **reviews**: User reviews for drivers

## 💡 Troubleshooting

### Common Issues and Solutions

#### Firebase Authentication Issues
- **API Key Not Valid**: Ensure your Firebase API key is correct in environment files
- **Firebase App Already Exists**: The app handles multiple initialization attempts

#### Firestore Permission Errors
- Check Firestore security rules
- Ensure the user is properly authenticated before accessing Firestore

#### Expo Build Issues
- Clear cache with `expo start --clear`
- Ensure all dependencies are correctly installed

#### Backend Connection Issues
- Make sure the backend server is running (`npm run dev` in the vahaka-app/backend directory)
- Both backend and frontend servers must be running simultaneously for full functionality
- Check that your environment configuration points to the correct backend URL

## 🤝 Contributing

Contributions to Vahaka are welcome! To contribute:

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

Happy booking and driving with Vahaka! 🚗💨 