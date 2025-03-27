# Vahaka Partner

A React Native mobile application for driver partners in the Vahaka transportation platform.

## Features

- Driver profile management
- Real-time availability status updates
- Trip management
- Firebase integration for data storage
- TypeScript support
- Expo managed workflow

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Firebase account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vahaka-partner.git
cd vahaka-partner
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Copy your Firebase configuration from Project Settings
   - Update the configuration in `services/firebase.ts`

4. Start the development server:
```bash
npx expo start
```

## Project Structure

```
vahaka-partner/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab navigation screens
│   └── _layout.js         # Root layout configuration
├── components/            # Reusable UI components
├── constants/            # Theme and other constants
├── services/            # Firebase and other services
└── types/               # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 