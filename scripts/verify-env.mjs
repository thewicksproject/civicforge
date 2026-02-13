#!/usr/bin/env node

const APP_ENVS = new Set(["local", "dev", "preprod", "prod"]);
const SAFETY_MODES = new Set(["closed", "open"]);

function resolveAppEnv(env) {
  const configured = env.APP_ENV;
  if (APP_ENVS.has(configured)) return configured;
  return env.NODE_ENV === "production" ? "preprod" : "local";
}

function resolveSafetyFailMode(env) {
  const configured = env.SAFETY_FAIL_MODE;
  if (SAFETY_MODES.has(configured)) return configured;
  return "closed";
}

function requiredKeysForAppEnv(appEnv) {
  if (appEnv === "local") return [];
  if (appEnv === "dev") {
    return [
      "NEXT_PUBLIC_APP_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ];
  }
  return [
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ANTHROPIC_API_KEY",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "CRON_SECRET",
  ];
}

function isValidUrl(value) {
  if (!value || typeof value !== "string") return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function main() {
  const { env } = process;
  const appEnv = resolveAppEnv(env);
  const safetyFailMode = resolveSafetyFailMode(env);

  if (env.APP_ENV && !APP_ENVS.has(env.APP_ENV)) {
    console.error(
      `[verify:env] APP_ENV must be one of: ${Array.from(APP_ENVS).join(", ")}`
    );
    process.exit(1);
  }

  if (env.SAFETY_FAIL_MODE && !SAFETY_MODES.has(env.SAFETY_FAIL_MODE)) {
    console.error(
      `[verify:env] SAFETY_FAIL_MODE must be one of: ${Array.from(SAFETY_MODES).join(", ")}`
    );
    process.exit(1);
  }

  const missing = requiredKeysForAppEnv(appEnv).filter((key) => {
    const value = env[key];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (missing.length > 0) {
    console.error(
      `[verify:env] Missing required environment variables for APP_ENV=${appEnv}: ${missing.join(", ")}`
    );
    process.exit(1);
  }

  if (env.NEXT_PUBLIC_APP_URL && !isValidUrl(env.NEXT_PUBLIC_APP_URL)) {
    console.error("[verify:env] NEXT_PUBLIC_APP_URL must be a valid URL");
    process.exit(1);
  }

  if (
    env.NEXT_PUBLIC_SUPABASE_URL &&
    !isValidUrl(env.NEXT_PUBLIC_SUPABASE_URL)
  ) {
    console.error("[verify:env] NEXT_PUBLIC_SUPABASE_URL must be a valid URL");
    process.exit(1);
  }

  if (
    env.UPSTASH_REDIS_REST_URL &&
    !isValidUrl(env.UPSTASH_REDIS_REST_URL)
  ) {
    console.error("[verify:env] UPSTASH_REDIS_REST_URL must be a valid URL");
    process.exit(1);
  }

  console.log(
    `[verify:env] OK (APP_ENV=${appEnv}, SAFETY_FAIL_MODE=${safetyFailMode})`
  );
}

main();
