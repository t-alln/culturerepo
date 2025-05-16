"use client";

import { useMedia } from "@/hooks/use-media";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

type MediaPlayerProps = {
  url: string;
  mediaType: "IMAGE" | "VIDEO";
  alt?: string;
  className?: string;
  priority?: boolean;
  containerClassName?: string;
  preserveNaturalHeight?: boolean;
};

export function MediaPlayer({
  url,
  mediaType,
  alt = "Media content",
  className = "",
  priority = false,
  containerClassName = "",
  preserveNaturalHeight = false,
}: MediaPlayerProps) {
  const { url: mediaUrl, isLoading, error } = useMedia(url);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const isPortrait = dimensions ? dimensions.height > dimensions.width : false;
  const aspectRatio = dimensions ? dimensions.width / dimensions.height : null;
  // Extreme aspect ratios need special handling
  const isPanoramic = aspectRatio && aspectRatio > 2.5;
  const isTall = aspectRatio && aspectRatio < 0.5;

  // Reset loaded state when media URL changes
  useEffect(() => {
    setLoaded(false);
  }, [mediaUrl]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setLoaded(true);
  };

  const getImageDisplayStyle = () => {
    if (preserveNaturalHeight) {
      return "object-contain w-full h-auto";
    }

    if (isPanoramic) {
      return "object-contain"; // Panoramic images should be contained
    } else if (isTall) {
      return "object-contain"; // Very tall images should be contained
    } else if (isPortrait) {
      return "object-contain"; // Portrait images should be contained
    } else {
      return "object-cover"; // Regular landscape images can be covered
    }
  };

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-md ${
          !preserveNaturalHeight ? "aspect-video" : "min-h-[200px]"
        } ${containerClassName}`}
      >
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !mediaUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-red-500 rounded-md p-4 ${
          !preserveNaturalHeight ? "aspect-video" : "min-h-[200px]"
        } ${containerClassName}`}
      >
        {error || "Failed to load media"}
      </div>
    );
  }

  if (mediaType === "IMAGE") {
    return (
      <div
        className={`relative overflow-hidden rounded-md ${containerClassName} ${
          !loaded ? "bg-gray-100" : ""
        }`}
      >
        <img
          src={mediaUrl}
          alt={alt}
          className={`rounded-md transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${getImageDisplayStyle()} ${className}`}
          loading={priority ? "eager" : "lazy"}
          onLoad={handleImageLoad}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
      </div>
    );
  }

  if (mediaType === "VIDEO") {
    return (
      <div
        className={`relative overflow-hidden rounded-md ${containerClassName}`}
      >
        <video
          src={mediaUrl}
          controls
          className={`rounded-md w-full ${
            preserveNaturalHeight ? "" : "aspect-video"
          } ${className}`}
          preload="metadata"
          poster={mediaUrl + "?x-oss-process=video/snapshot,t_1000,m_fast"}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return null;
}
