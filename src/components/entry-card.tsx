"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaPlayer } from "./media-player";

// Define MediaType enum to match Prisma schema
enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

interface EntryCardProps {
  id: string;
  term: string;
  description?: string | null;
  mediaUrl: string;
  mediaType: MediaType;
  voteCount: number;
  tags: { id: string; name: string }[];
  onVote?: (id: string, value: 1 | -1) => Promise<void>;
}

export function EntryCard({
  id,
  term,
  description,
  mediaUrl,
  mediaType,
  voteCount = 0,
  tags = [],
  onVote,
}: EntryCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [localVoteCount, setLocalVoteCount] = useState(voteCount);

  const handleVote = async (value: 1 | -1) => {
    if (!onVote || isVoting) return;

    setIsVoting(true);
    try {
      await onVote(id, value);
      setLocalVoteCount((prev) => prev + value);
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl md:text-2xl">{term}</CardTitle>
        {description && (
          <CardDescription className="text-sm">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-4">
        <div className="overflow-hidden rounded-md border">
          <MediaPlayer
            url={mediaUrl}
            mediaType={mediaType}
            alt={term}
            preserveNaturalHeight={true}
          />
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Score: {localVoteCount}
        </div>
        {onVote && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote(1)}
              disabled={isVoting}
              className="flex items-center gap-1"
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="sr-only">Upvote</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleVote(-1)}
              disabled={isVoting}
              className="flex items-center gap-1"
            >
              <ThumbsDown className="h-4 w-4" />
              <span className="sr-only">Downvote</span>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
