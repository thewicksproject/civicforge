import { z } from "zod";
import {
  resolveAppEnv,
  resolveSafetyFailMode,
  type AppEnv,
  type SafetyFailMode,
} from "@/lib/security/runtime-policy";

const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  APP_ENV: z.enum(["local", "dev", "preprod", "prod"]).optional(),
  SAFETY_FAIL_MODE: z.enum(["closed", "open"]).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(1).optional(),
});

export interface ValidatedServerEnv {
  appEnv: AppEnv;
  safetyFailMode: SafetyFailMode;
  missing: string[];
}

function requiredKeysForAppEnv(appEnv: AppEnv): string[] {
  if (appEnv === "local") {
    return [];
  }

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

function findMissingKeys(
  env: NodeJS.ProcessEnv,
  requiredKeys: string[]
): string[] {
  return requiredKeys.filter((key) => {
    const value = env[key];
    return typeof value !== "string" || value.trim().length === 0;
  });
}

export function validateServerEnv(
  env: NodeJS.ProcessEnv = process.env
): ValidatedServerEnv {
  const parsed = baseEnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")}`
    );
  }

  const appEnv = resolveAppEnv(env);
  const safetyFailMode = resolveSafetyFailMode(env);
  const missing = findMissingKeys(env, requiredKeysForAppEnv(appEnv));

  return { appEnv, safetyFailMode, missing };
}

export function assertServerEnv(
  env: NodeJS.ProcessEnv = process.env
): ValidatedServerEnv {
  const validated = validateServerEnv(env);
  if (validated.missing.length > 0) {
    throw new Error(
      `Missing required environment variables for APP_ENV=${validated.appEnv}: ${validated.missing.join(
        ", "
      )}`
    );
  }
  return validated;
}
