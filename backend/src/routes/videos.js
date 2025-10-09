const express = require('express');
const multer = require('multer');
const {
  uploadVideo,
  createVideoPost,
  getServerVideos,
  getUploadCount
} = require('../controllers/videoController');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (Supabase free tier)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

// Upload video to Supabase Storage
router.post('/upload', isAuthenticated, upload.single('video'), uploadVideo);

// Handle multer errors (file size, etc.)
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: 'Video file is too large. Maximum size is 50MB.' 
      });
    }
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

// Create video post
router.post('/create', isAuthenticated, createVideoPost);

// Get videos for a server
router.get('/server/:serverId', getServerVideos);

// Get upload count for user in a server (last 24 hours)
router.get('/server/:serverId/upload-count', isAuthenticated, getUploadCount);

module.exports = router;
