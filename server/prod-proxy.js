// Production proxy server
// Runs on port 5000, forwards /api/* to backend on port 3001
// Serves frontend for all other requests

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting production proxy server...\n');

// Start backend server on port 3001
const backend = spawn('sh', ['-c', 'PORT=3001 npm run server'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: 3001, NODE_ENV: 'production' },
});

// Start frontend server on port 8081 in production mode (no dev tools)
const frontend = spawn('sh', ['-c', 'EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 npx expo start --web --port 8081 --no-dev'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' },
});

// Proxy /api/* requests to backend on port 3001  
// Use filter function to only catch /api paths
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  filter: (pathname, req) => pathname.startsWith('/api'),
  logLevel: 'silent',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`✅ [API] ${req.method} ${req.url} -> http://localhost:3001${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`❌ [API ERROR] ${req.url}:`, err.message);
    res.status(502).json({ error: 'API proxy error', message: err.message });
  },
});

// Proxy all other requests to frontend on port 8081
const frontendProxy = createProxyMiddleware({
  target: 'http://localhost:8081',
  changeOrigin: true,
  ws: true, // Enable WebSocket proxy
  logLevel: 'silent',
});

// Apply both proxies - filter will determine which one handles the request
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    apiProxy(req, res, next);
  } else {
    frontendProxy(req, res, next);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Production proxy server running on http://0.0.0.0:${PORT}`);
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
