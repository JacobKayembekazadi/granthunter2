import { drizzle } from 'drizzle-orm/postgres-js';
import postgres, { Sql } from 'postgres';
import * as schema from './schema';

// Lazy initialization - only connect when db is actually used
let _client: Sql | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured. Please set it in environment variables');
    }

    try {
      if (!_client) {
        // Configure for serverless environments (Vercel)
        // Use connection pooling appropriate for serverless
        _client = postgres(connectionString, { 
          prepare: false,
          max: 1, // Single connection per function invocation in serverless
          idle_timeout: 20,
          connect_timeout: 10,
          ssl: connectionString.includes('pooler') ? 'require' : undefined,
        });
      }
      
      _db = drizzle(_client, { schema });
    } catch (error: any) {
      console.error('Database connection error:', error.message, error.stack);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }
  
  return _db;
}

// Create a proxy that lazily initializes the db on first access
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    try {
      const dbInstance = getDb();
      const value = (dbInstance as any)[prop];
      // If it's a function, bind it to db so 'this' works correctly
      if (typeof value === 'function') {
        return value.bind(dbInstance);
      }
      return value;
    } catch (error: any) {
      console.error('Database proxy error:', error.message);
      throw error;
    }
  }
}) as ReturnType<typeof drizzle>;

