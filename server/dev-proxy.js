// Development proxy server
// Runs on port 5000, forwards /api/* to backend on port 3001
// Serves frontend for all other requests

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');

const app = express();
const PORT = 5000;

// Increase body size limits for large file uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

console.log('🚀 Starting development proxy server...\n');

// Start backend server on port 3001
const backend = spawn('sh', ['-c', 'PORT=3001 npm run server'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: 3001 },
});

// Start frontend server on port 8081
const frontend = spawn('sh', ['-c', 'EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 npx expo start --web --port 8081'], {
  stdio: 'inherit',
});

// Proxy /api/* requests to backend on port 3001  
// This MUST come before the frontend proxy to ensure API requests are handled first
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  logLevel: 'info',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`✅ [API PROXY] ${req.method} ${req.url} -> http://localhost:3001${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ [API RESPONSE] ${proxyRes.statusCode} for ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`❌ [API PROXY ERROR] ${req.url}:`, err.message);
    res.status(502).json({ error: 'API proxy error', message: err.message });
  },
}));

// Proxy all other requests to frontend on port 8081
app.use('/', createProxyMiddleware({
  target: 'http://localhost:8081',
  changeOrigin: true,
  ws: true, // Enable WebSocket proxy for HMR
  logLevel: 'silent', // Reduce noise
  onProxyReq: (proxyReq, req, res) => {
    // Only log non-asset requests to reduce noise
    if (!req.url.includes('.') && !req.url.includes('_next') && !req.url.includes('hot-update')) {
      console.log(`[FRONTEND] ${req.method} ${req.url}`);
    }
  },
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Development proxy server running on http://0.0.0.0:${PORT}`);
  console.log(`   - Frontend (Expo): http://localhost:8081 → proxied to :${PORT}`);
  console.log(`   - Backend (API): http://localhost:3001 → proxied to :${PORT}/api`);
  console.log(`   - Access your app at: http://localhost:${PORT}\n`);
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down proxy server...');
  backend.kill();
  frontend.kill();
  process.exit();
});
