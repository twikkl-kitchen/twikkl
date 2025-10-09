# Twikkl App - React Native/Expo Project

## Overview
Twikkl is a cross-platform DApp built with React Native and Expo, designed for live-streaming, recording, and sharing videos. It aims to provide a decentralized platform for video content creators and consumers, offering features like multi-chain wallet integration, community servers, and a comprehensive video management system. The project focuses on a seamless user experience across different platforms, leveraging Expo's capabilities for web deployment within the Replit environment.

## User Preferences
I want to ensure all code changes are thoroughly reviewed. Please ask before making major architectural changes or introducing new dependencies. For UI/UX adjustments, provide screenshots or detailed descriptions of the proposed changes. I prefer clear, concise explanations for complex technical decisions.

## System Architecture
**Framework & Core Technologies**: The application is built using React Native with Expo (Managed Workflow), targeting cross-platform compatibility, including web deployment. It utilizes TypeScript for type safety and Styled Components for consistent styling.

**Routing**: Expo Router provides file-based routing, organizing application screens logically.

**UI/UX Design**:
*   **Theming**: Features a global, persistent dark/light mode system with brand-specific colors. Theme preferences are saved using AsyncStorage.
    *   **Brand Colors**: Primary Green: `#50A040`. Dark Mode: `#041105` (brand), `#000` (dark). Light Mode: `#F5F5F5`, `#fff`.
*   **Navigation**:
    *   **Bottom Navigation**: Four main tabs: Home (social feed), Shorts (vertical video feed), Servers (community discovery), and Wallet.
    *   **Top Right Navigation**: Includes theme toggle, search placeholder, notifications, and profile access.
    *   **Floating Action Button**: A prominent green "+" button for initiating video creation/upload.
*   **Onboarding**: First-time users experience a splash screen followed by an animated video introduction.
*   **Authentication**: Optional for browsing, but required for content creation, user interactions (comments, likes), and profile access.

**Technical Implementations & Features**:

*   **Wallet System**:
    *   **Multi-Chain Support**: Integrates with Ethereum, Solana, and Polygon.
    *   **Para Integration**: Utilizes Para embedded wallet SDK for automatic wallet generation.
    *   **Functionality**: Displays balances, transaction history, send/receive options, and chain switching. Includes robust error handling and retry mechanisms.
*   **Server System**:
    *   **Types**: Supports Public (immediate join) and Private (request-based access) servers.
    *   **Creation Flow**: Guided process for server creation including naming, description, location, hashtags, privacy settings, and member invitation.
    *   **Management**: Features for joining/leaving, favoriting, inviting members, and content moderation.
    *   **Video Integration**: Servers can host videos, displayed as list cards. Video creation within servers includes camera/gallery access, category selection (Tutorial, Trading, Development, General, News), and visibility options (Followers, Public, Private).
    *   **Upload Limit**: Enforces a rolling 24-hour limit of 2 videos per server.
    *   **Image Management**: Owners/admins can upload 1:1 profile and 16:9 banner images for servers.
*   **Video System**:
    *   Users can create and upload videos via a dedicated flow.
    *   Category and visibility settings are available for uploaded content.
*   **Code Structure**: Follows a modular approach with dedicated directories for components, configurations, entities, hooks, services, and utilities.
*   **Development Setup**: Configured for web execution on Replit, running on port 5000 with host `0.0.0.0` to support Replit's proxy.

## External Dependencies
*   **Backend API**: `https://twikkl-eba1ec2fec21.herokuapp.com/v1/` (NestJS backend deployed on Heroku)
*   **State Management**: simpler-state
*   **Internationalization**: i18next, react-i18next
*   **UI Library**: React Native Paper
*   **Styling**: Styled Components
*   **Wallet SDK**: Para embedded wallet SDK
*   **Authentication**: Google OAuth (integrated in Heroku NestJS backend)
*   **Database/Storage**: Supabase (PostgreSQL for data, storage for videos with 50MB limit)
*   **Local Storage**: AsyncStorage (for theme persistence)

## Recent Changes (Oct 9, 2025)
*   **Backend Consolidation**: Migrated from dual backends to single Heroku NestJS backend (`https://twikkl-eba1ec2fec21.herokuapp.com/v1/`)
*   **Google OAuth Integration**: Added Google authentication to Heroku backend with deep linking support (`twikkl://auth`)
*   **Video Upload System**: Implemented Supabase video upload with 50MB limit, upload count tracking, and server video management
*   **API Configuration**: Updated frontend to use Heroku backend endpoints (`/auth/google`, `/videos/upload`, etc.)
*   **Workflow Cleanup**: Removed local Replit backend workflow, now using single Web Server workflow on port 5000