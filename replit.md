# Twikkl App - React Native/Expo Project

## Overview
TwikkL is a cross-platform DApp (Decentralized Application) built with React Native and Expo for live-streaming, recording, and sharing videos. This project is set up to run on the web in the Replit environment.

## Project Architecture
- **Framework**: React Native with Expo (Managed Workflow)
- **Routing**: Expo Router (file-based routing)
- **UI Library**: React Native Paper
- **Styling**: Styled Components
- **State Management**: simpler-state
- **Internationalization**: i18next, react-i18next
- **Backend API**: https://twikkl-api-a7e6db9b083a.herokuapp.com/v1/

## Tech Stack
- React 18.2.0
- React Native 0.71.8
- Expo SDK 51
- TypeScript
- Styled Components
- React Native Paper

## Project Structure
```
/app              - Expo Router pages (file-based routing)
  /auth          - Authentication screens
  /Discover      - Discovery screens (legacy)
  /video         - Video creation screens
  NewHome.tsx    - Main social feed home screen
  Shorts.tsx     - Short-form video feed (TikTok-style)
  Server.tsx     - Server/community discovery screen
  Profile.tsx    - User profile screen
/src
  /components    - Reusable components
    BottomNav.tsx - Main navigation bar (Home, Shorts, Create, Server)
  /configs       - App configuration (theme, etc.)
  /entities      - Entity management
  /hooks         - Custom React hooks
  /services      - API services
  /utils         - Utility functions
/assets          - Images, fonts, and static assets
/translations    - i18n resources
```

## Key Configuration Files
- `app.json` - Expo configuration
- `babel.config.js` - Babel configuration with path aliases
- `metro.config.js` - Metro bundler config with SVG support
- `tsconfig.json` - TypeScript configuration

## Path Aliases
- `@twikkl/*` → `./src/*`
- `@assets/*` → `./assets/*`

## Environment Variables
- `BASE_URL` - Backend API URL (configured in Replit Secrets and .env)

## Development Setup (Replit)
The app is configured to run on the web using Expo's web support:
- Development server runs on port 5000
- Host: 0.0.0.0 (to support Replit's proxy)
- Expo web platform automatically configured

## User Flow & Navigation

**First-Time User Experience:**
1. **Splash Screen** - Twikkl logo displayed for 2 seconds
2. **Video Animation** - Animated intro with "Video Resources, Everywhere All At Once"
3. **Home Screen** - Direct access to browse videos (no login required)

**Authentication:**
- Optional authentication - users can browse without account
- Login/signup triggered from profile icon in top-right corner
- Authentication required for:
  - Creating videos (Create button)
  - User interactions (comments, likes, follows)
  - Profile access

**Bottom Navigation (4 tabs):**
- **Home** → NewHome.tsx - Social feed with posts
- **Shorts** → Shorts.tsx - Vertical video feed
- **Create** → video/CreateUploadVideo - Upload/create content (requires auth)
- **Server** → Server.tsx - Community/server discovery

**Top Right Navigation:**
- Profile icon (triggers auth if not logged in)
- Notification bell on all main screens
- Server quick access from headers

## Recent Changes
- **October 09, 2025** - Onboarding Flow & Optional Authentication:
  - Implemented first-time user onboarding flow with:
    - Splash screen showing Twikkl logo
    - Video animation screen with custom intro video
    - AsyncStorage-based detection (animation shows only on first launch)
  - Changed authentication to optional:
    - Users can browse home and shorts without login
    - Profile icon triggers signup/login for unauthenticated users
    - Create button requires authentication
    - All user interactions require authentication
  - Updated backend URL to: https://twikkl-eba1ec2fec21.herokuapp.com/v1/
  - Created /app/onboarding/ folder with Splash.tsx and VideoAnimation.tsx
  - Updated app/index.tsx to handle first-time vs returning user flow
  - Added authentication checks in BottomNav, NewHome, and Shorts screens
- **October 09, 2025** - Complete Dependency Modernization:
  - Updated all outdated dependencies for Expo SDK 51 compatibility
  - Fixed Babel configuration with proper plugins (react-native-dotenv, module-resolver, react-native-reanimated)
  - Updated Expo SDK packages: expo-asset, expo-av, expo-camera, expo-constants, expo-file-system, expo-image-picker, etc.
  - Updated React Native to 0.74.5, react-native-web to 0.19.10, react-dom to 18.2.0
  - Updated TypeScript to 5.3.3 and @types/react to 18.2.79
  - Updated React Native community packages: gesture-handler, reanimated, safe-area-context, screens, svg
  - Metro bundler now runs without errors or outdated package warnings
  - Web bundling fully functional
- **October 08, 2025** - Navigation Restructure:
  - Created new home feed screen (NewHome.tsx) with YouTube-style layout including:
    - Twikkl branding header with logo and icons
    - Horizontal scrollable categories
    - Story-style profile circles
    - Shorts section with vertical thumbnails
    - Video content cards with live badges and duration
  - Converted original home to Shorts screen (Shorts.tsx) for vertical video feed
  - Created Server screen (Server.tsx) to replace Discover in navigation
  - Updated bottom navigation to: Home, Shorts, Create, Server
  - Moved Profile from bottom nav to top-right corner icon
  - Profile screen now uses back navigation instead of hardcoded routes
- Initial setup in Replit environment
- Configured for web deployment on port 5000
- Added web dependencies (react-dom)
