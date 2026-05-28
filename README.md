# For-Da-Goo 🚍
v1
**A Cross-Platform Mobile Application for Public Transportation Tracking in Northern Cebu**

[![React Native](https://img.shields.io/badge/React%20Native-0.76-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-52-black.svg)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-orange.svg)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributors](#contributors)

---

## 🎯 Overview

**For-Da-Goo** is a real-time location tracking application designed specifically for commuters in Northern Cebu. The application enables students and commuters to track public transportation vehicles, share their locations, and see other users in real-time on an interactive map.

### Problem Statement
Commuters in Northern Cebu face challenges in tracking public transportation, leading to:
- Uncertainty about vehicle arrival times
- Difficulty in coordinating with fellow commuters
- Lack of real-time transportation information

### Solution
For-Da-Goo provides a cross-platform mobile application that:
- Tracks real-time locations of users and vehicles
- Displays all active users on an interactive map
- Enables location sharing with privacy controls
- Works seamlessly on both Android and Web platforms

---

## ✨ Features

### Core Features
- **Real-Time Location Tracking**: Share and view locations with 10-second update intervals
- **Interactive Map**: Cebu-focused map with custom markers and user profiles
- **User Presence System**: See who's online with automatic status updates
- **Role-Based Profiles**: Separate interfaces for Students and Drivers
- **Privacy Controls**: Toggle location sharing on/off at any time

### Authentication
- **Google Sign-In**: Seamless authentication via Google accounts
- **Guest Mode**: Quick access without account creation
- **Account Linking**: Convert guest accounts to permanent accounts

### Technical Features
- **Cross-Platform**: Single codebase for Android and Web
- **Offline Support**: Graceful handling of network interruptions
- **Real-Time Sync**: Firebase Realtime Database for instant updates
- **Responsive Design**: Optimized for various screen sizes

---

## 🛠 Technology Stack

### Frontend
- **React Native** (0.76.6) - Mobile application framework
- **Expo** (52.0.23) - Development and build platform
- **TypeScript** (5.3.3) - Type-safe development
- **React Navigation** (7.x) - Navigation and routing
- **Expo Router** - File-based routing system

### Maps & Location
- **React Native Maps** - Native map components for mobile
- **React Leaflet** - Interactive maps for web
- **Expo Location** - GPS and location services

### Backend & Database
- **Firebase Realtime Database** - Real-time data synchronization
- **Firebase Authentication** - User authentication
- **Firestore** - User profile storage

### Build & Deployment
- **EAS Build** - Cloud-based build service
- **Expo Updates** - Over-the-air (OTA) updates
- **Firebase Hosting** - Web application hosting

---

## 📁 Project Structure

```
For-Da-Goo/
├── 📱 app/                          # Application screens (Expo Router)
│   ├── (tabs)/                      # Tab-based navigation
│   │   ├── explore.tsx              # Map screen (mobile)
│   │   ├── explore.web.tsx          # Map screen (web)
│   │   ├── profile.tsx              # Profile screen (mobile)
│   │   ├── profile.web.tsx          # Profile screen (web)
│   │   └── _layout.tsx              # Tab layout configuration
│   ├── auth.tsx                     # Authentication screen
│   ├── index.tsx                    # Entry point
│   └── _layout.tsx                  # Root layout
│
├── 🎨 assets/                       # Static assets
│   └── images/                      # Images and icons
│       ├── fordagoo.png             # App logo
│       └── default_System_Profile.jpg
│
├── 🧩 components/                   # Reusable components
│   ├── icons/                       # Custom icon components
│   ├── ui/                          # UI components
│   ├── cebu-map.tsx                 # Map component (mobile)
│   ├── cebu-map.web.tsx             # Map component (web)
│   ├── custom-tab-bar.tsx           # Custom tab navigation
│   ├── profile-icon.tsx             # Profile avatar component
│   └── toast.tsx                    # Toast notifications
│
├── ⚙️ config/                       # Configuration files
│   └── firebase.ts                  # Firebase initialization
│
├── 🎨 constants/                    # App constants
│   └── theme.ts                     # Theme colors and styles
│
├── 🪝 hooks/                        # Custom React hooks
│   ├── useAuth.ts                   # Authentication logic
│   ├── use-location-sharing.ts      # Location sharing logic
│   ├── use-user-presence.ts         # User presence tracking
│   ├── use-color-scheme.ts          # Theme management
│   └── use-theme-color.ts           # Color utilities
│
├── 📚 docs/                         # Documentation
│   ├── architecture/                # Architecture documentation
│   │   └── FOLDER_STRUCTURE.md      # Detailed folder guide
│   ├── setup/                       # Setup guides
│   │   ├── GOOGLE_SIGNIN_SETUP.md   # Google Sign-In setup
│   │   ├── SETUP_SUMMARY.md         # Quick setup guide
│   │   ├── GOOGLE_SIGNIN_CHECKLIST.txt
│   │   ├── GET_WEB_CLIENT_ID.txt
│   │   └── YOUR_SHA1_CERTIFICATE.txt
│   └── technical/                   # Technical documentation
│       └── TECHNICAL_DOCUMENTATION.md
│
├── 🔧 scripts/                      # Utility scripts
│   ├── reset-project.js             # Project reset script
│   ├── test-firebase.js             # Firebase connection test
│   └── check-tunnel.js              # Network tunnel checker
│
├── 🔥 Firebase Configuration
│   ├── firebase.json                # Firebase project config
│   ├── .firebaserc                  # Firebase project aliases
│   ├── database.rules.json          # Realtime DB security rules
│   ├── firestore.rules              # Firestore security rules
│   └── firestore.indexes.json       # Firestore indexes
│
├── 📦 Build Configuration
│   ├── app.json                     # Expo app configuration
│   ├── eas.json                     # EAS Build configuration
│   ├── package.json                 # Dependencies
│   ├── tsconfig.json                # TypeScript configuration
│   └── eslint.config.js             # ESLint configuration
│
└── 🔐 Environment Files (not in repo)
    ├── .env                         # Environment variables
    └── google-services.json         # Firebase Android config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Firebase account
- Google Cloud Console account (for Google Sign-In)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JohnPerez012/For-Da-Goo-A-Cross-Platform-Mobile-Application-Development-Designed-Specifically-for-Commuters.git
   cd For-Da-Goo-A-Cross-Platform-Mobile-Application-Development-Designed-Specifically-for-Commuters
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in root directory
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=your_web_client_id
   ```

4. **Add Firebase configuration**
   - Download `google-services.json` from Firebase Console
   - Place it in the `app/` directory

5. **Deploy Firebase rules**
   ```bash
   firebase deploy --only database
   ```

### Running the Application

**Development Mode (Web)**
```bash
npm run web
```

**Development Mode (Android)**
```bash
npm run android
```

**Build APK for Android**
```bash
eas build --platform android --profile preview
```

---

## 📖 Documentation

### For Developers
- [Technical Documentation](docs/technical/TECHNICAL_DOCUMENTATION.md) - System architecture, flowcharts, and technical details
- [Folder Structure Guide](docs/architecture/FOLDER_STRUCTURE.md) - Detailed explanation of project structure

### For Setup
- [Google Sign-In Setup](docs/setup/GOOGLE_SIGNIN_SETUP.md) - Complete guide for configuring Google authentication
- [Setup Summary](docs/setup/SETUP_SUMMARY.md) - Quick setup checklist

---

## 💻 Development

### Code Structure
- **Platform-specific files**: Use `.tsx` for mobile and `.web.tsx` for web
- **Hooks**: Custom hooks in `hooks/` directory for reusable logic
- **Components**: Reusable UI components in `components/` directory
- **Type Safety**: TypeScript for type-safe development

### Key Development Practices
- **Real-time Updates**: Location updates every 10 seconds, presence every 30 seconds
- **Error Handling**: Try-catch blocks with logging, no thrown errors
- **Security**: Firebase rules for data access control
- **Performance**: Efficient data filtering and cleanup

### Testing
```bash
# Run Firebase connection test
node scripts/test-firebase.js

# Check network tunnel
node scripts/check-tunnel.js
```

---

## 🚢 Deployment

### Web Deployment (Firebase Hosting)
```bash
npm run build:web
firebase deploy --only hosting
```

### Android APK Build
```bash
# Preview build (APK)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

### Over-the-Air (OTA) Updates
```bash
# Publish update to preview channel
eas update --channel preview

# Publish update to production channel
eas update --channel production
```

---

## 👥 Contributors

**Development Team**
- John Perez - Lead Developer
- [Add other team members]

**Institution**
- [Your University/Institution Name]
- [Department/Program]

---

## 📄 License

This project is developed as part of an academic requirement.

---

## 🙏 Acknowledgments

- Firebase for real-time database and authentication
- Expo team for the amazing development platform
- React Native community for excellent libraries
- OpenStreetMap contributors for map data

---

## 📞 Contact

For questions or support, please contact:
- Email: johncadaro6@gmail.com
- GitHub: [@JohnPerez012](https://github.com/JohnPerez012)

---

**Built with ❤️ for the commuters of Northern Cebu**
