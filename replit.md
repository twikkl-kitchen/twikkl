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
- `BASE_URL` - Backend API URL (configured in .env)

## Development Setup (Replit)
The app is configured to run on the web using Expo's web support:
- Development server runs on port 5000
- Host: 0.0.0.0 (to support Replit's proxy)
- Expo web platform automatically configured

## Navigation Structure
**Bottom Navigation (4 tabs):**
- **Home** → NewHome.tsx - Social feed with posts
- **Shorts** → Shorts.tsx - Vertical video feed
- **Create** → video/CreateUploadVideo - Upload/create content
- **Server** → Server.tsx - Community/server discovery

**Top Right Navigation:**
- Profile icon accessible from NewHome and Shorts headers
- Notification bell on all main screens
- Server quick access from headers

## Recent Changes
- **October 08, 2025** - Navigation Restructure:
  - Created new home feed screen (NewHome.tsx) with social feed layout
  - Converted original home to Shorts screen (Shorts.tsx) for video content
  - Created Server screen (Server.tsx) to replace Discover in navigation
  - Updated bottom navigation to: Home, Shorts, Create, Server
  - Moved Profile from bottom nav to top-right corner icon
  - Profile screen now uses back navigation instead of hardcoded routes
- Initial setup in Replit environment
- Configured for web deployment on port 5000
- Added web dependencies (react-dom)
