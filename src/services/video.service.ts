import { API_ENDPOINTS, MAX_VIDEO_SIZE } from '@twikkl/config/api';
import authService from './auth.service';
import * as FileSystem from 'expo-file-system';

export interface VideoUploadResult {
  success: boolean;
  videoUrl?: string;
  fileName?: string;
  error?: string;
}

export interface CreateVideoPostData {
  videoUrl: string;
  fileName: string;
  caption?: string;
  category?: string;
  visibility?: 'Public' | 'Followers' | 'Private';
  serverId?: string;
}

class VideoService {
  // Upload video file to backend
  async uploadVideo(videoUri: string): Promise<VideoUploadResult> {
    try {
      // Check file size using Expo FileSystem
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      
      if (!fileInfo.exists) {
        return {
          success: false,
          error: 'Video file not found',
        };
      }
      
      if (fileInfo.size && fileInfo.size > MAX_VIDEO_SIZE) {
        const sizeMB = (fileInfo.size / (1024 * 1024)).toFixed(1);
        return {
          success: false,
          error: `Video size (${sizeMB}MB) exceeds 50MB limit. Please select a smaller video.`,
        };
      }

      const formData = new FormData();
      formData.append('video', {
        uri: videoUri,
        type: 'video/mp4',
        name: 'video.mp4',
      } as any);

      const authHeader = await authService.getAuthHeader();

      const response = await fetch(API_ENDPOINTS.VIDEOS.UPLOAD, {
        method: 'POST',
        headers: {
          ...authHeader,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to upload video',
        };
      }

      return {
        success: true,
        videoUrl: data.videoUrl,
        fileName: data.fileName,
      };
    } catch (error) {
      console.error('Video upload error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Create video post
  async createVideoPost(postData: CreateVideoPostData): Promise<{ success: boolean; error?: string; video?: any }> {
    try {
      const authHeader = await authService.getAuthHeader();

      const response = await fetch(API_ENDPOINTS.VIDEOS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to create video post',
        };
      }

      return {
        success: true,
        video: data.video,
      };
    } catch (error) {
      console.error('Create video post error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  }

  // Get videos for a server
  async getServerVideos(serverId: string): Promise<any[]> {
    try {
      const response = await fetch(API_ENDPOINTS.VIDEOS.SERVER(serverId));
      const data = await response.json();
      return data.videos || [];
    } catch (error) {
      console.error('Get server videos error:', error);
      return [];
    }
  }

  // Check upload count for user in server
  async getUploadCount(serverId: string): Promise<{ count: number; uploads: any[] }> {
    try {
      const authHeader = await authService.getAuthHeader();

      const response = await fetch(API_ENDPOINTS.VIDEOS.UPLOAD_COUNT(serverId), {
        headers: authHeader,
      });

      const data = await response.json();
      return {
        count: data.count || 0,
        uploads: data.uploads || [],
      };
    } catch (error) {
      console.error('Get upload count error:', error);
      return { count: 0, uploads: [] };
    }
  }
}

export default new VideoService();
