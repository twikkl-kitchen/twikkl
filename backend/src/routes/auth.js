const express = require('express');
const passport = require('passport');
const { getCurrentUser, googleCallback, logout } = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/failure' }),
  googleCallback
);

// Get current user
router.get('/me', isAuthenticated, getCurrentUser);

// Logout
router.post('/logout', logout);

// Auth failure
router.get('/failure', (req, res) => {
  res.status(401).json({ error: 'Authentication failed' });
});

module.exports = router;
