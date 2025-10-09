const { generateToken } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // If user comes from JWT, fetch full profile from database
    if (req.user.id && !req.user.created_at) {
      const { data: fullUser, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ error: 'Failed to fetch user data' });
      }
      
      return res.json({ user: fullUser });
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
    
    // Send HTML page that redirects to deep link (for WebView)
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #000;
              color: #fff;
            }
            .container {
              text-align: center;
            }
            .spinner {
              border: 4px solid rgba(255, 255, 255, 0.1);
              border-radius: 50%;
              border-top: 4px solid #50A040;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <p>Redirecting to app...</p>
          </div>
          <script>
            window.location.href = "${redirectUrl}";
          </script>
        </body>
      </html>
    `);
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
