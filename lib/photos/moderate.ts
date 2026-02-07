/**
 * Photo moderation via SightEngine API.
 * Screens images for NSFW content before they reach storage.
 *
 * Environment-aware failure behavior:
 * - Production: Fails CLOSED (safe: false) when credentials are missing.
 * - Development: Fails open with console warnings to allow local dev without credentials.
 *
 * API errors and network errors fail open (safe: true) so transient issues
 * don't block uploads.
 */

interface ModerationResult {
  safe: boolean;
  rating: "everyone" | "teen" | "adult" | null;
}

export async function moderatePhoto(
  base64Image: string
): Promise<ModerationResult> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  if (!apiUser || !apiSecret) {
    if (isProduction) {
      console.error(
        "[photo-moderation] SIGHTENGINE credentials are not configured in production. " +
        "Failing closed — all photos will be rejected until credentials are set."
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
      return { safe: true, rating: null };
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
  } catch {
    return { safe: true, rating: null };
  }
}
