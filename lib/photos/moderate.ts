/**
 * Photo moderation via SightEngine API.
 * Screens images for NSFW content before they reach storage.
 *
 * Environment-aware failure behavior:
 * - Production: Fails CLOSED (safe: false) when credentials are missing.
 * - Development: Fails open with console warnings to allow local dev without credentials.
 *
 * API/network failures are controlled by runtime policy:
 * - local: fail open by default
 * - dev/preprod/prod: fail closed by default
 */
import {
  resolveAppEnv,
  shouldFailClosedOnSafetyFailure,
} from "@/lib/security/runtime-policy";

interface ModerationResult {
  safe: boolean;
  rating: "everyone" | "teen" | "adult" | null;
}

export async function moderatePhoto(
  base64Image: string
): Promise<ModerationResult> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;
  const appEnv = resolveAppEnv();
  const failClosed = shouldFailClosedOnSafetyFailure();

  if (!apiUser || !apiSecret) {
    if (failClosed) {
      console.error(
        JSON.stringify({
          event: "safety_provider_unavailable",
          endpoint: "lib/photos/moderatePhoto",
          provider: "sightengine",
          appEnv,
          failMode: "closed",
          reason: "missing_credentials",
        })
      );
      return { safe: false, rating: null };
    }
    console.warn(
      "[photo-moderation] SIGHTENGINE credentials are not configured. " +
      "Skipping moderation in development."
    );
    return { safe: true, rating: null };
  }

  try {
    const imageBuffer = Buffer.from(base64Image, "base64");
    const blob = new Blob([imageBuffer], { type: "image/jpeg" });

    const form = new FormData();
    form.append("media", blob, "photo.jpg");
    form.append("models", "nudity-2.1");
    form.append("api_user", apiUser);
    form.append("api_secret", apiSecret);

    const response = await fetch(
      "https://api.sightengine.com/1.0/check.json",
      { method: "POST", body: form }
    );

    if (!response.ok) {
      console.error(
        JSON.stringify({
          event: "safety_provider_unavailable",
          endpoint: "lib/photos/moderatePhoto",
          provider: "sightengine",
          appEnv,
          failMode: failClosed ? "closed" : "open",
          reason: "http_error",
          status: response.status,
        })
      );
      return { safe: !failClosed, rating: null };
    }

    const data = await response.json();

    // SightEngine nudity-2.1 returns scores for sexual_activity, sexual_display,
    // erotica, very_suggestive, suggestive, mildly_suggestive, none.
    // Flag as adult if explicit content scores are high.
    const nudity = data.nudity ?? {};
    const explicitScore =
      (nudity.sexual_activity ?? 0) +
      (nudity.sexual_display ?? 0) +
      (nudity.erotica ?? 0);
    const suggestiveScore = nudity.very_suggestive ?? 0;

    let rating: "everyone" | "teen" | "adult";
    if (explicitScore > 0.5) {
      rating = "adult";
    } else if (suggestiveScore > 0.5) {
      rating = "teen";
    } else {
      rating = "everyone";
    }

    return { safe: rating !== "adult", rating };
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "safety_provider_unavailable",
        endpoint: "lib/photos/moderatePhoto",
        provider: "sightengine",
        appEnv,
        failMode: failClosed ? "closed" : "open",
        reason: "network_or_runtime_error",
        message: error instanceof Error ? error.message : "unknown",
      })
    );
    return { safe: !failClosed, rating: null };
  }
}
