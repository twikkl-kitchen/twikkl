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
    *   **UI Design**: Compact header design (~20% screen height) with banner, server icon, title, status, member count, and action buttons (Create, Chat, Invite).
    *   **Video Organization**: Category-based video display with horizontal scrolling rows. Categories: Tutorial, Trading, Development, General, News.
    *   **Video Integration**: Videos organized by category with "View All" buttons for each category. Video creation within servers includes camera/gallery access, category selection, and visibility options (Followers, Public, Private).
    *   **Upload Limit**: Enforces a rolling 24-hour limit of 2 videos per server.
    *   **Image Management**: Owners/admins can upload 1:1 profile and 16:9 banner images for servers. Banners fill entire container space with proper aspect ratios.
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
    *   `comments` - Video comments with user associations
    *   `likes` - Video likes tracking (unique per video/user)
    *   `follows` - User follow relationships (unique per follower/following)
    *   `video_views` - Video view tracking with watch metrics

## Backend API Endpoints
*   **Auth**: `/api/login`, `/api/logout`, `/api/auth/user`, `/api/auth/create-username`, `/api/auth/telegram`
*   **Videos**: `/api/videos/upload`, `/api/videos/create`, `/api/videos/stream/:userId/:fileName`
*   **Servers**: `/api/servers`, `/api/servers/:serverId`, `/api/users/:userId/servers`
*   **Referrals**: `/api/referrals`, `/api/referrals/code/:code`, `/api/users/:userId/referrals`
*   **Comments**: POST `/api/comments`, GET `/api/videos/:videoId/comments`, DELETE `/api/comments/:commentId`
*   **Likes**: POST `/api/videos/:videoId/like`, GET `/api/videos/:videoId/liked`, GET `/api/videos/:videoId/likes`
*   **Follows**: POST `/api/users/:userId/follow`, DELETE `/api/users/:userId/follow`, GET `/api/users/:userId/following`, GET `/api/users/:userId/followers`, GET `/api/users/:userId/following-list`
*   **Views**: POST `/api/videos/:videoId/view`, GET `/api/videos/:videoId/views`
*   **Search**: GET `/api/search/videos?q=`, GET `/api/search/servers?q=`, GET `/api/search/users?q=`
*   **Feed**: GET `/api/feed/following` (authenticated users only)

## Recent Changes (Nov 15, 2025)
*   **Complete Social Features System**: Full implementation of comments, likes, follows, views, and search
    *   **Database Schema**: Added 4 new tables - `comments`, `likes`, `follows`, `video_views`
    *   **Comments System**: Create, view, and delete comments on videos with user associations
    *   **Like System**: Toggle likes on videos with unique constraints and like count tracking
    *   **Follow System**: Follow/unfollow users, check following status, get follower/following lists with counts
    *   **View Tracking**: Record video views with watch duration and completion status (supports anonymous views)
    *   **Search Functionality**: Full-text search across videos (title, description), servers (name, description, location), and users (username, email)
    *   **Following Feed**: Dedicated feed showing videos from users you follow (app/Following.tsx)
    *   **Shorts Navigation Fix**: Changed "Following" button to navigate to following feed instead of servers
    *   **API Config Updates**: Added all social feature endpoints to src/config/api.ts
    *   **Foreign Keys**: All tables properly linked with cascade delete for referential integrity
    *   **Indexes**: Optimized queries with indexes on video_id, user_id, follower_id, following_id, viewed_at
*   **Previous Updates (Same Day)**:
*   **Admin System & Custom Categories**: Complete server administration system with role-based permissions
    *   **Database Schema**: Added `categories` field (JSON array) to servers table, `role` field to serverMembers table ('owner', 'admin', 'member')
    *   **Backend API Endpoints**: 
        *   GET/PUT `/api/servers/:serverId/categories` - Manage custom categories for each server
        *   GET `/api/servers/:serverId/is-admin` - Check if user is admin
        *   GET/POST/DELETE `/api/servers/:serverId/admins` - Admin management (add/remove)
    *   **Permission Middleware**: Protected admin endpoints with role-based access control
    *   **Server Settings Screen**: Tab-based UI (Categories, Admins) for server configuration (admin-only access)
    *   **Category Editor**: Add, edit, delete custom categories with validation (no duplicates, non-empty)
    *   **Admin Management**: Add/remove server admins, visual distinction for owners with shield icon
    *   **Dynamic Category Selector**: Video upload fetches server's custom categories from backend
    *   **Permission-Based UI**: Settings button only visible to server admins
*   **Trending Servers Navigation**: Fixed trending server avatars to navigate to actual server detail pages instead of displaying images
*   **Dark Mode Improvements**: Added dark mode support to trending section text and server UI components
*   **Server UI Redesign**: Completely redesigned server screens for better UX and more video content visibility
    *   **Compact Header**: Reduced server header from ~40% to ~20% of screen height, increased profile image size to 80x80px
    *   **Banner Fixes**: Fixed banner images to properly fill entire container space (140px height) in both server list and detail views
    *   **2-Row Grid Layout**: Videos display in YouTube-style 2-row grid - videos arranged in columns (2 per column) that scroll horizontally
    *   **Category Organization**: Videos organized by category (Tutorial, Trading, Development, General, News) with each category showing 2 rows of videos
    *   **View All Categories**: Added category detail screens to view all videos in a specific category
    *   **Action Buttons**: Inline Create and Invite buttons for quick server actions (removed non-existent Chat button)
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