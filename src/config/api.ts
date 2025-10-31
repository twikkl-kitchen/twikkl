// API Configuration
// Use Replit backend hosted on the same domain
const API_BASE_URL = process.env.BACKEND_URL || '/api';

export const API_ENDPOINTS = {
  // Auth endpoints (Replit Auth)
  AUTH: {
    LOGIN: `${API_BASE_URL}/login`,
    LOGOUT: `${API_BASE_URL}/logout`,
    ME: `${API_BASE_URL}/auth/user`,
  },
  
  // Video endpoints
  VIDEOS: {
    UPLOAD: `${API_BASE_URL}/videos/upload`,
    CREATE: `${API_BASE_URL}/videos/create`,
    SERVER: (serverId: string) => `${API_BASE_URL}/videos/server/${serverId}`,
    UPLOAD_COUNT: (serverId: string) => `${API_BASE_URL}/videos/server/${serverId}/upload-count`,
    STREAM: (userId: string, fileName: string) => `${API_BASE_URL}/videos/stream/${userId}/${fileName}`,
  },

  // Server endpoints
  SERVERS: {
    CREATE: `${API_BASE_URL}/servers`,
    GET: (serverId: string) => `${API_BASE_URL}/servers/${serverId}`,
    USER_SERVERS: (userId: string) => `${API_BASE_URL}/users/${userId}/servers`,
  },

  // Referral endpoints
  REFERRALS: {
    VALIDATE: (code: string) => `${API_BASE_URL}/referrals/code/${code}`,
    CREATE: `${API_BASE_URL}/referrals`,
    USER_REFERRALS: (userId: string) => `${API_BASE_URL}/users/${userId}/referrals`,
  },
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`,
};

export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB limit

export default API_BASE_URL;
