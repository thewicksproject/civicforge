"use client";

import { useCallback, useState } from "react";
import { MAX_PHOTOS_PER_POST, MAX_PHOTO_SIZE_MB } from "@/lib/types";

interface PhotoFile {
  file: File;
  preview: string;
}

export function PhotoUpload() {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newPhotos: PhotoFile[] = [];
      for (const file of Array.from(files)) {
        if (photos.length + newPhotos.length >= MAX_PHOTOS_PER_POST) break;
        if (!file.type.startsWith("image/")) continue;
        if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) continue;

        newPhotos.push({
          file,
          preview: URL.createObjectURL(file),
        });
      }

      setPhotos((prev) => [...prev, ...newPhotos].slice(0, MAX_PHOTOS_PER_POST));
    },
    [photos.length]
  );

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        Photos (optional, up to {MAX_PHOTOS_PER_POST})
      </label>

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
              {/* Hidden file input for form submission */}
              <input type="hidden" name="photo_indexes" value={i} />
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
          <svg
            className="h-6 w-6 text-muted-foreground mb-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
            <line x1="16" x2="22" y1="5" y2="5" />
            <line x1="19" x2="19" y1="2" y2="8" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span className="text-xs text-muted-foreground">
            Tap to add photos or drag & drop
          </span>
          <input
            type="file"
            name="photos"
            accept="image/*"
            multiple
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
