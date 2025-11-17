// API Configuration
// Use relative URLs - proxy handles routing
export const API_BASE_URL = '';

export const API_ENDPOINTS = {
  // Auth endpoints (Replit Auth)
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/logout`,
    ME: `${API_BASE_URL}/api/auth/user`,
    GOOGLE: `${API_BASE_URL}/login`,
  },
  
  // Video endpoints
  VIDEOS: {
    UPLOAD: `${API_BASE_URL}/api/videos/upload`,
    CREATE: `${API_BASE_URL}/api/videos/create`,
    SERVER: (serverId: string) => `${API_BASE_URL}/api/videos/server/${serverId}`,
    UPLOAD_COUNT: (serverId: string) => `${API_BASE_URL}/api/videos/server/${serverId}/upload-count`,
    STREAM: (userId: string, fileName: string) => `${API_BASE_URL}/api/videos/stream/${userId}/${fileName}`,
  },

  // Server endpoints
  SERVERS: {
    CREATE: `${API_BASE_URL}/api/servers`,
    GET: (serverId: string) => `${API_BASE_URL}/api/servers/${serverId}`,
    USER_SERVERS: (userId: string) => `${API_BASE_URL}/api/users/${userId}/servers`,
    CATEGORIES: (serverId: string) => `${API_BASE_URL}/api/servers/${serverId}/categories`,
    IS_ADMIN: (serverId: string) => `${API_BASE_URL}/api/servers/${serverId}/is-admin`,
    ADMINS: (serverId: string) => `${API_BASE_URL}/api/servers/${serverId}/admins`,
    ADD_ADMIN: (serverId: string) => `${API_BASE_URL}/api/servers/${serverId}/admins`,
    REMOVE_ADMIN: (serverId: string, userId: string) => `${API_BASE_URL}/api/servers/${serverId}/admins/${userId}`,
    VIDEOS: (serverId: string) => `${API_BASE_URL}/api/servers/${serverId}/videos`,
    UPLOAD_VIDEO: (serverId: string) => `${API_BASE_URL}/api/servers/${serverId}/videos`,
  },

  // Referral endpoints
  REFERRALS: {
    VALIDATE: (code: string) => `${API_BASE_URL}/api/referrals/code/${code}`,
    CREATE: `${API_BASE_URL}/api/referrals`,
    GET_USER_REFERRALS: (userId: string) => `${API_BASE_URL}/api/users/${userId}/referrals`,
  },

  // Comment endpoints
  COMMENTS: {
    CREATE: `${API_BASE_URL}/api/comments`,
    GET_VIDEO_COMMENTS: (videoId: string) => `${API_BASE_URL}/api/videos/${videoId}/comments`,
    DELETE: (commentId: string) => `${API_BASE_URL}/api/comments/${commentId}`,
  },

  // Like endpoints
  LIKES: {
    TOGGLE: (videoId: string) => `${API_BASE_URL}/api/videos/${videoId}/like`,
    IS_LIKED: (videoId: string) => `${API_BASE_URL}/api/videos/${videoId}/liked`,
    GET_COUNT: (videoId: string) => `${API_BASE_URL}/api/videos/${videoId}/likes`,
  },

  // User profile endpoints
  USERS: {
    GET_PROFILE: (userId: string) => `${API_BASE_URL}/api/users/${userId}`,
    UPDATE_PROFILE: (userId: string) => `${API_BASE_URL}/api/users/${userId}`,
    UPLOAD_PROFILE_IMAGE: `${API_BASE_URL}/api/users/upload-profile-image`,
    UPLOAD_BANNER: `${API_BASE_URL}/api/users/upload-banner`,
  },

  // Follow endpoints
  FOLLOWS: {
    FOLLOW_USER: (userId: string) => `${API_BASE_URL}/api/users/${userId}/follow`,
    UNFOLLOW_USER: (userId: string) => `${API_BASE_URL}/api/users/${userId}/follow`,
    IS_FOLLOWING: (userId: string) => `${API_BASE_URL}/api/users/${userId}/following`,
    GET_FOLLOWERS: (userId: string) => `${API_BASE_URL}/api/users/${userId}/followers`,
    GET_FOLLOWING: (userId: string) => `${API_BASE_URL}/api/users/${userId}/following-list`,
  },

  // View tracking endpoints
  VIEWS: {
    RECORD: (videoId: string) => `${API_BASE_URL}/api/videos/${videoId}/view`,
    GET_COUNT: (videoId: string) => `${API_BASE_URL}/api/videos/${videoId}/views`,
  },

  // Search endpoints
  SEARCH: {
    VIDEOS: `${API_BASE_URL}/api/search/videos`,
    SERVERS: `${API_BASE_URL}/api/search/servers`,
    USERS: `${API_BASE_URL}/api/search/users`,
  },

  // Feed endpoints
  FEED: {
    FOLLOWING: `${API_BASE_URL}/api/feed/following`,
  },
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`,
};

export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB limit

export default API_BASE_URL;
