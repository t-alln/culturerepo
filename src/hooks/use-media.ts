"use client";

import { useState, useEffect } from "react";

/**
 * A hook to handle S3 media URLs.
 * If the media requires presigned URLs, this hook will fetch and cache them.
 */
export function useMedia(originalUrl: string) {
  const [url, setUrl] = useState<string>(originalUrl);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getPresignedUrl = async () => {
      if (!originalUrl) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/media/get-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: originalUrl }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to get media URL");
        }

        if (isMounted) {
          setUrl(data.presignedUrl);
        }
      } catch (error) {
        console.error("Error fetching presigned URL:", error);
        if (isMounted) {
          setError(
            error instanceof Error ? error.message : "Failed to load media"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Only fetch a presigned URL if needed
    // This is a basic check - for a production app, you might want to check headers
    // or have a specific pattern for private URLs
    if (originalUrl && originalUrl.includes("s3.amazonaws.com")) {
      getPresignedUrl();
    } else {
      setUrl(originalUrl);
    }

    return () => {
      isMounted = false;
    };
  }, [originalUrl]);

  return { url, isLoading, error };
}
