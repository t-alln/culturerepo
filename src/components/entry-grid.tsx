"use client";

import { EntryCard } from "./entry-card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useEffect, useState } from "react";

// Define MediaType enum to match Prisma schema
enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

type Entry = {
  id: string;
  term: string;
  description: string | null;
  mediaUrl: string;
  mediaType: MediaType;
  votes: { value: number }[];
  tags: { id: string; name: string }[];
};

interface EntryGridProps {
  entries: Entry[];
  isLoading?: boolean;
}

export function EntryGrid({ entries = [], isLoading = false }: EntryGridProps) {
  // Track viewport width for responsive column count
  const [columnCount, setColumnCount] = useState(3);

  // Update column count based on viewport width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setColumnCount(1);
      } else if (window.innerWidth < 1024) {
        setColumnCount(2);
      } else {
        setColumnCount(3);
      }
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleVote = async (id: string, value: 1 | -1) => {
    try {
      const response = await fetch(`/api/entries/${id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        throw new Error("Failed to vote");
      }

      return await response.json();
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote. Please try again.");
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No entries found</h3>
        <p className="text-muted-foreground">
          Be the first to add a visual slang definition!
        </p>
      </div>
    );
  }

  return (
    <div
      className="masonry-grid"
      style={{
        columnCount,
        columnGap: "1.5rem",
        orphans: 1,
        widows: 1,
      }}
    >
      {entries.map((entry) => {
        // Calculate vote count
        const voteCount = entry.votes.reduce(
          (acc, vote) => acc + vote.value,
          0
        );

        return (
          <div key={entry.id} className="masonry-item mb-6 break-inside-avoid">
            <EntryCard
              id={entry.id}
              term={entry.term}
              description={entry.description}
              mediaUrl={entry.mediaUrl}
              mediaType={entry.mediaType}
              voteCount={voteCount}
              tags={entry.tags}
              onVote={handleVote}
            />
          </div>
        );
      })}
    </div>
  );
}
