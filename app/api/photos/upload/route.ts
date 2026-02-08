import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processPhoto } from "@/lib/photos/process";
import { moderatePhoto } from "@/lib/photos/moderate";
import { MAX_PHOTO_SIZE_BYTES } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
