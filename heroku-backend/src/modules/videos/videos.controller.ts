import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from './videos.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post('upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('video', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('video/')) {
          return cb(new BadRequestException('Only video files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { serverId?: string },
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No video file provided');
    }

    const result = await this.videosService.uploadVideo(
      file,
      req.user.sub, // User ID from JWT
      body.serverId,
    );

    return {
      success: true,
      video: result,
    };
  }

  @Get('server/:serverId')
  @UseGuards(AuthGuard)
  async getServerVideos(@Param('serverId') serverId: string) {
    const videos = await this.videosService.getServerVideos(serverId);
    return { videos };
  }

  @Get('server/:serverId/upload-count')
  @UseGuards(AuthGuard)
  async getUploadCount(@Param('serverId') serverId: string, @Request() req) {
    const count = await this.videosService.getUploadCount(serverId, req.user.sub);
    return count;
  }
}
