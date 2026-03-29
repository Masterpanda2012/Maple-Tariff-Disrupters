import { spawnSync } from "node:child_process";

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env,
    shell: false,
  });

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
}

/** Client must exist before migrate / Next compile (postinstall is avoided for flaky Vercel installs). */
console.log("[build] prisma generate");
run("npx", ["prisma", "generate"]);

const buildDatabaseUrl =
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_PRISMA_URL?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  "";
const hasDatabaseUrl = Boolean(buildDatabaseUrl);

if (hasDatabaseUrl) {
  console.log("[build] DATABASE_URL found. Running prisma migrate deploy.");
  run("npx", ["prisma", "migrate", "deploy"]);
  run("next", ["build"]);
} else {
  console.warn(
    "[build] DATABASE_URL not set. Skipping migrations and building with SKIP_ENV_VALIDATION=1.",
  );
  run("next", ["build"], {
    ...process.env,
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION ?? "1",
  });
}
