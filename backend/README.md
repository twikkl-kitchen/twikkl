# Twikkl Backend API

Backend server for Twikkl app with Google OAuth authentication and Supabase integration.

## Features

- 🔐 Google OAuth 2.0 Authentication
- 📹 Video Upload to Supabase Storage
- 👥 User Management
- 🎯 Server/Community Management
- 🔒 JWT Token Authentication

## Setup

### 1. Environment Variables

The following secrets are already configured in Replit:
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service role key

### 2. Supabase Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `supabase-schema.sql` to create all tables

### 3. Supabase Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `videos`
3. Set bucket to **Public** (or configure RLS policies)
4. File size limit: 100MB recommended

### 4. Google OAuth Setup

Make sure your Google Cloud Console OAuth credentials have the correct redirect URI:
- Development: `http://localhost:3000/api/auth/google/callback`
- Production: `https://your-domain.com/api/auth/google/callback`

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout user

### Videos
- `POST /api/videos/upload` - Upload video file (requires auth)
- `POST /api/videos/create` - Create video post (requires auth)
- `GET /api/videos/server/:serverId` - Get videos for a server
- `GET /api/videos/server/:serverId/upload-count` - Get user's upload count (requires auth)

### Health
- `GET /api/health` - Health check
- `GET /` - API info

## Running Locally

```bash
cd backend
npm start
```

Server runs on port 3000 by default.

## Architecture

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── supabase.js  # Supabase client setup
│   │   └── passport.js  # Passport Google OAuth setup
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   └── videoController.js
│   ├── middleware/      # Custom middleware
│   │   └── auth.js      # Authentication middleware
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   └── videos.js
│   └── server.js        # Main server file
├── supabase-schema.sql  # Database schema
└── package.json
```

## Video Upload Flow

1. User records/selects video in React Native app
2. Video file is sent to `/api/videos/upload`
3. Backend uploads to Supabase Storage bucket
4. Returns public URL
5. Frontend calls `/api/videos/create` with URL and metadata
6. Video post is saved to database

## Authentication Flow

1. User taps "Sign in with Google" in app
2. Opens browser/WebView to `/api/auth/google`
3. User authenticates with Google
4. Redirected to `/api/auth/google/callback`
5. Backend creates/updates user in database
6. Returns JWT token via deep link: `twikkl://auth?token=...`
7. App stores token and uses it for subsequent API calls
