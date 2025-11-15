// Database configuration using Drizzle ORM with Neon PostgreSQL
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Convert to Neon pooled connection for production scalability
// This allows handling 15,000+ concurrent users with efficient connection pooling
const connectionString = process.env.DATABASE_URL.replace(
  /\.([a-z0-9-]+)\.aws\.neon\.tech/,
  '-pooler.$1.aws.neon.tech'
);

// Connection pool configuration optimized for production
export const pool = new Pool({ 
  connectionString,
  // Application-level connection pool settings
  max: 20,                      // Maximum connections from this server instance
  idleTimeoutMillis: 30000,     // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Connection timeout: 10 seconds
});

export const db = drizzle({ client: pool, schema });
