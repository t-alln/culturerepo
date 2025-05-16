"use client";

import { useState } from "react";
import { MediaUpload } from "./media-upload";
import { Loader2, AlertTriangle, AlertOctagon } from "lucide-react";

type EntryFormProps = {
  userId: string;
};

type ModerationState = {
  status: "none" | "rejected" | "flagged";
  message: string | null;
};

export function EntryForm({ userId }: EntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [moderation, setModeration] = useState<ModerationState>({
    status: "none",
    message: null,
  });

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    // Reset moderation state when a new file is selected
    setModeration({ status: "none", message: null });
  };

  const resetModerationState = () => {
    // Reset moderation state when any field changes
    if (moderation.status !== "none") {
      setModeration({ status: "none", message: null });
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select a media file first");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setModeration({ status: "none", message: null });

    try {
      // Get form values
      const formData = new FormData(e.currentTarget);
      const term = formData.get("term") as string;
      const description = formData.get("description") as string | null;

      // First send the file for moderation before uploading to S3
      const moderationFormData = new FormData();
      moderationFormData.append("file", selectedFile);
      moderationFormData.append("term", term);
      if (description) {
        moderationFormData.append("description", description);
      }

      const moderationResponse = await fetch("/api/moderation/check", {
        method: "POST",
        body: moderationFormData,
      });

      if (!moderationResponse.ok) {
        const moderationError = await moderationResponse.json();
        throw new Error(moderationError.error || "Content moderation failed");
      }

      const moderationData = await moderationResponse.json();

      // Check if content was rejected or flagged for moderation
      if (moderationData.rejected) {
        setModeration({
          status: "rejected",
          message:
            moderationData.feedback || "Content violates community guidelines",
        });
        return;
      }

      if (moderationData.status === "flagged") {
        setModeration({
          status: "flagged",
          message:
            "Your content has been flagged for review. It may take longer to appear while our team reviews it.",
        });
        // Continue with submission but let user know it's flagged
      }

      // After moderation passes, upload the file to S3
      const fileFormData = new FormData();
      fileFormData.append("file", selectedFile);

      const uploadResponse = await fetch("/api/media/upload", {
        method: "POST",
        body: fileFormData,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        throw new Error(uploadError.error || "Failed to upload media");
      }

      const { url, mediaType, key } = await uploadResponse.json();

      // Then create the entry with the S3 URL and moderation data
      const entryResponse = await fetch("/api/entries", {
        method: "POST",
        body: JSON.stringify({
          term,
          description,
          mediaUrl: url,
          mediaType,
          userId,
          awsMediaId: key,
          moderationData: moderationData,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const entryData = await entryResponse.json();

      if (!entryResponse.ok) {
        throw new Error(entryData.error || "Failed to create entry");
      }

      // Success! Redirect to browse tab
      window.location.href = "/?tab=browse";
    } catch (error) {
      console.error("Error creating entry:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create entry"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="term"
          className="block text-sm font-medium text-gray-700"
        >
          Term
        </label>
        <input
          type="text"
          id="term"
          name="term"
          required
          onChange={resetModerationState}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Enter a slang term"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          onChange={resetModerationState}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Describe what this term means"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Media
        </label>
        <MediaUpload onFileSelect={handleFileSelect} />
      </div>

      {error && (
        <div className="text-red-600 text-sm p-3 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {moderation.status === "rejected" && (
        <div className="flex items-start gap-3 p-3 bg-red-50 text-red-800 rounded-md border border-red-200">
          <AlertOctagon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Content Rejected</p>
            <p className="text-sm">{moderation.message}</p>
            <p className="text-sm mt-1">
              Please review and revise your submission.
            </p>
          </div>
        </div>
      )}

      {moderation.status === "flagged" && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Content Under Review</p>
            <p className="text-sm">{moderation.message}</p>
            <p className="text-sm mt-1">
              Your entry was submitted but requires additional review.
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={
          isSubmitting || !selectedFile || moderation.status === "rejected"
        }
        className="flex justify-center items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Entry"
        )}
      </button>
    </form>
  );
}
