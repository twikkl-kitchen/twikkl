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

## External Dependencies & Backend Architecture
*   **Backend API**: Express.js/TypeScript backend hosted on Replit (port 5000)
*   **State Management**: simpler-state
*   **Internationalization**: i18next, react-i18next
*   **UI Library**: React Native Paper
*   **Styling**: Styled Components
*   **Wallet SDK**: Para embedded wallet SDK
*   **Authentication**: Replit Auth with Google OAuth support
*   **Database**: PostgreSQL via Replit (Neon-backed) using Drizzle ORM
*   **Storage**: Replit App Storage (Object Storage) for video files
*   **Local Storage**: AsyncStorage (for theme persistence on mobile)

## Backend Architecture (Oct 31, 2025)
*   **Framework**: Express.js with TypeScript
*   **Database ORM**: Drizzle ORM with PostgreSQL
*   **Authentication**: Replit Auth (OpenID Connect) - supports Google, GitHub, X, Apple, email/password
*   **Session Management**: express-session with PostgreSQL storage
*   **File Storage**: Replit Object Storage (@replit/object-storage)
*   **Database Schema**:
    *   `users` - User profiles with referral codes
    *   `servers` - Community servers (public/private)
    *   `server_members` - Server membership tracking
    *   `videos` - Video metadata with server associations
    *   `upload_counts` - 24-hour upload limit tracking (2 per server)
    *   `referrals` - Referral system tracking
    *   `sessions` - Session storage (required for Replit Auth)

## Backend API Endpoints
*   **Auth**: `/api/login`, `/api/logout`, `/api/auth/user`, `/api/auth/create-username`, `/api/auth/telegram`
*   **Videos**: `/api/videos/upload`, `/api/videos/create`, `/api/videos/stream/:userId/:fileName`
*   **Servers**: `/api/servers`, `/api/servers/:serverId`, `/api/users/:userId/servers`
*   **Referrals**: `/api/referrals`, `/api/referrals/code/:code`, `/api/users/:userId/referrals`

## Recent Changes (Nov 15, 2025)
*   **Authentication Redesign**: Created Replit-style unified auth screen with Google OAuth, Telegram OAuth, and Email/Password options
*   **Username Endpoint**: Added `/api/auth/create-username` backend endpoint for username creation after signup
*   **Telegram OAuth**: Full Telegram authentication integration with automatic username import
*   **Navigation Fix**: Fixed post-signup navigation to redirect to NewHome screen instead of unmatched route
*   **Shorts Video Fix**: Fixed video overlapping issue in Shorts screen - videos now display one at a time with proper scrolling
*   **Database Schema**: Added `username` field to users table (varchar 50, unique)
*   **Storage Methods**: Added `updateUser()` method to DatabaseStorage for user profile updates

## Previous Changes (Oct 31, 2025)
*   **Backend Migration**: Migrated from Heroku NestJS backend to Replit-hosted Express.js backend
*   **Replit Auth Integration**: Implemented Replit Auth for authentication (supports Google OAuth)
*   **PostgreSQL Database**: Set up Replit PostgreSQL database with complete schema for users, videos, servers, referrals
*   **Object Storage**: Integrated Replit App Storage for video file uploads and streaming
*   **Referral System**: Implemented referral code generation, validation, and tracking
*   **Upload Limits**: Enforced 2 videos per 24 hours per server limit
*   **API Configuration**: Updated frontend to use local Replit backend (`/api/*` endpoints)
*   **Deployment**: Configured for VM deployment on Replit