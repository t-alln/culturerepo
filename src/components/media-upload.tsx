"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

type MediaUploadProps = {
  onFileSelect: (file: File | null) => void;
  className?: string;
};

export function MediaUpload({
  onFileSelect,
  className = "",
}: MediaUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      // Check file type
      const fileType = file.type;
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
      ];

      if (!validTypes.includes(fileType)) {
        throw new Error(
          "Invalid file type. Accepted types: JPG, PNG, GIF, WebP, MP4, WebM"
        );
      }

      // Check file size - 10MB limit
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size exceeds 10MB limit");
      }

      // Create a preview for the user
      const fileUrl = URL.createObjectURL(file);
      const isImage = file.type.startsWith("image/");
      setPreview(fileUrl);
      setMediaType(isImage ? "IMAGE" : "VIDEO");

      // Call the callback with the file
      onFileSelect(file);
    } catch (error) {
      console.error("File validation error:", error);
      setError(error instanceof Error ? error.message : "Invalid file");
      // Clear preview
      setPreview(null);
      setMediaType(null);
      onFileSelect(null);
    }
  };

  const handleReset = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPreview(null);
    setMediaType(null);
    setError(null);
    // Notify parent that file was removed
    onFileSelect(null);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Create a synthetic event to reuse existing handler
      const dataTransferFile = e.dataTransfer.files[0];
      const fileInputEl = fileInputRef.current;

      if (fileInputEl) {
        // Create a new FileList containing the dropped file
        const dt = new DataTransfer();
        dt.items.add(dataTransferFile);
        fileInputEl.files = dt.files;

        // Trigger change event manually
        const changeEvent = new Event("change", { bubbles: true });
        fileInputEl.dispatchEvent(changeEvent);

        // Call our handler directly with a synthetic event
        handleFileChange({
          currentTarget: fileInputEl,
          target: fileInputEl,
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  return (
    <div
      className={`relative rounded-md border border-dashed p-6 ${className}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {preview ? (
        <div className="relative">
          <button
            type="button"
            onClick={handleReset}
            className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white z-10"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>

          {mediaType === "IMAGE" ? (
            <div className="mx-auto rounded-md overflow-hidden aspect-[4/3] max-h-64 flex items-center justify-center bg-gray-50">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="mx-auto rounded-md overflow-hidden aspect-video max-h-64 bg-black">
              <video
                src={preview}
                controls
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4 flex text-sm leading-6 text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md bg-white font-semibold text-primary hover:text-primary/80"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                ref={fileInputRef}
                className="sr-only"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
                onChange={handleFileChange}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs leading-5 text-gray-600">
            JPG, PNG, GIF, WebP, MP4 or WebM (max 10MB)
          </p>
        </div>
      )}

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
}
