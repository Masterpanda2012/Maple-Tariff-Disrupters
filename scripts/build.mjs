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

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

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
