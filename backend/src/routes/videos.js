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
    fileSize: 100 * 1024 * 1024, // 100MB limit
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

// Create video post
router.post('/create', isAuthenticated, createVideoPost);

// Get videos for a server
router.get('/server/:serverId', getServerVideos);

// Get upload count for user in a server (last 24 hours)
router.get('/server/:serverId/upload-count', isAuthenticated, getUploadCount);

module.exports = router;
