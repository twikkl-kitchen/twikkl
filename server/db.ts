// Database configuration using Drizzle ORM with Neon PostgreSQL
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

// Fix SSL certificate verification for Neon WebSocket connections
neonConfig.wsProxy = (host) => `${host}?sslmode=require`;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use direct connection (not pooled) to avoid SSL certificate issues
const connectionString = process.env.DATABASE_URL;

// Connection pool configuration
export const pool = new Pool({ 
  connectionString,
  // Application-level connection pool settings
  max: 20,                      // Maximum connections from this server instance
  idleTimeoutMillis: 30000,     // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Connection timeout: 10 seconds
});

export const db = drizzle({ client: pool, schema });
