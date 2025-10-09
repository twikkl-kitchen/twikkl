// API Configuration
const API_BASE_URL = process.env.BACKEND_URL || 'https://twikkl-eba1ec2fec21.herokuapp.com/v1';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    GOOGLE: `${API_BASE_URL}/auth/google`,
    GOOGLE_CALLBACK: `${API_BASE_URL}/auth/google/callback`,
    ME: `${API_BASE_URL}/auth/me`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  
  // Video endpoints
  VIDEOS: {
    UPLOAD: `${API_BASE_URL}/videos/upload`,
    CREATE: `${API_BASE_URL}/videos/create`,
    SERVER: (serverId: string) => `${API_BASE_URL}/videos/server/${serverId}`,
    UPLOAD_COUNT: (serverId: string) => `${API_BASE_URL}/videos/server/${serverId}/upload-count`,
  },
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`,
};

export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB limit for Supabase free tier

export default API_BASE_URL;
