import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processPhoto } from "@/lib/photos/process";
import { moderatePhoto } from "@/lib/photos/moderate";
import { MAX_PHOTO_SIZE_BYTES } from "@/lib/types";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasRedisConfig = !!redisUrl && !!redisToken;

const redis = hasRedisConfig
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "5 m"),
      prefix: "photos:upload",
    })
  : null;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ratelimit && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Photo upload temporarily unavailable" },
      { status: 503 }
    );
  }

  if (ratelimit) {
    const { success } = await ratelimit.limit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: "Too many uploads. Please try again later." },
        { status: 429 }
      );
    }
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum 5MB." },
      { status: 400 }
    );
  }

  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return NextResponse.json(
      { error: "Only image files are accepted" },
      { status: 400 }
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();

    // Process photo: validate, strip EXIF, resize, compress
    const processed = await processPhoto(arrayBuffer);

    // Moderate photo for NSFW content — fail open if API unavailable
    const modResult = await moderatePhoto(processed.image.toString("base64"));
    if (!modResult.safe) {
      return NextResponse.json(
        { error: "Photo flagged as inappropriate content" },
        { status: 422 }
      );
    }

    // Store in the canonical private bucket.
    const bucket = "post-photos";
    const timestamp = Date.now();
    const imagePath = `${user.id}/${timestamp}.jpg`;
    const thumbPath = `${user.id}/${timestamp}_thumb.jpg`;

    const [imageUpload, thumbUpload] = await Promise.all([
      supabase.storage
        .from(bucket)
        .upload(imagePath, processed.image, {
          contentType: "image/jpeg",
          upsert: false,
        }),
      supabase.storage
        .from(bucket)
        .upload(thumbPath, processed.thumbnail, {
          contentType: "image/jpeg",
          upsert: false,
        }),
    ]);

    if (imageUpload.error || thumbUpload.error) {
      return NextResponse.json(
        { error: "Failed to upload photo" },
        { status: 500 }
      );
    }

    // Return storage object paths. The post creation flow persists these paths
    // and signed URLs are generated only for authorized viewers.
    return NextResponse.json({ url: imagePath, thumbnailUrl: thumbPath });
  } catch {
    return NextResponse.json(
      { error: "Failed to process photo" },
      { status: 500 }
    );
  }
}
