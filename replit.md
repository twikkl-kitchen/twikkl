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
  /server        - Server management screens
    CreateServer.tsx - Server creation form
    AddMembers.tsx   - Member invitation
    Settings.tsx     - Server settings
  NewHome.tsx    - Main social feed home screen
  Shorts.tsx     - Short-form video feed (TikTok-style)
  Server.tsx     - Server/community discovery screen
  Profile.tsx    - User profile screen
  Wallet.tsx     - Multi-chain wallet screen
/src
  /components    - Reusable components
    BottomNav.tsx - Main navigation bar (Home, Shorts, Wallet, Server)
  /configs       - App configuration (theme, etc.)
  /entities      - Entity management
  /hooks         - Custom React hooks
  /services      - API services
    server.services.ts - Server CRUD and member operations
    wallet.services.ts - Multi-chain wallet operations
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
- **Home** → NewHome.tsx - Social feed with posts (house icon)
- **Shorts** → Shorts.tsx - Vertical video feed (play icon)
- **Servers** → Server.tsx - Community/server discovery (server icon)
- **Wallet** → Wallet.tsx - Wallet management (wallet icon)

**Top Right Navigation:**
- Theme toggle (sun/moon icon) - switches between dark/light mode
- Search icon (placeholder for future search functionality)
- Notification bell
- Profile icon (triggers auth if not logged in)

**Floating Action Button:**
- Green + button (bottom right) - triggers Create/Upload flow (requires auth)

## Features

### Wallet System
- **Multi-Chain Support**: Ethereum, Solana, Polygon
- **Para Integration**: Para embedded wallet SDK auto-generates wallets on account creation
- **Features**: Balance display, transaction history, send/receive, chain switching
- **Error Handling**: Comprehensive retry functionality with user-friendly messages

### Server System
- **Server Types**: Public (immediate join) or Private (request access)
- **No Join Criteria**: No eligibility requirements (removed BAYC NFT/token gates)
- **Creation Flow**: 
  1. Create Server form (name, description, location, hashtag, privacy)
  2. Add Members screen (search, multi-select invitation)
  3. Settings screen (privacy toggles, member management)
- **Features**: Join/leave, favorites, member invites, content moderation
- **Service Layer**: Complete API integration for CRUD operations

## Recent Changes
- **October 09, 2025** - Critical Wallet Authentication Fix:
  - Fixed wallet screen attempting to fetch data when user not logged in
  - Added authentication check before making any wallet API calls
  - Implemented login prompt screen for unauthenticated users
  - Eliminated all "Failed to fetch wallet data" and MetaMask connection errors
  - Browser console now clean with no wallet-related errors
- **October 09, 2025** - Server Creation & Settings Screens:
  - Built complete server creation flow:
    - **CreateServer.tsx**: Form with name, description, location, hashtag, private/public toggle
    - **AddMembers.tsx**: Search users, multi-select, skip option, dynamic "Create Server" button
    - **Settings.tsx**: General, Privacy & Members, Content, Danger Zone sections
  - Updated Server.tsx "+" button to trigger CreateServer flow
  - Added settings icon to server detail header (replaced menu icon)
  - Created server.services.ts with complete API integration
  - All screens use consistent dark theme styling and icons
  - Validation: server name required, button disabled until filled
- **October 09, 2025** - Wallet Screen Implementation:
  - Built multi-chain wallet screen with Ethereum, Solana, Polygon support
  - Features: Balance display, transaction history, send/receive buttons
  - Comprehensive error handling with retry functionality
  - Created wallet.services.ts for backend API integration
  - Fixed wallet state management for proper chain switching
- **October 09, 2025** - Server System Updates:
  - Removed all eligibility criteria (BAYC NFT/token requirements)
  - Simplified to public (immediate join) vs private (request access) servers
  - Fixed useSearchParams error in Discover screen
- **October 09, 2025** - Figma Design Implementation:
  - Implemented complete UI redesign matching Figma specifications:
    - **Header Icons**: Added sun/moon theme toggle, search icon alongside notification bell and profile
    - **Theme System**: Fully functional dark/light mode with adaptive colors for all UI elements
    - **Bottom Navigation**: Replaced Create tab with Wallet, updated icons (Home → house icon, Servers → server icon)
    - **Floating Action Button**: Green + FAB in bottom right for Create functionality
    - **New Icon Components**: Created SunIcon, MoonIcon, SearchIcon, HomeIcon, ServersIcon
    - Theme state manages: background colors, text colors, category chips, video cards
    - All navigation routes verified and functional
- **October 09, 2025** - Home Screen UI Update & Bug Fixes:
  - Updated NewHome header with YouTube-style layout:
    - Twikkl logo on the left
    - Wallet icon, notification bell, and profile icon on the right
  - Changed "Server" button to "Following" in Shorts screen
  - Fixed back button navigation on create account screen
  - Added WalletIcon component from design assets
  - Fixed Grid1 icon to accept color prop
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
