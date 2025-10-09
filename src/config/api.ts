// API Configuration
const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    GOOGLE: `${API_BASE_URL}/api/auth/google`,
    GOOGLE_CALLBACK: `${API_BASE_URL}/api/auth/google/callback`,
    ME: `${API_BASE_URL}/api/auth/me`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  
  // Video endpoints
  VIDEOS: {
    UPLOAD: `${API_BASE_URL}/api/videos/upload`,
    CREATE: `${API_BASE_URL}/api/videos/create`,
    SERVER: (serverId: string) => `${API_BASE_URL}/api/videos/server/${serverId}`,
    UPLOAD_COUNT: (serverId: string) => `${API_BASE_URL}/api/videos/server/${serverId}/upload-count`,
  },
  
  // Health check
  HEALTH: `${API_BASE_URL}/api/health`,
};

export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB limit for Supabase free tier

export default API_BASE_URL;
