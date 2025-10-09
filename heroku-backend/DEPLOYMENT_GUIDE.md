# Twikkl Backend - Google OAuth & Video Upload Integration

## New Features Added

### 1. Google OAuth Authentication
- **Endpoints**:
  - `GET /auth/google` - Initiates Google OAuth flow
  - `GET /auth/google/callback` - Handles OAuth callback
  - `GET /auth/me` - Get current user info
  - `POST /auth/logout` - Logout

### 2. Video Upload with Supabase
- **Endpoints**:
  - `POST /videos/upload` - Upload video (50MB limit)
  - `GET /videos/server/:serverId` - Get server videos
  - `GET /videos/server/:serverId/upload-count` - Check upload count

## Required Environment Variables

Add these to your Heroku config vars:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BACKEND_URL=https://your-heroku-app.herokuapp.com

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# JWT (already configured)
JWT_SECRET=your_jwt_secret
```

## Deployment Steps

### 1. Push to GitHub
```bash
cd heroku-backend
git add .
git commit -m "Add Google OAuth and video upload functionality"
git push origin staging  # or main
```

### 2. Deploy to Heroku
```bash
# If using Heroku Git
git push heroku staging:main

# Or deploy via Heroku Dashboard
# Go to Deploy tab → Connect to GitHub → Deploy Branch
```

### 3. Set Environment Variables
In Heroku Dashboard → Settings → Config Vars, add:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `BACKEND_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

### 4. Create Supabase Storage Bucket
In your Supabase project:
1. Go to Storage
2. Create a new bucket named `videos`
3. Set it to Public
4. Configure CORS if needed

## Testing

### Test Google OAuth:
```bash
curl https://your-backend.herokuapp.com/auth/google
# Should redirect to Google sign-in
```

### Test Video Upload:
```bash
curl -X POST https://your-backend.herokuapp.com/videos/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@test-video.mp4" \
  -F "serverId=server123"
```

## File Changes Summary

### New Files Created:
- `/modules/auth/google-oauth.service.ts` - Google OAuth service
- `/modules/videos/videos.module.ts` - Videos module
- `/modules/videos/videos.controller.ts` - Video upload endpoints
- `/modules/videos/videos.service.ts` - Video upload logic with Supabase

### Modified Files:
- `/modules/auth/auth.controller.ts` - Added Google OAuth endpoints
- `/modules/auth/auth.service.ts` - Added `googleLogin()` method
- `/modules/auth/auth.module.ts` - Added GoogleOAuthService
- `/app.module.ts` - Added VideosModule

### Dependencies Added:
- `google-auth-library` - For Google OAuth
- `@supabase/supabase-js` - Already installed
- `multer` - Already installed

## Frontend Integration

Update your frontend `BACKEND_URL` to point to Heroku:
```bash
# In Replit Secrets
BACKEND_URL=https://your-heroku-app.herokuapp.com
```

Then restart your frontend application.

## Troubleshooting

### Google OAuth not working:
1. Check Google Console → OAuth Consent Screen is configured
2. Verify redirect URI: `https://your-backend.herokuapp.com/auth/google/callback`
3. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set

### Video upload fails:
1. Verify Supabase bucket `videos` exists and is public
2. Check SUPABASE_SERVICE_KEY has proper permissions
3. Confirm file size is under 50MB

### Deep link not working:
1. Ensure mobile app has registered `twikkl://` URL scheme
2. Check deep link handler in mobile app

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy to Heroku
3. ✅ Set environment variables
4. ✅ Test Google OAuth
5. ✅ Test video upload
6. ✅ Update frontend BACKEND_URL
7. ✅ Test end-to-end flow
