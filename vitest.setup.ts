process.env.SKIP_ENV_VALIDATION = "1";
process.env.AUTH_SECRET = "test-auth-secret-for-vitest";
// Prisma schema targets PostgreSQL; tests mock DB — URL must be a valid postgres connection string.
process.env.DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:5432/vitest_dummy";
process.env.OPENAI_API_KEY = "sk-test-key";
