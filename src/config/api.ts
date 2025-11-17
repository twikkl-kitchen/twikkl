// API Configuration
// Use relative URLs for all environments
// In Replit, the backend proxy handles routing /api/* to port 3001
export const API_BASE_URL = '';

export const API_ENDPOINTS = {
  // Auth endpoints (Replit Auth)
  AUTH: {
    LOGIN: `${API_BASE_URL}/login`,
    LOGOUT: `${API_BASE_URL}/logout`,
    ME: `${API_BASE_URL}/auth/user`,
    GOOGLE: `${API_BASE_URL}/login`,
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
    CATEGORIES: (serverId: string) => `${API_BASE_URL}/servers/${serverId}/categories`,
    IS_ADMIN: (serverId: string) => `${API_BASE_URL}/servers/${serverId}/is-admin`,
    ADMINS: (serverId: string) => `${API_BASE_URL}/servers/${serverId}/admins`,
    ADD_ADMIN: (serverId: string) => `${API_BASE_URL}/servers/${serverId}/admins`,
    REMOVE_ADMIN: (serverId: string, userId: string) => `${API_BASE_URL}/servers/${serverId}/admins/${userId}`,
  },

  // Referral endpoints
  REFERRALS: {
    VALIDATE: (code: string) => `${API_BASE_URL}/referrals/code/${code}`,
    CREATE: `${API_BASE_URL}/referrals`,
    USER_REFERRALS: (userId: string) => `${API_BASE_URL}/users/${userId}/referrals`,
  },

  // Comment endpoints
  COMMENTS: {
    CREATE: `${API_BASE_URL}/comments`,
    GET_VIDEO_COMMENTS: (videoId: string) => `${API_BASE_URL}/videos/${videoId}/comments`,
    DELETE: (commentId: string) => `${API_BASE_URL}/comments/${commentId}`,
  },

  // Like endpoints
  LIKES: {
    TOGGLE: (videoId: string) => `${API_BASE_URL}/videos/${videoId}/like`,
    IS_LIKED: (videoId: string) => `${API_BASE_URL}/videos/${videoId}/liked`,
    GET_COUNT: (videoId: string) => `${API_BASE_URL}/videos/${videoId}/likes`,
  },

  // User profile endpoints
  USERS: {
    GET_PROFILE: (userId: string) => `${API_BASE_URL}/users/${userId}`,
    UPDATE_PROFILE: (userId: string) => `${API_BASE_URL}/users/${userId}`,
    UPLOAD_PROFILE_IMAGE: `${API_BASE_URL}/users/upload-profile-image`,
    UPLOAD_BANNER: `${API_BASE_URL}/users/upload-banner`,
  },

  // Follow endpoints
  FOLLOWS: {
    FOLLOW_USER: (userId: string) => `${API_BASE_URL}/users/${userId}/follow`,
    UNFOLLOW_USER: (userId: string) => `${API_BASE_URL}/users/${userId}/follow`,
    IS_FOLLOWING: (userId: string) => `${API_BASE_URL}/users/${userId}/following`,
    GET_FOLLOWERS: (userId: string) => `${API_BASE_URL}/users/${userId}/followers`,
    GET_FOLLOWING: (userId: string) => `${API_BASE_URL}/users/${userId}/following-list`,
  },

  // View tracking endpoints
  VIEWS: {
    RECORD: (videoId: string) => `${API_BASE_URL}/videos/${videoId}/view`,
    GET_COUNT: (videoId: string) => `${API_BASE_URL}/videos/${videoId}/views`,
  },

  // Search endpoints
  SEARCH: {
    VIDEOS: `${API_BASE_URL}/search/videos`,
    SERVERS: `${API_BASE_URL}/search/servers`,
    USERS: `${API_BASE_URL}/search/users`,
  },

  // Feed endpoints
  FEED: {
    FOLLOWING: `${API_BASE_URL}/feed/following`,
  },
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`,
};

export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB limit

export default API_BASE_URL;
