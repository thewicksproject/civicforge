/**
 * Photo moderation via ModerateContent.com API.
 * Screens images for NSFW content before they reach storage.
 * Fails open if API key is not configured or API is unavailable.
 */

interface ModerationResult {
  safe: boolean;
  rating: "everyone" | "teen" | "adult" | null;
}

export async function moderatePhoto(
  base64Image: string
): Promise<ModerationResult> {
  const apiKey = process.env.MODERATECONTENT_API_KEY;

  // Fail open if API key is not configured
  if (!apiKey) {
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
