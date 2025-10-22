# Relay Mobile - Contractor Communication Platform# Relay - Contractor Communication Platform



A barebones Expo app with TypeScript for the Relay platform.A barebones React Native mobile app with TypeScript for the Relay platform.



## Overview## Overview



Relay is a contractor-to-client communication platform that integrates with CRMs like JobNimbus. This mobile app allows project managers and field workers to quickly create and send project updates to clients.Relay is a contractor-to-client communication platform that integrates with CRMs like JobNimbus. This mobile app allows project managers and field workers to quickly create and send project updates to clients.



## Tech Stack## Tech Stack



- **Framework:** Expo (React Native)- **Framework:** React Native 0.82.1

- **Language:** TypeScript- **Language:** TypeScript

- **Platform:** iOS, Android, Web- **Platform:** iOS & Android



## Why Expo?## Project Structure



✅ Easy testing on real devices (no need for Xcode/Android Studio)  ```

✅ Built-in camera, image picker, notifications  RelayMobile/

✅ Over-the-air updates  ├── App.tsx           # Main app entry point (barebones)

✅ Simple deployment  ├── android/          # Android native code

├── ios/              # iOS native code

## Getting Started├── package.json      # Dependencies

└── tsconfig.json     # TypeScript configuration

### Prerequisites```



- Node.js 18+ and npm## Getting Started

- **Expo Go app** on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Prerequisites

### Installation

- Node.js 18+ and npm

Dependencies are already installed. If you need to reinstall:- For iOS: Xcode, CocoaPods

- For Android: Android Studio, JDK

```bash

cd RelayMobile### Installation

npm install

```Dependencies are already installed. If you need to reinstall:



### Running on Your Device```bash

cd RelayMobile

**1. Start the development server:**npm install

```bash```

cd RelayMobile

npm start### Running the App

```

**iOS:**

**2. On your phone:**```bash

- Open the **Expo Go** appcd RelayMobile

- Scan the QR code that appears in the terminalcd ios && pod install && cd ..

- The app will load on your device!npx react-native run-ios

```

**Alternative: Run on simulator/emulator:**

```bash**Android:**

npm run ios      # iOS Simulator (Mac only)```bash

npm run android  # Android Emulatorcd RelayMobile

npm run web      # Web browsernpx react-native run-android

``````



## Project Structure## Current State



```The app is **completely barebones** with:

RelayMobile/- ✅ TypeScript configured

├── App.tsx              # Main entry point (barebones)- ✅ Basic app structure

├── app.json             # Expo configuration- ✅ Simple welcome screen

├── package.json         # Dependencies- ❌ No navigation

├── tsconfig.json        # TypeScript config- ❌ No UI library

└── assets/              # Images, fonts, etc.- ❌ No state management

```- ❌ No API integration



## Current State## Next Steps



The app is **completely barebones** with:### Phase 1: Foundation

- ✅ TypeScript configured1. Add navigation (React Navigation)

- ✅ Expo setup complete2. Add UI component library (React Native Paper or NativeBase)

- ✅ Simple welcome screen3. Set up folder structure (screens, components, services, etc.)

- ✅ Ready to test on real device via Expo Go4. Add environment configuration

- ❌ No navigation

- ❌ No UI library### Phase 2: Core Features

- ❌ No state management1. Authentication screen

- ❌ No API integration2. Project list screen

3. Create update screen with photo upload

## Next Steps4. Camera integration



### Phase 1: Foundation### Phase 3: Integration

1. **Add folder structure**1. API client setup

   ```2. CRM integration module

   src/3. Photo upload to backend

   ├── screens/     # App screens4. Update sync functionality

   ├── components/  # Reusable components

   ├── services/    # API, storage, etc.## Architecture Vision

   ├── types/       # TypeScript types

   └── utils/       # Helper functions```

   ```Mobile App

├── Screens

2. **Add navigation** - Expo Router or React Navigation│   ├── Auth (Login)

3. **Add UI library** - React Native Paper, NativeBase, or Tamagui│   ├── Projects (List from CRM)

4. **Environment config** - Development, staging, production│   ├── UpdateCreate (Quick update form)

│   └── UpdateHistory

### Phase 2: Core Features├── Components

1. **Authentication**│   ├── PhotoPicker

   - Login screen│   ├── ProjectCard

   - Token storage (AsyncStorage or SecureStore)│   └── UpdateForm

   - Auto-login├── Services

│   ├── api.ts (Backend API)

2. **Project List**│   ├── crm.ts (CRM adapter)

   - Fetch from backend/CRM│   └── storage.ts (Local cache)

   - Pull-to-refresh└── State

   - Offline caching    ├── auth

    ├── projects

3. **Create Update**    └── updates

   - Quick form with text input```

   - Photo picker/camera

   - Template selection## Development Notes

   - Submit button

- Keep the app **simple and fast** - field workers need speed

4. **Camera Integration**- **Offline-first** - job sites may have poor connectivity

   - `expo-camera` or `expo-image-picker`- **Photo-centric** - easy camera access and upload

   - Photo preview- **Template-driven** - pre-filled update types

   - Multiple photo selection

## License

### Phase 3: Backend Integration

1. **API Client**Proprietary

   - Axios/Fetch wrapper

   - Auth headers

   - Error handling# Getting Started



2. **CRM Integration**> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

   - JobNimbus adapter

   - Project sync## Step 1: Start Metro

   - Update posting

First, you will need to run **Metro**, the JavaScript build tool for React Native.

3. **Photo Upload**

   - Image compressionTo start the Metro dev server, run the following command from the root of your React Native project:

   - Progress tracking

   - Retry logic```sh

# Using npm

### Phase 4: Polishnpm start

1. **Offline Support**

   - Queue updates when offline# OR using Yarn

   - Sync when back onlineyarn start

   - Local storage with AsyncStorage```



2. **Push Notifications**## Step 2: Build and run your app

   - `expo-notifications`

   - Update confirmationsWith Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

   - Error alerts

### Android

3. **Performance**

   - Image optimization```sh

   - Lazy loading# Using npm

   - Memory managementnpm run android



## Recommended Packages# OR using Yarn

yarn android

```bash```

# Navigation

npm install @react-navigation/native @react-navigation/native-stack### iOS

npm install react-native-screens react-native-safe-area-context

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

# UI Library

npm install react-native-paperThe first time you create a new project, run the Ruby bundler to install CocoaPods itself:

npm install react-native-vector-icons

```sh

# Formsbundle install

npm install react-hook-form yup```



# State ManagementThen, and every time you update your native dependencies, run:

npm install zustand

# or```sh

npm install @tanstack/react-querybundle exec pod install

```

# Camera & Images

npx expo install expo-camera expo-image-picker expo-media-libraryFor more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).



# Storage```sh

npx expo install expo-secure-store @react-native-async-storage/async-storage# Using npm

npm run ios

# API

npm install axios# OR using Yarn

```yarn ios

```

## Testing on Device

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

### Method 1: Expo Go (Easiest)

1. Install Expo Go on your phoneThis is one way to run your app — you can also build it directly from Android Studio or Xcode.

2. Run `npm start`

3. Scan QR code## Step 3: Modify your app

4. ✅ Instant testing!

Now that you have successfully run the app, let's make changes!

**Limitations:**

- Can't use certain native modulesOpen `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

- Shared Expo runtime

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

### Method 2: Development Build (More Control)

```bash- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).

npx expo install expo-dev-client- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

npx eas build --profile development --platform ios

```## Congratulations! :tada:



**Benefits:**You've successfully run and modified your React Native App. :partying_face:

- Use any native modules

- Custom native code### Now what?

- Still get fast refresh

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).

### Method 3: Production Build- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

```bash

npx eas build --platform ios# Troubleshooting

npx eas build --platform android

```If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.



## Architecture Vision# Learn More



```To learn more about React Native, take a look at the following resources:

Mobile App

├── Screens- [React Native Website](https://reactnative.dev) - learn more about React Native.

│   ├── AuthScreen (Login)- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.

│   ├── ProjectListScreen- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.

│   ├── CreateUpdateScreen- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.

│   └── UpdateHistoryScreen- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

├── Components
│   ├── PhotoPicker
│   ├── ProjectCard
│   ├── UpdateForm
│   └── TemplateSelector
├── Services
│   ├── api.ts (Backend API)
│   ├── crm.ts (CRM adapter)
│   ├── storage.ts (Local cache)
│   └── auth.ts (Auth handling)
├── Store (State)
│   ├── authStore.ts
│   ├── projectStore.ts
│   └── updateStore.ts
└── Types
    ├── project.ts
    ├── update.ts
    └── user.ts
```

## Development Workflow

1. **Make changes** in your code editor
2. **Save** - the app auto-refreshes on your device
3. **Shake device** - open dev menu
4. **Two-finger long press** - open debugger

## Tips for Success

- 📱 **Keep it simple** - Field workers need speed
- 🔌 **Offline-first** - Job sites have poor connectivity
- 📸 **Photo-centric** - Easy camera access is key
- 🎨 **Template-driven** - Pre-filled update types
- ⚡ **Fast updates** - Goal: <2 minutes from photo to sent

## Expo Commands

```bash
npm start          # Start development server
npm run android    # Open on Android
npm run ios        # Open on iOS  
npm run web        # Open in browser

npx expo doctor    # Check for issues
npx expo install   # Install Expo SDK packages
```

## Environment Configuration

Create `.env` files:

```bash
# .env.development
API_URL=http://localhost:3000
CRM_API_URL=https://dev.jobnimbus.com

# .env.production
API_URL=https://api.relay.com
CRM_API_URL=https://api.jobnimbus.com
```

Use `expo-constants` to access:
```typescript
import Constants from 'expo-constants';
const apiUrl = Constants.expoConfig?.extra?.apiUrl;
```

## Troubleshooting

**App won't load on phone:**
- Make sure phone and computer are on same WiFi
- Check firewall settings
- Try `npm start --tunnel`

**TypeScript errors:**
- Run `npm run tsc` to check types
- Make sure `tsconfig.json` is correct

**Build issues:**
- Run `npx expo doctor` to diagnose
- Clear cache: `npx expo start -c`

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Expo Examples](https://github.com/expo/examples)

## License

Proprietary - Relay Platform
