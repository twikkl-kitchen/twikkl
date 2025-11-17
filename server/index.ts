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

// Helper function to get userId from either OAuth or email/password session
function getUserId(req: any): string {
  return req.user?.claims?.sub || req.user?.id;
}

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - restricts origins in production for security
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (origin, callback) => {
        // Allow requests from your published Replit domain and localhost for development
        const allowedOrigins = [
          process.env.REPLIT_DOMAINS?.split(',')[0] ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : '',
          'http://localhost:5000',
          'https://localhost:5000',
        ].filter(Boolean);
        
        if (!origin || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    : true, // Allow all origins in development
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

  // Email/Password Registration endpoint
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, confirmPassword } = req.body;

      if (!email || !password || !confirmPassword) {
        return res.status(400).json({ error: 'Email, password, and confirmPassword are required' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      const generateReferralCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      const user = await storage.upsertUser({
        email,
        password: hashedPassword,
        referralCode: generateReferralCode(),
      });

      (req as any).login({ id: user.id }, (err: any) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to create session' });
        }

        res.json({
          success: true,
          message: 'Registration successful',
          data: {
            id: user.id,
            email: user.email,
            username: user.username,
            profileImageUrl: user.profileImageUrl,
          },
          token: 'session',
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Email/Password Login endpoint
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      (req as any).login({ id: user.id }, (err: any) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to create session' });
        }

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            id: user.id,
            email: user.email,
            username: user.username,
            profileImageUrl: user.profileImageUrl,
          },
          token: 'session',
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
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

  // Create username endpoint
  app.post('/api/auth/create-username', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = getUserId(req);
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return res.status(400).json({ 
          error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' 
        });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Update user with username
      const user = await storage.updateUser(userId, { username });
      
      res.json({ 
        success: true,
        message: 'Username created successfully',
        user 
      });
    } catch (error: any) {
      console.error("Error creating username:", error);
      
      // Handle unique constraint violation at DB level
      if (error.message && error.message.includes('unique constraint')) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      
      res.status(500).json({ error: "Failed to create username" });
    }
  });

  // Logout endpoint
  app.post('/api/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Failed to logout' });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
        res.json({ success: true, message: 'Logged out successfully' });
      });
    });
  });

  // Get current authenticated user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get any user's profile (public data)
  app.get('/api/users/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return public profile data (exclude password)
      const { password, ...publicProfile } = user;
      res.json(publicProfile);
    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  // Update user profile
  app.put('/api/users/:userId', isAuthenticated, async (req: any, res: Response) => {
    try {
      const requestUserId = getUserId(req);
      const { userId } = req.params;

      // Users can only update their own profile
      if (requestUserId !== userId) {
        return res.status(403).json({ error: 'You can only update your own profile' });
      }

      const { displayName, bio, firstName, lastName } = req.body;
      
      const updateData: any = {};
      if (displayName !== undefined) updateData.displayName = displayName;
      if (bio !== undefined) updateData.bio = bio;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;

      const user = await storage.updateUser(userId, updateData);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Upload profile image
  app.post('/api/users/upload-profile-image', isAuthenticated, upload.single('image'), async (req: any, res: Response) => {
    try {
      const userId = getUserId(req);
      
      if (!userId) {
        console.error('No userId found in request');
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const file = req.file;

      if (!file) {
        console.error('No file in request. Body:', req.body);
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Validate image type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'File must be an image' });
      }

      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `profile_${userId}_${uuidv4()}.${fileExtension}`;
      const storagePath = `profile-images/${fileName}`;

      // Upload to Replit Object Storage
      const objectStorage = getObjectStorage();
      const uploadResult = await objectStorage.uploadFromBytes(storagePath, file.buffer);

      if (!uploadResult.ok) {
        console.error('Upload error:', uploadResult.error);
        return res.status(500).json({ error: 'Failed to upload image to storage' });
      }

      // Generate image URL
      const imageUrl = `/api/images/profile/${fileName}`;

      // Update user's profile image URL
      await storage.updateUser(userId, { profileImageUrl: imageUrl });

      res.json({
        success: true,
        imageUrl,
        message: 'Profile image uploaded successfully'
      });
    } catch (error) {
      console.error('Profile image upload error:', error);
      res.status(500).json({ error: 'Failed to upload profile image' });
    }
  });

  // Upload banner image
  app.post('/api/users/upload-banner', isAuthenticated, upload.single('image'), async (req: any, res: Response) => {
    try {
      const userId = getUserId(req);
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Validate image type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'File must be an image' });
      }

      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `banner_${userId}_${uuidv4()}.${fileExtension}`;
      const storagePath = `banner-images/${fileName}`;

      // Upload to Replit Object Storage
      const objectStorage = getObjectStorage();
      const uploadResult = await objectStorage.uploadFromBytes(storagePath, file.buffer);

      if (!uploadResult.ok) {
        console.error('Upload error:', uploadResult.error);
        return res.status(500).json({ error: 'Failed to upload image to storage' });
      }

      // Generate image URL
      const imageUrl = `/api/images/banner/${fileName}`;

      // Update user's banner image URL
      await storage.updateUser(userId, { bannerImageUrl: imageUrl });

      res.json({
        success: true,
        imageUrl,
        message: 'Banner image uploaded successfully'
      });
    } catch (error) {
      console.error('Banner image upload error:', error);
      res.status(500).json({ error: 'Failed to upload banner image' });
    }
  });

  // Serve profile images
  app.get('/api/images/profile/:fileName', async (req: Request, res: Response) => {
    try {
      const { fileName } = req.params;
      const storagePath = `profile-images/${fileName}`;

      const objectStorage = getObjectStorage();
      const result = await objectStorage.downloadAsBytes(storagePath);

      if (!result.ok) {
        return res.status(404).json({ error: 'Image not found' });
      }

      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(result.value);
    } catch (error) {
      console.error('Serve profile image error:', error);
      res.status(500).json({ error: 'Failed to serve image' });
    }
  });

  // Serve banner images
  app.get('/api/images/banner/:fileName', async (req: Request, res: Response) => {
    try {
      const { fileName } = req.params;
      const storagePath = `banner-images/${fileName}`;

      const objectStorage = getObjectStorage();
      const result = await objectStorage.downloadAsBytes(storagePath);

      if (!result.ok) {
        return res.status(404).json({ error: 'Image not found' });
      }

      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(result.value);
    } catch (error) {
      console.error('Serve banner image error:', error);
      res.status(500).json({ error: 'Failed to serve image' });
    }
  });

  // Video upload endpoint
  app.post('/api/videos/upload', isAuthenticated, upload.single('video'), async (req: any, res: Response) => {
    try {
      const userId = getUserId(req);
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
      const userId = getUserId(req);
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

        // Validate category against server's custom categories
        if (category) {
          const server = await storage.getServer(serverId);
          const validCategories = server?.categories 
            ? JSON.parse(server.categories)
            : ['Tutorial', 'Trading', 'Development', 'General', 'News'];
          
          if (!validCategories.includes(category)) {
            return res.status(400).json({ 
              error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
            });
          }
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
      const userId = getUserId(req);
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
  // GET all servers or filter by type
  app.get('/api/servers', async (req: any, res: Response) => {
    try {
      const { type } = req.query;
      const userId = req.session?.userId || req.session?.user?.id;

      if (type === 'joined' && userId) {
        // Get servers the user has joined
        const servers = await storage.getUserServers(userId);
        return res.json({ servers });
      } else if (type === 'favorites' && userId) {
        // Get favorited servers (we'll implement this later)
        // For now, return empty array
        return res.json({ servers: [] });
      } else {
        // Get all public servers
        const allServers = await storage.getAllServers();
        return res.json({ servers: allServers });
      }
    } catch (error) {
      console.error('Get servers error:', error);
      res.status(500).json({ error: 'Failed to fetch servers' });
    }
  });

  app.post('/api/servers', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = getUserId(req);
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

      // Get member count
      const members = await storage.getServerMembers(serverId);
      const memberCount = members.length;

      res.json({ ...server, memberCount });
    } catch (error) {
      console.error('Get server error:', error);
      res.status(500).json({ error: 'Failed to fetch server' });
    }
  });

  // Check if user is admin of a server
  app.get('/api/servers/:serverId/is-admin', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = getUserId(req);
      const { serverId } = req.params;

      const isAdmin = await storage.isServerAdmin(serverId, userId);
      res.json({ isAdmin });
    } catch (error) {
      console.error('Check admin status error:', error);
      res.status(500).json({ error: 'Failed to check admin status' });
    }
  });

  // Update server settings
  app.put('/api/servers/:serverId', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = getUserId(req);
      const { serverId } = req.params;
      const { name, description, location, hashtags, privacy } = req.body;

      // Check if user is admin
      const isAdmin = await storage.isServerAdmin(serverId, userId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only server admins can update server settings' });
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (location !== undefined) updateData.location = location;
      if (hashtags !== undefined) updateData.hashtags = hashtags;
      if (privacy !== undefined) updateData.privacy = privacy;

      const server = await storage.updateServer(serverId, updateData);

      res.json({
        success: true,
        message: 'Server updated successfully',
        server
      });
    } catch (error) {
      console.error('Update server error:', error);
      res.status(500).json({ error: 'Failed to update server' });
    }
  });

  // Upload server profile image
  app.post('/api/servers/:serverId/upload-profile-image', isAuthenticated, upload.single('image'), async (req: any, res: Response) => {
    try {
      const userId = getUserId(req);
      const { serverId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Check if user is admin
      const isAdmin = await storage.isServerAdmin(serverId, userId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only server admins can update server images' });
      }

      // Validate image type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'File must be an image' });
      }

      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `server_profile_${serverId}_${uuidv4()}.${fileExtension}`;
      const storagePath = `server-images/${fileName}`;

      // Upload to Replit Object Storage
      const objectStorage = getObjectStorage();
      const uploadResult = await objectStorage.uploadFromBytes(storagePath, file.buffer);

      if (!uploadResult.ok) {
        console.error('Upload error:', uploadResult.error);
        return res.status(500).json({ error: 'Failed to upload image to storage' });
      }

      // Generate image URL
      const imageUrl = `/api/images/server/${fileName}`;

      // Update server's profile image URL
      await storage.updateServer(serverId, { profileImageUrl: imageUrl });

      res.json({
        success: true,
        imageUrl,
        message: 'Server profile image uploaded successfully'
      });
    } catch (error) {
      console.error('Server profile image upload error:', error);
      res.status(500).json({ error: 'Failed to upload server profile image' });
    }
  });

  // Get server categories
  app.get('/api/servers/:serverId/categories', async (req: Request, res: Response) => {
    try {
      const { serverId } = req.params;
      const server = await storage.getServer(serverId);

      if (!server) {
        return res.status(404).json({ error: 'Server not found' });
      }

      const categories = server.categories ? JSON.parse(server.categories) : [];
      res.json({ categories });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  // Update server categories
  app.put('/api/servers/:serverId/categories', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = getUserId(req);
      const { serverId } = req.params;
      const { categories } = req.body;

      // Check if user is admin
      const isAdmin = await storage.isServerAdmin(serverId, userId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only server admins can update categories' });
      }

      if (!Array.isArray(categories)) {
        return res.status(400).json({ error: 'Categories must be an array' });
      }

      // Validate categories
      if (categories.length === 0) {
        return res.status(400).json({ error: 'Categories cannot be empty' });
      }

      // Update server categories
      const categoriesJson = JSON.stringify(categories);
      await storage.updateServer(serverId, { categories: categoriesJson });

      res.json({
        success: true,
        message: 'Categories updated successfully',
        categories
      });
    } catch (error) {
      console.error('Update categories error:', error);
      res.status(500).json({ error: 'Failed to update categories' });
    }
  });

  // Get server admins
  app.get('/api/servers/:serverId/admins', async (req: Request, res: Response) => {
    try {
      const { serverId } = req.params;
      const members = await storage.getServerMembers(serverId);

      // Filter for admins and owners only
      const admins = members.filter(m => m.role === 'admin' || m.role === 'owner');

      // Get user details for each admin
      const adminsWithDetails = await Promise.all(
        admins.map(async (admin) => {
          const user = await storage.getUser(admin.userId);
          return {
            userId: admin.userId,
            username: user?.username,
            email: user?.email,
            role: admin.role
          };
        })
      );

      res.json({ admins: adminsWithDetails });
    } catch (error) {
      console.error('Get admins error:', error);
      res.status(500).json({ error: 'Failed to fetch admins' });
    }
  });

  // Add admin to server
  app.post('/api/servers/:serverId/admins', isAuthenticated, async (req: any, res: Response) => {
    try {
      const currentUserId = getUserId(req);
      const { serverId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Check if current user is admin
      const isAdmin = await storage.isServerAdmin(serverId, currentUserId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only server admins can add admins' });
      }

      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user is already a member
      const isMember = await storage.isServerMember(serverId, userId);
      if (!isMember) {
        // Add as member first
        await storage.addServerMember({
          serverId,
          userId,
          role: 'admin',
        });
      } else {
        // Update existing member to admin
        await storage.updateServerMemberRole(serverId, userId, 'admin');
      }

      res.json({
        success: true,
        message: 'Admin added successfully'
      });
    } catch (error) {
      console.error('Add admin error:', error);
      res.status(500).json({ error: 'Failed to add admin' });
    }
  });

  // Remove admin from server
  app.delete('/api/servers/:serverId/admins/:userId', isAuthenticated, async (req: any, res: Response) => {
    try {
      const currentUserId = getUserId(req);
      const { serverId, userId } = req.params;

      // Check if current user is admin
      const isAdmin = await storage.isServerAdmin(serverId, currentUserId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only server admins can remove admins' });
      }

      // Get the member to check if they're the owner
      const members = await storage.getServerMembers(serverId);
      const targetMember = members.find(m => m.userId === userId);

      if (!targetMember) {
        return res.status(404).json({ error: 'User is not a member of this server' });
      }

      if (targetMember.role === 'owner') {
        return res.status(403).json({ error: 'Cannot remove the server owner' });
      }

      // Update role to member instead of removing
      await storage.updateServerMemberRole(serverId, userId, 'member');

      res.json({
        success: true,
        message: 'Admin removed successfully'
      });
    } catch (error) {
      console.error('Remove admin error:', error);
      res.status(500).json({ error: 'Failed to remove admin' });
    }
  });

  // Upload server banner image
  app.post('/api/servers/:serverId/upload-banner', isAuthenticated, upload.single('image'), async (req: any, res: Response) => {
    try {
      const userId = getUserId(req);
      const { serverId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Check if user is admin
      const isAdmin = await storage.isServerAdmin(serverId, userId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only server admins can update server images' });
      }

      // Validate image type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'File must be an image' });
      }

      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `server_banner_${serverId}_${uuidv4()}.${fileExtension}`;
      const storagePath = `server-images/${fileName}`;

      // Upload to Replit Object Storage
      const objectStorage = getObjectStorage();
      const uploadResult = await objectStorage.uploadFromBytes(storagePath, file.buffer);

      if (!uploadResult.ok) {
        console.error('Upload error:', uploadResult.error);
        return res.status(500).json({ error: 'Failed to upload image to storage' });
      }

      // Generate image URL
      const imageUrl = `/api/images/server/${fileName}`;

      // Update server's banner image URL
      await storage.updateServer(serverId, { bannerImageUrl: imageUrl });

      res.json({
        success: true,
        imageUrl,
        message: 'Server banner image uploaded successfully'
      });
    } catch (error) {
      console.error('Server banner image upload error:', error);
      res.status(500).json({ error: 'Failed to upload server banner image' });
    }
  });

  // Serve server images
  app.get('/api/images/server/:fileName', async (req: Request, res: Response) => {
    try {
      const { fileName } = req.params;
      const storagePath = `server-images/${fileName}`;

      const objectStorage = getObjectStorage();
      const downloadResult = await objectStorage.downloadAsBytes(storagePath);

      if (!downloadResult.ok) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Determine content type from filename
      const ext = fileName.split('.').pop()?.toLowerCase();
      const contentType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/jpeg';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(downloadResult.value);
    } catch (error) {
      console.error('Serve server image error:', error);
      res.status(500).json({ error: 'Failed to serve image' });
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
      const userId = getUserId(req);
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
      
      // Get user to get their referral code
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get all referrals for this user
      const referrals = await storage.getReferralsByReferrer(userId);
      
      // Get details for each referred user
      const referralDetails = await Promise.all(
        referrals.map(async (referral) => {
          const referredUser = await storage.getUser(referral.referredUserId);
          return {
            id: referral.id,
            referredUsername: referredUser?.username || 'Unknown',
            createdAt: referral.createdAt,
          };
        })
      );

      res.json({
        referralCode: user.referralCode,
        totalReferrals: referrals.length,
        referrals: referralDetails,
      });
    } catch (error) {
      console.error('Get referrals error:', error);
      res.status(500).json({ error: 'Failed to fetch referrals' });
    }
  });

  // ===== COMMENT ENDPOINTS =====
  
  // Create comment on video
  app.post('/api/comments', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = getUserId(req);
      const { videoId, content } = req.body;

      if (!videoId || !content) {
        return res.status(400).json({ error: 'Video ID and content are required' });
      }

      const comment = await storage.createComment({ videoId, userId, content });
      res.json({ success: true, comment });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  });

  // Get comments for a video
  app.get('/api/videos/:videoId/comments', async (req: Request, res: Response) => {
    try {
      const { videoId } = req.params;
      const comments = await storage.getVideoComments(videoId);
      res.json({ comments });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

  // Delete comment
  app.delete('/api/comments/:commentId', isAuthenticated, async (req: any, res: Response) => {
    try {
      const { commentId } = req.params;
      await storage.deleteComment(commentId);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  });

  // ===== LIKE ENDPOINTS =====
  
  // Toggle like on video
  app.post('/api/videos/:videoId/like', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = getUserId(req);
      const { videoId } = req.params;

      const result = await storage.toggleLike(videoId, userId);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Toggle like error:', error);
      res.status(500).json({ error: 'Failed to toggle like' });
    }
  });

  // Check if video is liked by user
  app.get('/api/videos/:videoId/liked', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = getUserId(req);
      const { videoId } = req.params;

      const liked = await storage.isVideoLiked(videoId, userId);
      res.json({ liked });
    } catch (error) {
      console.error('Check like error:', error);
      res.status(500).json({ error: 'Failed to check like status' });
    }
  });

  // Get like count for video
  app.get('/api/videos/:videoId/likes', async (req: Request, res: Response) => {
    try {
      const { videoId } = req.params;
      const likeCount = await storage.getVideoLikeCount(videoId);
      res.json({ likeCount });
    } catch (error) {
      console.error('Get like count error:', error);
      res.status(500).json({ error: 'Failed to get like count' });
    }
  });

  // ===== FOLLOW ENDPOINTS =====
  
  // Follow a user
  app.post('/api/users/:userId/follow', isAuthenticated, async (req: any, res: Response) => {
    try {
      const followerId = getUserId(req);
      const { userId: followingId } = req.params;

      if (followerId === followingId) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
      }

      const follow = await storage.followUser(followerId, followingId);
      res.json({ success: true, follow });
    } catch (error) {
      console.error('Follow user error:', error);
      res.status(500).json({ error: 'Failed to follow user' });
    }
  });

  // Unfollow a user
  app.delete('/api/users/:userId/follow', isAuthenticated, async (req: any, res: Response) => {
    try {
      const followerId = getUserId(req);
      const { userId: followingId } = req.params;

      await storage.unfollowUser(followerId, followingId);
      res.json({ success: true });
    } catch (error) {
      console.error('Unfollow user error:', error);
      res.status(500).json({ error: 'Failed to unfollow user' });
    }
  });

  // Check if following a user
  app.get('/api/users/:userId/following', isAuthenticated, async (req: any, res: Response) => {
    try {
      const followerId = getUserId(req);
      const { userId: followingId } = req.params;

      const isFollowing = await storage.isFollowing(followerId, followingId);
      res.json({ isFollowing });
    } catch (error) {
      console.error('Check following error:', error);
      res.status(500).json({ error: 'Failed to check following status' });
    }
  });

  // Get user's followers
  app.get('/api/users/:userId/followers', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const followers = await storage.getFollowers(userId);
      const followerCount = await storage.getFollowerCount(userId);
      res.json({ followers, followerCount });
    } catch (error) {
      console.error('Get followers error:', error);
      res.status(500).json({ error: 'Failed to fetch followers' });
    }
  });

  // Get users that user is following
  app.get('/api/users/:userId/following-list', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const following = await storage.getFollowing(userId);
      const followingCount = await storage.getFollowingCount(userId);
      res.json({ following, followingCount });
    } catch (error) {
      console.error('Get following list error:', error);
      res.status(500).json({ error: 'Failed to fetch following list' });
    }
  });

  // ===== VIDEO VIEW ENDPOINTS =====
  
  // Record video view
  app.post('/api/videos/:videoId/view', async (req: any, res: Response) => {
    try {
      const { videoId } = req.params;
      const { watchDuration, completed } = req.body;
      const userId = req.user?.claims?.sub || null; // Allow anonymous views

      const view = await storage.recordView({
        videoId,
        userId,
        watchDuration: watchDuration || 0,
        completed: completed || false,
      });

      res.json({ success: true, view });
    } catch (error) {
      console.error('Record view error:', error);
      res.status(500).json({ error: 'Failed to record view' });
    }
  });

  // Get video view count
  app.get('/api/videos/:videoId/views', async (req: Request, res: Response) => {
    try {
      const { videoId } = req.params;
      const viewCount = await storage.getVideoViewCount(videoId);
      res.json({ viewCount });
    } catch (error) {
      console.error('Get view count error:', error);
      res.status(500).json({ error: 'Failed to get view count' });
    }
  });

  // ===== SEARCH ENDPOINTS =====
  
  // Search videos
  app.get('/api/search/videos', async (req: Request, res: Response) => {
    try {
      const { q: query, limit } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const videos = await storage.searchVideos(query, limit ? parseInt(limit as string) : 20);
      res.json({ videos });
    } catch (error) {
      console.error('Search videos error:', error);
      res.status(500).json({ error: 'Failed to search videos' });
    }
  });

  // Search servers
  app.get('/api/search/servers', async (req: Request, res: Response) => {
    try {
      const { q: query, limit } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const servers = await storage.searchServers(query, limit ? parseInt(limit as string) : 20);
      res.json({ servers });
    } catch (error) {
      console.error('Search servers error:', error);
      res.status(500).json({ error: 'Failed to search servers' });
    }
  });

  // Search users
  app.get('/api/search/users', async (req: Request, res: Response) => {
    try {
      const { q: query, limit } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const users = await storage.searchUsers(query, limit ? parseInt(limit as string) : 20);
      res.json({ users });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  });

  // ===== FOLLOWING FEED ENDPOINT =====
  
  // Get videos from users you follow
  app.get('/api/feed/following', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = getUserId(req);
      const { limit } = req.query;

      const videos = await storage.getFollowingFeed(userId, limit ? parseInt(limit as string) : 50);
      res.json({ videos });
    } catch (error) {
      console.error('Get following feed error:', error);
      res.status(500).json({ error: 'Failed to fetch following feed' });
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
