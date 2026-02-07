/**
 * Photo moderation via ModerateContent.com API.
 * Screens images for NSFW content before they reach storage.
 *
 * Environment-aware failure behavior:
 * - Production: Fails CLOSED (safe: false) when API key is missing or API errors occur.
 * - Development: Fails open with console warnings to allow local dev without API key.
 */

interface ModerationResult {
  safe: boolean;
  rating: "everyone" | "teen" | "adult" | null;
}

export async function moderatePhoto(
  base64Image: string
): Promise<ModerationResult> {
  const apiKey = process.env.MODERATECONTENT_API_KEY;
  const isProduction = process.env.NODE_ENV === "production";

  if (!apiKey) {
    if (isProduction) {
      console.error(
        "[photo-moderation] MODERATECONTENT_API_KEY is not configured in production. " +
        "Failing closed — all photos will be rejected until the API key is set."
      );
      return { safe: false, rating: null };
    }
    console.warn(
      "[photo-moderation] MODERATECONTENT_API_KEY is not configured. " +
      "Skipping moderation in development. Set the key to enable photo screening."
    );
    return { safe: true, rating: null };
  }

  try {
    const response = await fetch(
      `https://api.moderatecontent.com/moderate/?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `url=data:image/jpeg;base64,${base64Image}`,
      }
    );

    if (!response.ok) {
      // Fail open on API errors
      return { safe: true, rating: null };
    }

    const data = await response.json();

    // ModerateContent returns rating_index: 1 (everyone), 2 (teen), 3 (adult)
    const ratingIndex = data.rating_index ?? 1;
    const ratingMap: Record<number, "everyone" | "teen" | "adult"> = {
      1: "everyone",
      2: "teen",
      3: "adult",
    };

    const rating = ratingMap[ratingIndex] ?? "everyone";
    const safe = rating !== "adult";

    return { safe, rating };
  } catch {
    // Fail open on network errors
    return { safe: true, rating: null };
  }
}
