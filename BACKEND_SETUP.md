# Twikkl Backend Setup Guide

## Overview
The Twikkl backend is a complete Express.js/TypeScript server hosted on Replit with full integration of Replit's native services for authentication, database, and object storage.

## Architecture

### Technology Stack
- **Runtime**: Node.js 20 with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Replit/Neon-backed) with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect) - supports Google, GitHub, X, Apple, email/password
- **File Storage**: Replit App Storage (Object Storage)
- **Session Management**: express-session with PostgreSQL storage

### Database Schema
The backend uses the following tables:
- **users** - User profiles with auto-generated referral codes
- **servers** - Community servers (public/private)
- **server_members** - Server membership and roles
- **videos** - Video metadata with server associations
- **upload_counts** - 24-hour upload tracking (2 per server limit)
- **referrals** - Referral system tracking
- **sessions** - Session storage (required for Replit Auth)

## Setup Instructions

### 1. Database Setup
The PostgreSQL database is already provisioned. The schema is automatically created using Drizzle:

```bash
npm run db:push
```

To view and manage the database:
```bash
npm run db:studio
```

### 2. Object Storage Setup
**IMPORTANT**: You need to create an Object Storage bucket:

1. Click the **Tools** menu in Replit
2. Select **Object Storage** (or **App Storage**)
3. Click **Create new bucket**
4. Name your bucket (e.g., "twikkl-videos")
5. The bucket ID will be automatically added to your `.replit` file

Without this step, video uploads will fail!

### 3. Environment Variables
The following secrets are automatically configured by Replit:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `REPL_ID` - Replit application ID (for OAuth)

### 4. Running the Backend
Start the backend server:
```bash
npm run server
```

The server will run on port 5000 and be accessible at `/api/*` endpoints.

## API Endpoints

### Authentication (Replit Auth)
- `GET /api/login` - Initiate login flow (redirects to Replit Auth)
- `GET /api/logout` - Logout and clear session
- `GET /api/auth/user` - Get current authenticated user (protected)

### Videos
- `POST /api/videos/upload` - Upload video file (protected, max 50MB)
- `POST /api/videos/create` - Create video post with metadata (protected)
- `GET /api/videos/server/:serverId` - Get videos for a server (public)
- `GET /api/videos/server/:serverId/upload-count` - Get user's upload count in server (protected)
- `GET /api/videos/stream/:userId/:fileName` - Stream video file (public)

### Servers
- `POST /api/servers` - Create a new server (protected)
- `GET /api/servers/:serverId` - Get server details (public)
- `GET /api/users/:userId/servers` - Get user's servers (protected)

### Referrals
- `GET /api/referrals/code/:code` - Validate referral code (public)
- `POST /api/referrals` - Create referral (protected)
- `GET /api/users/:userId/referrals` - Get user's referrals (protected)

### Health
- `GET /api/health` - Health check endpoint

## Features

### 1. Authentication
- Uses Replit Auth (OpenID Connect) for secure authentication
- Supports multiple login providers (Google, GitHub, X, Apple, email/password)
- Automatic user creation with unique referral codes
- Session-based authentication with PostgreSQL storage

### 2. Video Management
- Upload videos up to 50MB
- Store videos in Replit Object Storage
- Stream videos with proper content-type headers
- Track video metadata (caption, category, visibility)
- Associate videos with servers

### 3. Upload Limits
- Enforces 2 videos per 24 hours per server
- Tracks upload counts in database
- Automatic cleanup of old upload records

### 4. Server Management
- Create public or private servers
- Automatic owner membership on creation
- Server profiles with images and banners
- Member role management (owner, admin, member)

### 5. Referral System
- Automatic generation of unique 8-character referral codes
- Referral code validation
- Track referral relationships
- Support for reward types (bonus_upload, premium_feature, etc.)

## Security Features

- CORS enabled for frontend access
- Session cookies with httpOnly and secure flags
- Authentication middleware for protected routes
- File type validation for uploads
- File size limits enforced

## Deployment

The backend is configured for VM deployment on Replit:

```bash
# Production deployment runs:
npm run server
```

The deployment is configured in `.replit` file and uses VM mode for persistent connections.

## Development

### Adding New Endpoints
1. Add route in `server/index.ts`
2. Use `isAuthenticated` middleware for protected routes
3. Access user ID via `req.user.claims.sub`

### Database Changes
1. Update schema in `shared/schema.ts`
2. Run `npm run db:push` to sync changes
3. Never write manual SQL migrations

### Testing Endpoints
Use the API health check:
```bash
curl https://your-repl-domain.replit.dev/api/health
```

## Troubleshooting

### Object Storage Errors
**Error**: "A bucket name is needed to use Cloud Storage"
**Solution**: Create a bucket in the Object Storage pane (see Setup Instructions #2)

### Database Connection Errors
**Error**: "DATABASE_URL must be set"
**Solution**: Database should be auto-provisioned. Check that DATABASE_URL exists in Secrets.

### Authentication Errors
**Error**: "Unauthorized"
**Solution**: 
- Ensure user is logged in via `/api/login`
- Check that SESSION_SECRET is set
- Verify session cookies are being sent

### CORS Errors
**Solution**: CORS is configured to allow all origins. Check that credentials are being sent with requests.

## File Structure

```
server/
  ├── index.ts          # Main Express server and routes
  ├── db.ts             # Database connection setup
  ├── storage.ts        # Database operations layer
  └── replitAuth.ts     # Replit Auth integration

shared/
  └── schema.ts         # Drizzle database schema

drizzle.config.ts       # Drizzle ORM configuration
```

## Frontend Integration

The frontend is already configured to use the backend:
- API endpoints are at `/api/*`
- Authentication flow redirects to `/api/login`
- All protected endpoints require authentication

## Support

For issues or questions:
1. Check the logs in the Backend Server workflow
2. Review the database schema in `shared/schema.ts`
3. Test endpoints with the health check
4. Verify Object Storage bucket is created
