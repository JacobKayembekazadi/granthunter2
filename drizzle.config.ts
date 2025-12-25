// @ts-ignore - Drizzle config type inference issue with union types
export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
};

