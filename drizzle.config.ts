import { defineConfig } from "drizzle-kit";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

// Extract the project ref from the Supabase URL.
// Example: https://abcdefghij.supabase.co -> abcdefghij
const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(
  ".",
)[0];

// Supabase direct connection string (Session mode - port 5432).
// For migrations and schema pushes, use the direct connection to avoid
// issues with pgBouncer's transaction pooling on port 6543.
const connectionString =
  process.env.DATABASE_URL ??
  `postgresql://postgres.${projectRef}:${process.env.DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
});
