import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class VideosService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
    );
  }

  async uploadVideo(file: Express.Multer.File, userId: string, serverId?: string) {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await this.supabase.storage
      .from('videos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: publicUrl } = this.supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    return {
      url: publicUrl.publicUrl,
      path: fileName,
      size: file.size,
      serverId,
    };
  }

  async getServerVideos(serverId: string) {
    // This would query your database for videos by server
    // Placeholder implementation
    return [];
  }

  async getUploadCount(serverId: string, userId: string) {
    // Check upload count in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // This would query your database
    // Placeholder implementation
    return { count: 0, limit: 2 };
  }
}
