# Google Auth & Supabase Integration Guide

## ✅ What's Been Set Up

### 1. Backend API (Node.js/Express)
- **Location**: `backend/` directory
- **Running on**: Port 3000
- **Features**:
  - Google OAuth 2.0 authentication
  - Video upload to Supabase Storage
  - JWT token-based authentication
  - User management

### 2. Frontend Integration
- **Google Sign-In**: WebView-based OAuth flow
- **Deep Link**: `twikkl://auth` for callback
- **Services**: Auth & Video services created
- **API Config**: Points to `localhost:3000`

### 3. Database Schema
- **Supabase Tables**:
  - `users` - User profiles from Google OAuth
  - `servers` - Communities/servers
  - `videos` - Video posts with metadata
  - `server_members` - Server membership

### 4. Video Storage
- **Bucket**: `videos` (Public)
- **Size Limit**: 50MB (Supabase free tier)
- **Upload Flow**: App → Backend API → Supabase Storage

---

## 🚀 How to Use

### For Users (Authentication)

1. **Sign In with Google**:
   - Tap "Continue with Google" button
   - Opens Google OAuth in WebView
   - Automatically redirects back to app
   - Signed in! ✅

2. **Browse Without Sign In**:
   - Users can browse videos without authentication
   - Sign-in required for: creating videos, liking, commenting

### For Developers (Video Upload)

```typescript
import videoService from '@twikkl/services/video.service';

// 1. Upload video file
const uploadResult = await videoService.uploadVideo(videoUri);

if (uploadResult.success) {
  // 2. Create video post
  const postResult = await videoService.createVideoPost({
    videoUrl: uploadResult.videoUrl!,
    fileName: uploadResult.fileName!,
    caption: 'My video',
    category: 'Tutorial',
    visibility: 'Public',
    serverId: 'optional-server-id'
  });
}
```

---

## 🔧 API Endpoints

### Authentication
- `GET /api/auth/google` - Start Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Videos
- `POST /api/videos/upload` - Upload video file (multipart/form-data)
- `POST /api/videos/create` - Create video post (JSON)
- `GET /api/videos/server/:serverId` - Get server videos
- `GET /api/videos/server/:serverId/upload-count` - Check upload limit

### Example: Upload Video

```bash
# 1. Upload file
curl -X POST http://localhost:3000/api/videos/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "video=@video.mp4"

# Response:
{
  "success": true,
  "videoUrl": "https://yholmfewvzsiaxqvmkgk.supabase.co/storage/v1/object/public/videos/...",
  "fileName": "user-id/video-id-timestamp.mp4"
}

# 2. Create post
curl -X POST http://localhost:3000/api/videos/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "...",
    "fileName": "...",
    "caption": "My video",
    "category": "Tutorial",
    "visibility": "Public"
  }'
```

---

## 📝 Environment Variables

### Frontend (.env)
```bash
BACKEND_URL=http://localhost:3000
```

### Backend (Replit Secrets)
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

---

## 🎯 Key Features

### 1. **Seamless Google Auth**
- No manual OAuth setup needed for users
- WebView handles the entire flow
- Automatic token storage
- Deep link callback to app

### 2. **Video Upload Limits**
- **50MB** per video (Supabase free tier)
- **2 videos per 24 hours** per server (rolling window)
- File size validation before upload
- Clear error messages

### 3. **Security**
- JWT tokens for API authentication
- Row Level Security (RLS) in Supabase
- Secure session management
- OAuth state verification

---

## 🔍 Troubleshooting

### "Authentication failed"
- Check Google OAuth redirect URI matches: `http://localhost:3000/api/auth/google/callback`
- Verify Replit secrets are set correctly

### "Video upload failed"
- Ensure video is under 50MB
- Check Supabase storage bucket is public
- Verify SUPABASE_SERVICE_KEY is correct

### "Deep link not working"
- Ensure app.json has `"scheme": "twikkl"`
- Check GoogleAuth.tsx is handling URL correctly
- Test redirect URL: `twikkl://auth?token=test`

---

## 📱 Next Steps

1. **Test Google Sign-In**:
   - Run the app
   - Go to Login screen
   - Tap "Continue with Google"
   - Verify redirect works

2. **Test Video Upload**:
   - Sign in
   - Go to a server
   - Record/select a video
   - Upload (should save to Supabase)

3. **Deploy to Production**:
   - Update BACKEND_URL to production domain
   - Update Google OAuth redirect URI
   - Configure Replit deployment

---

## 💡 Tips

- **50MB Limit**: Compress videos before upload for better user experience
- **Upload Count**: Resets every 24 hours (rolling window)
- **Deep Links**: Test with `adb shell am start -a android.intent.action.VIEW -d "twikkl://auth?token=test"` on Android
- **Debugging**: Check Backend Server logs in Replit for errors
