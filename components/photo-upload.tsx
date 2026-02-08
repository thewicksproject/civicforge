"use client";

import { useCallback, useState } from "react";
import { ImagePlus } from "lucide-react";
import { MAX_PHOTOS_PER_POST, MAX_PHOTO_SIZE_MB } from "@/lib/types";

interface UploadedPhoto {
  url: string;
  thumbnailUrl: string;
  preview: string;
}

interface PhotoUploadProps {
  onPhotosChange?: (photos: { url: string; thumbnailUrl: string }[]) => void;
}

export function PhotoUpload({ onPhotosChange }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      setError("");
      setUploading(true);

      const newPhotos: UploadedPhoto[] = [];
      for (const file of Array.from(files)) {
        if (photos.length + newPhotos.length >= MAX_PHOTOS_PER_POST) break;
        if (!file.type.startsWith("image/")) continue;
        if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) continue;

        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/photos/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const data = await res.json();
            setError(data.error ?? "Upload failed");
            continue;
          }

          const { url, thumbnailUrl } = await res.json();
          newPhotos.push({
            url,
            thumbnailUrl,
            preview: URL.createObjectURL(file),
          });
        } catch {
          setError("Upload failed. Please try again.");
        }
      }

      const updated = [...photos, ...newPhotos].slice(0, MAX_PHOTOS_PER_POST);
      setPhotos(updated);
      onPhotosChange?.(updated.map(({ url, thumbnailUrl }) => ({ url, thumbnailUrl })));
      setUploading(false);
    },
    [photos, onPhotosChange]
  );

  const removePhoto = useCallback(
    (index: number) => {
      setPhotos((prev) => {
        const removed = prev[index];
        if (removed) URL.revokeObjectURL(removed.preview);
        const updated = prev.filter((_, i) => i !== index);
        onPhotosChange?.(updated.map(({ url, thumbnailUrl }) => ({ url, thumbnailUrl })));
        return updated;
      });
    },
    [onPhotosChange]
  );

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        Photos (optional, up to {MAX_PHOTOS_PER_POST})
      </label>

      {error && (
        <p className="text-sm text-destructive mb-2">{error}</p>
      )}

      {/* Preview grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {photos.map((photo, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.preview}
                alt={`Upload ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black/80"
              >
                &times;
              </button>
              {/* Store URLs as hidden inputs for form submission */}
              <input type="hidden" name="photo_urls" value={photo.url} />
              <input type="hidden" name="photo_thumbnail_urls" value={photo.thumbnailUrl} />
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {photos.length < MAX_PHOTOS_PER_POST && (
        <label
          className="flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          {uploading ? (
            <span className="text-sm text-muted-foreground">Uploading...</span>
          ) : (
            <>
              <ImagePlus className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">
                Tap to add photos or drag & drop
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      )}
      <p className="text-xs text-muted-foreground mt-1.5">
        Max {MAX_PHOTO_SIZE_MB}MB per photo. GPS/EXIF data is automatically stripped.
      </p>
    </div>
  );
}
