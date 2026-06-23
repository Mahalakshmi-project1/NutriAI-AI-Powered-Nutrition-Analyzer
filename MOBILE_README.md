# NutriAI Mobile App - Build Instructions

## Overview

NutriAI has been converted to a complete mobile application using Capacitor. All existing website features are preserved while adding mobile-specific enhancements.

## What's New

### Mobile-Specific Features
- **Bottom Navigation**: Home, Dashboard, AI Tools, Health Hub, Profile
- **Push Notifications**: Water reminders, meal reminders, exercise reminders, daily health tips
- **Splash Screen**: NutriAI logo with "Your Personal AI Nutrition Assistant" tagline
- **Offline Support**: Local food/water/exercise log storage, auto-syncs when online
- **Mobile Profile**: Personal details, health goals, gender selection, progress tracking

### App Structure
```
src/
├── components/
│   ├── MobileNav.tsx        # Bottom navigation bar
│   ├── MobileProfile.tsx    # Enhanced profile section
│   ├── AITools.tsx          # AI tools hub page
│   └── SplashScreen.tsx     # Native-like splash screen
├── lib/
│   └── mobile.ts            # Capacitor integration, notifications, offline storage
└── App.tsx                  # Updated with mobile routes
```

## Build Steps

### Prerequisites
- Node.js 18+ installed
- Android Studio installed
- Java JDK 17+ installed
- Android SDK configured

### Build Android APK

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Build the web app**:
   ```bash
   npm run build
   ```

3. **Sync with Capacitor**:
   ```bash
   npx cap sync android
   ```

4. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

5. **Build APK in Android Studio**:
   - Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - APK will be generated at: `android/app/build/outputs/apk/debug/app-debug.apk`

6. **Run on device/emulator**:
   - Connect Android device or start emulator
   - In Android Studio, click **Run** (green play button)

## Android Configuration

### App Info
- **Package Name**: `com.nutriai.app`
- **App Name**: NutriAI
- **Version**: 1.0.0

### Permissions Required
- Internet access
- Network state
- Notifications
- Vibration
- Wake lock
- Camera (optional, for food photo scanning)
- Location (optional, for nearby food discovery)

### Branding
- **Theme Color**: #10B981 (Green)
- **App Icon**: NutriAI logo with green apple
- **Splash Screen**: Green gradient with centered logo

## Push Notifications

### Notification Types
1. **Water Reminders**: 8 glasses/day from 8 AM to 10 PM
2. **Meal Reminders**: Breakfast (8 AM), Lunch (12 PM), Snack (4 PM), Dinner (7 PM)
3. **Exercise Reminder**: Daily at 6 PM (configurable)
4. **Health Tips**: Random daily tip at 9 AM

### Enable Push Notifications
In the app, go to **Profile > App Settings > Push Notifications** and toggle it on.

## Offline Support

### How It Works
- Food, water, and exercise logs are stored locally using LocalForage
- When internet is available, data syncs to Supabase automatically
- `offline_food_logs`, `offline_water_logs`, `offline_exercise_logs` tables track sync status

### Offline Storage API (lib/mobile.ts)
```typescript
// Save food log offline
await saveFoodLogOffline(log)

// Get all offline food logs
await getOfflineFoodLogs()

// Mark as synced after successful upload
await markLogsSynced('food', ids)
```

## Development

### Run Web Dev Server
```bash
npm run dev
```

### Run on Android Device
```bash
npm run build
npx cap sync android
npx cap run android
```

### Update Capacitor Configuration
Edit `capacitor.config.ts` to modify:
- App ID and name
- Splash screen settings
- Notification settings
- Android-specific options

## Project Structure

```
project/
├── android/                 # Native Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── assets/public/    # Web app files
│   │   │   ├── res/              # Android resources
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   └── ...
├── src/
│   ├── components/          # React components
│   ├── hooks/              # React hooks
│   ├── lib/                # Utilities & services
│   └── types/              # TypeScript types
├── supabase/
│   ├── functions/          # Edge functions
│   └── migrations/         # Database migrations
└── capacitor.config.ts     # Capacitor configuration
```

## Troubleshooting

### Build Errors
1. **Gradle sync failed**: Ensure Java 17+ is installed
2. **SDK not found**: Set ANDROID_HOME environment variable
3. **Plugin errors**: Run `npx cap update android`

### Runtime Issues
1. **White screen**: Check JavaScript console in Android Studio
2. **API calls fail**: Ensure Supabase URL is accessible
3. **Notifications not working**: Grant notification permission in device settings

## Release Build

### Generate Signed APK
1. In Android Studio: **Build > Generate Signed Bundle / APK**
2. Create new or use existing keystore
3. Select **APK** and create release build
4. Upload to Google Play Store

### Production Checklist
- [ ] Update versionCode and versionName in build.gradle
- [ ] Sign APK with production keystore
- [ ] Configure proguard rules for code shrinking
- [ ] Test on multiple Android versions (8.0+)
- [ ] Update privacy policy link
- [ ] Prepare store listing assets

## Features Summary

All existing web features are available in the mobile app:

### Core Features
- BMI Calculator with personalized insights
- AI Nutrition Chatbot (24/7)
- Food Tracking (5000+ Indian foods)
- Water Intake Tracker
- Exercise Tracker
- Deficiency Detection
- Budget Diet Planner
- Nearby Healthy Foods Discovery
- Women's Health Hub
- Admin Panel

### Mobile-Exclusive Features
- Offline data storage and sync
- Push notification reminders
- Native splash screen
- Bottom navigation
- Touch-optimized profile editing
- Device preference sync
