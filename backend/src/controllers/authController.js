const { generateToken } = require('../middleware/auth');

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle Google OAuth callback
const googleCallback = (req, res) => {
  try {
    const token = generateToken(req.user);
    
    // Redirect to mobile app with token
    // For React Native, we'll use a custom deep link
    const redirectUrl = `twikkl://auth?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`;
    
    // For web testing, send JSON response
    if (req.query.mode === 'web') {
      return res.json({ 
        success: true, 
        token, 
        user: req.user 
      });
    }
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Logout
const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
};

module.exports = {
  getCurrentUser,
  googleCallback,
  logout
};
