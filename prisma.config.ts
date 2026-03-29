import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7+: connection URL lives here (not in schema.prisma).
 * Fallback allows `prisma generate` during `npm install` before `.env` exists; use a real URL at runtime.
 */
const databaseUrl =
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_PRISMA_URL?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  "postgresql://postgres:postgres@127.0.0.1:5432/prisma_generate_placeholder?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
