// Main Express server for Twikkl backend
import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { Client as ObjectStorageClient } from "@replit/object-storage";
import { v4 as uuidv4 } from "uuid";
import { AuthDataValidator } from "@telegram-auth/server";

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
}));

// File upload configuration with multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video and image files are allowed'));
    }
  },
});

// Initialize Replit Object Storage (lazy-loaded to handle missing bucket)
let objectStorage: ObjectStorageClient | null = null;

function getObjectStorage(): ObjectStorageClient {
  if (!objectStorage) {
    try {
      objectStorage = new ObjectStorageClient();
    } catch (error) {
      throw new Error('Object Storage not configured. Please create a bucket in the Replit Object Storage pane.');
    }
  }
  return objectStorage;
}

// Initialize routes
async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Twikkl backend is running' });
  });

  // Telegram authentication endpoint
  app.post('/api/auth/telegram', async (req: Request, res: Response) => {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      
      if (!botToken) {
        return res.status(500).json({ error: 'Telegram bot token not configured' });
      }

      const validator = new AuthDataValidator({ botToken });
      const userData = await validator.validate(req.body);
      
      // Create or update user from Telegram data
      const userId = `telegram_${userData.id}`;
      const username = userData.username || `user${userData.id}`;
      
      // Upsert user (create if doesn't exist, update if exists)
      const user = await storage.upsertUser({
        id: userId,
        email: `telegram_${userData.id}@telegram.user`,
        username: username,
        profileImageUrl: userData.photo_url,
      });

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      console.error('Telegram auth error:', error);
      res.status(401).json({ error: 'Invalid Telegram authentication data' });
    }
  });

  // Get current authenticated user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Video upload endpoint
  app.post('/api/videos/upload', isAuthenticated, upload.single('video'), async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const storagePath = `videos/${userId}/${fileName}`;

      // Upload to Replit Object Storage
      const storage = getObjectStorage();
      const uploadResult = await storage.uploadFromBytes(storagePath, file.buffer);

      if (!uploadResult.ok) {
        console.error('Upload error:', uploadResult.error);
        return res.status(500).json({ error: 'Failed to upload video to storage' });
      }

      // Generate video URL
      const videoUrl = `/api/videos/stream/${userId}/${fileName}`;

      res.json({
        success: true,
        videoUrl,
        fileName,
        fileSize: file.size,
      });
    } catch (error) {
      console.error('Video upload error:', error);
      res.status(500).json({ error: 'Failed to upload video' });
    }
  });

  // Create video post with metadata
  app.post('/api/videos/create', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { videoUrl, fileName, caption, category, visibility, serverId } = req.body;

      if (!videoUrl || !fileName) {
        return res.status(400).json({ error: 'Video URL and filename are required' });
      }

      // If serverId is provided, check upload limit (2 per 24 hours)
      if (serverId) {
        const uploadCount = await storage.getRecentUploadCount(userId, serverId, 24);
        if (uploadCount >= 2) {
          return res.status(429).json({ 
            error: 'Upload limit reached. You can only upload 2 videos per server every 24 hours.' 
          });
        }

        // Verify user is a member of the server
        const isMember = await storage.isServerMember(serverId, userId);
        if (!isMember) {
          return res.status(403).json({ error: 'You are not a member of this server' });
        }
      }

      // Create video record
      const video = await storage.createVideo({
        userId,
        serverId: serverId || null,
        fileName,
        videoUrl,
        caption: caption || null,
        category: category || null,
        visibility: visibility || 'public',
      });

      // Record upload count if in a server
      if (serverId) {
        await storage.recordUpload(userId, serverId);
      }

      res.json({ success: true, video });
    } catch (error) {
      console.error('Create video post error:', error);
      res.status(500).json({ error: 'Failed to create video post' });
    }
  });

  // Get videos for a server
  app.get('/api/videos/server/:serverId', async (req: Request, res: Response) => {
    try {
      const { serverId } = req.params;
      const videos = await storage.getServerVideos(serverId);
      res.json({ videos });
    } catch (error) {
      console.error('Get server videos error:', error);
      res.status(500).json({ error: 'Failed to fetch server videos' });
    }
  });

  // Get upload count for user in server
  app.get('/api/videos/server/:serverId/upload-count', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { serverId } = req.params;

      const count = await storage.getRecentUploadCount(userId, serverId, 24);
      const uploads = await storage.getServerVideos(serverId);
      const userUploads = uploads.filter(v => v.userId === userId);

      res.json({ count, uploads: userUploads });
    } catch (error) {
      console.error('Get upload count error:', error);
      res.status(500).json({ error: 'Failed to get upload count' });
    }
  });

  // Stream video from Object Storage
  app.get('/api/videos/stream/:userId/:fileName', async (req: Request, res: Response) => {
    try {
      const { userId, fileName } = req.params;
      const storagePath = `videos/${userId}/${fileName}`;

      const storage = getObjectStorage();
      const downloadResult = await storage.downloadAsBytes(storagePath);

      if (!downloadResult.ok) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Set appropriate headers for video streaming
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.send(downloadResult.value);
    } catch (error) {
      console.error('Video stream error:', error);
      res.status(500).json({ error: 'Failed to stream video' });
    }
  });

  // Server management endpoints
  app.post('/api/servers', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { name, description, location, hashtags, privacy } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Server name is required' });
      }

      const server = await storage.createServer({
        name,
        description: description || null,
        location: location || null,
        hashtags: hashtags || null,
        privacy: privacy || 'public',
        ownerId: userId,
      });

      // Add creator as server member with owner role
      await storage.addServerMember({
        serverId: server.id,
        userId,
        role: 'owner',
      });

      res.json({ success: true, server });
    } catch (error) {
      console.error('Create server error:', error);
      res.status(500).json({ error: 'Failed to create server' });
    }
  });

  app.get('/api/servers/:serverId', async (req: Request, res: Response) => {
    try {
      const { serverId } = req.params;
      const server = await storage.getServer(serverId);

      if (!server) {
        return res.status(404).json({ error: 'Server not found' });
      }

      res.json(server);
    } catch (error) {
      console.error('Get server error:', error);
      res.status(500).json({ error: 'Failed to fetch server' });
    }
  });

  app.get('/api/users/:userId/servers', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const servers = await storage.getUserServers(userId);
      res.json({ servers });
    } catch (error) {
      console.error('Get user servers error:', error);
      res.status(500).json({ error: 'Failed to fetch user servers' });
    }
  });

  // Referral endpoints
  app.get('/api/referrals/code/:code', async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const user = await storage.getUserByReferralCode(code);

      if (!user) {
        return res.status(404).json({ error: 'Invalid referral code' });
      }

      res.json({ 
        valid: true,
        referrerId: user.id,
        referrerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'A Twikkl user',
      });
    } catch (error) {
      console.error('Validate referral code error:', error);
      res.status(500).json({ error: 'Failed to validate referral code' });
    }
  });

  app.post('/api/referrals', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { referralCode } = req.body;

      if (!referralCode) {
        return res.status(400).json({ error: 'Referral code is required' });
      }

      const referrer = await storage.getUserByReferralCode(referralCode);

      if (!referrer) {
        return res.status(404).json({ error: 'Invalid referral code' });
      }

      if (referrer.id === userId) {
        return res.status(400).json({ error: 'You cannot refer yourself' });
      }

      // Create referral record
      const referral = await storage.createReferral({
        referrerId: referrer.id,
        referredUserId: userId,
        status: 'pending',
      });

      res.json({ success: true, referral });
    } catch (error) {
      console.error('Create referral error:', error);
      res.status(500).json({ error: 'Failed to process referral' });
    }
  });

  app.get('/api/users/:userId/referrals', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const referrals = await storage.getReferralsByReferrer(userId);
      res.json({ referrals });
    } catch (error) {
      console.error('Get referrals error:', error);
      res.status(500).json({ error: 'Failed to fetch referrals' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Start server
async function startServer() {
  try {
    const server = await registerRoutes(app);
    
    server.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`✅ Twikkl backend server running on http://0.0.0.0:${PORT}`);
      console.log(`✅ API endpoints available at /api/*`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
