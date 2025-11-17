# Twikkl App - React Native/Expo Project

## Overview
Twikkl is a cross-platform DApp built with React Native and Expo for live-streaming, recording, and sharing videos. It aims to provide a decentralized platform for video content creators and consumers, featuring multi-chain wallet integration, community servers, and a comprehensive video management system. The project focuses on a seamless user experience across platforms, leveraging Expo for web deployment within the Replit environment. Its ambition is to create a dynamic ecosystem for video content, fostering community and enabling new monetization opportunities through decentralization.

## User Preferences
I want to ensure all code changes are thoroughly reviewed. Please ask before making major architectural changes or introducing new dependencies. For UI/UX adjustments, provide screenshots or detailed descriptions of the proposed changes. I prefer clear, concise explanations for complex technical decisions.

## System Architecture
**Framework & Core Technologies**: The application uses React Native with Expo (Managed Workflow) and TypeScript. Styling is handled with Styled Components.

**Routing**: Expo Router provides file-based routing.

**UI/UX Design**:
*   **Theming**: Global, persistent dark/light mode with brand-specific colors (Primary Green: `#50A040`, Dark Mode: `#041105`, Light Mode: `#F5F5F5`). Theme preferences are saved using AsyncStorage.
*   **Navigation**: Features a four-tab bottom navigation (Home, Shorts, Servers, Wallet) and a top-right navigation for theme toggle, search, notifications, and profile. A prominent green "+" Floating Action Button initiates video creation.
*   **Onboarding**: Splash screen followed by an animated video introduction for first-time users.
*   **Authentication**: Optional for browsing, but required for content creation, interactions, and profile access.

**Technical Implementations & Features**:
*   **Wallet System**: Multi-chain support (Ethereum, Solana, Polygon) using Para embedded wallet SDK for automatic wallet generation. Includes balance display, transaction history, send/receive, and chain switching with error handling.
*   **Server System**: Supports Public and Private servers with a guided creation flow. Features include joining/leaving, favoriting, inviting members, content moderation, and image management (profile/banner). Servers organize videos by category in horizontally scrolling rows, with a 2-video per 24-hour upload limit per server.
*   **Video System**: Users can create and upload videos with category and visibility settings.
*   **Social Features**: Comprehensive system including comments, likes, follows, and view tracking.
    *   **Comments**: Create, view, and delete comments on videos.
    *   **Likes**: Toggle likes on videos with unique constraints and count tracking.
    *   **Follows**: Follow/unfollow users, check status, and retrieve follower/following lists.
    *   **View Tracking**: Records video views with watch duration and completion status (supports anonymous views).
*   **Search Functionality**: Full-text search across videos, servers, and users.
*   **Profile Management**: Complete user profiles with customizable display name, bio, profile image, and banner image. Includes a dedicated profile settings screen for editing.
*   **Admin System**: Role-based permissions for server administration (owner, admin, member) with custom category management and admin management.
*   **Development Setup**: Configured for web execution on Replit, running on port 5000 with host `0.0.0.0`.

## External Dependencies
*   **Backend API**: Express.js/TypeScript
*   **State Management**: simpler-state
*   **Internationalization**: i18next, react-i18next
*   **UI Library**: React Native Paper
*   **Styling**: Styled Components
*   **Wallet SDK**: Para embedded wallet SDK
*   **Authentication**: Replit Auth (with Google OAuth, Telegram OAuth, Email/Password), Passport.js
*   **Database**: PostgreSQL (Neon-backed) via Drizzle ORM
*   **Storage**: Replit App Storage (Object Storage) for video files, AsyncStorage for local persistence
*   **Session Management**: express-session with PostgreSQL storage