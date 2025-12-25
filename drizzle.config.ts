import type { Config } from 'drizzle-kit';

const config = {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql' as const,
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;

export default config;

