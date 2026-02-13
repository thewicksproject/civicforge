import { describe, expect, it } from "vitest";
import {
  isProductionLikeAppEnv,
  resolveAppEnv,
  resolveSafetyFailMode,
  shouldFailClosedOnSafetyFailure,
} from "@/lib/security/runtime-policy";

describe("runtime safety policy", () => {
  it("defaults to local app env outside production NODE_ENV", () => {
    expect(resolveAppEnv({ NODE_ENV: "development" })).toBe("local");
  });

  it("defaults to preprod when NODE_ENV is production and APP_ENV is unset", () => {
    expect(resolveAppEnv({ NODE_ENV: "production" })).toBe("preprod");
  });

  it("honors explicit APP_ENV values", () => {
    expect(resolveAppEnv({ APP_ENV: "dev" })).toBe("dev");
    expect(resolveAppEnv({ APP_ENV: "prod" })).toBe("prod");
  });

  it("defaults SAFETY_FAIL_MODE to closed", () => {
    expect(resolveSafetyFailMode({})).toBe("closed");
  });

  it("fails open only in local by default", () => {
    expect(
      shouldFailClosedOnSafetyFailure({ APP_ENV: "local", SAFETY_FAIL_MODE: "closed" })
    ).toBe(false);
    expect(
      shouldFailClosedOnSafetyFailure({ APP_ENV: "dev", SAFETY_FAIL_MODE: "closed" })
    ).toBe(true);
    expect(
      shouldFailClosedOnSafetyFailure({ APP_ENV: "preprod", SAFETY_FAIL_MODE: "closed" })
    ).toBe(true);
  });

  it("allows explicit open mode in hosted environments", () => {
    expect(
      shouldFailClosedOnSafetyFailure({ APP_ENV: "prod", SAFETY_FAIL_MODE: "open" })
    ).toBe(false);
  });

  it("identifies production-like app environments", () => {
    expect(isProductionLikeAppEnv({ APP_ENV: "local" })).toBe(false);
    expect(isProductionLikeAppEnv({ APP_ENV: "dev" })).toBe(true);
    expect(isProductionLikeAppEnv({ APP_ENV: "preprod" })).toBe(true);
    expect(isProductionLikeAppEnv({ APP_ENV: "prod" })).toBe(true);
  });
});
