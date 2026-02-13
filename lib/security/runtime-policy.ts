export type AppEnv = "local" | "dev" | "preprod" | "prod";
export type SafetyFailMode = "closed" | "open";

function parseAppEnv(value: string | undefined): AppEnv | null {
  if (
    value === "local" ||
    value === "dev" ||
    value === "preprod" ||
    value === "prod"
  ) {
    return value;
  }
  return null;
}

function parseSafetyFailMode(value: string | undefined): SafetyFailMode | null {
  if (value === "closed" || value === "open") {
    return value;
  }
  return null;
}

export function resolveAppEnv(
  env: NodeJS.ProcessEnv = process.env
): AppEnv {
  const configured = parseAppEnv(env.APP_ENV);
  if (configured) return configured;

  return env.NODE_ENV === "production" ? "preprod" : "local";
}

export function resolveSafetyFailMode(
  env: NodeJS.ProcessEnv = process.env
): SafetyFailMode {
  const configured = parseSafetyFailMode(env.SAFETY_FAIL_MODE);
  if (configured) return configured;
  return "closed";
}

/**
 * Safety failures should only fail open in local development, unless
 * SAFETY_FAIL_MODE is explicitly set to open.
 */
export function shouldFailClosedOnSafetyFailure(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  const mode = resolveSafetyFailMode(env);
  if (mode === "open") return false;
  return resolveAppEnv(env) !== "local";
}

export function isProductionLikeAppEnv(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  const appEnv = resolveAppEnv(env);
  return appEnv === "dev" || appEnv === "preprod" || appEnv === "prod";
}
