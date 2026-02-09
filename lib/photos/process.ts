import sharp from "sharp";
import {
  PHOTO_MAX_WIDTH,
  THUMBNAIL_WIDTH,
  JPEG_QUALITY,
  MAX_PHOTO_SIZE_BYTES,
} from "@/lib/types";

export interface ProcessedPhoto {
  image: Buffer;
  thumbnail: Buffer;
  width: number;
  height: number;
  format: string;
}

/**
 * Process an uploaded photo:
 * 1. Validate it's a real image (sharp throws on invalid input)
 * 2. Strip ALL EXIF/metadata including GPS (non-negotiable for community app)
 * 3. Resize to max width, preserving aspect ratio
 * 4. Generate thumbnail
 * 5. Compress as JPEG with mozjpeg
 */
export async function processPhoto(
  input: Buffer | ArrayBuffer
): Promise<ProcessedPhoto> {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);

  if (buffer.length > MAX_PHOTO_SIZE_BYTES) {
    throw new Error(`Photo exceeds maximum size of ${MAX_PHOTO_SIZE_BYTES / 1024 / 1024}MB`);
  }

  // This validates the input is a real image — sharp throws on non-image data
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error("Invalid image: could not read dimensions");
  }

  const allowedFormats = ["jpeg", "png", "webp", "gif", "avif"];
  if (!metadata.format || !allowedFormats.includes(metadata.format)) {
    throw new Error("Unsupported image format");
  }

  // Process main image: strip metadata, resize, compress
  const image = await sharp(buffer)
    .rotate() // Auto-orient based on EXIF before stripping
    .resize(PHOTO_MAX_WIDTH, undefined, {
      withoutEnlargement: true,
      fit: "inside",
    })
    .jpeg({
      quality: JPEG_QUALITY,
      mozjpeg: true,
    })
    .toBuffer();

  // Generate thumbnail
  const thumbnail = await sharp(buffer)
    .rotate()
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_WIDTH, {
      fit: "cover",
      position: "centre",
    })
    .jpeg({
      quality: JPEG_QUALITY,
      mozjpeg: true,
    })
    .toBuffer();

  const processedMeta = await sharp(image).metadata();

  return {
    image,
    thumbnail,
    width: processedMeta.width!,
    height: processedMeta.height!,
    format: "jpeg",
  };
}