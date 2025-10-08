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
  /Discover      - Discovery screens
  /video         - Video creation screens
/src
  /components    - Reusable components
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

## Recent Changes
- Initial setup in Replit environment (October 08, 2025)
- Configured for web deployment on port 5000
- Added web dependencies (react-dom)
