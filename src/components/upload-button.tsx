"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Image, FileVideo } from "lucide-react";

// Define MediaType enum to match Prisma schema
export function UploadMediaButton() {
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");

  return (
    <div className="w-full space-y-4">
      <div className="flex space-x-2 mb-4">
        <Button
          variant={activeTab === "image" ? "default" : "outline"}
          onClick={() => setActiveTab("image")}
          className="flex items-center gap-2"
        >
          <Image className="h-4 w-4" />
          Image
        </Button>
        <Button
          variant={activeTab === "video" ? "default" : "outline"}
          onClick={() => setActiveTab("video")}
          className="flex items-center gap-2"
        >
          <FileVideo className="h-4 w-4" />
          Video
        </Button>
      </div>

      {activeTab === "image" ? (
        <></>
      ) : (
        // <UploadButton
        //   appearance={{
        //     button: "bg-primary text-white hover:bg-primary/90",
        //     container: "w-full",
        //   }}
        //   endpoint="imageUploader"
        //   onClientUploadComplete={(res: UploadResponse[]) => {
        //     if (res && res.length > 0) {
        //       onComplete(res[0].url, MediaType.IMAGE);
        //     }
        //   }}
        //   onUploadError={(error: Error) => {
        //     console.error(error);
        //     alert(`Error: ${error.message}`);
        //   }}
        // />
        <></>
        // <UploadButton
        //   appearance={{
        //     button: "bg-primary text-white hover:bg-primary/90",
        //     container: "w-full",
        //   }}
        //   endpoint="videoUploader"
        //   onClientUploadComplete={(res: UploadResponse[]) => {
        //     if (res && res.length > 0) {
        //       onComplete(res[0].url, MediaType.VIDEO);
        //     }
        //   }}
        //   onUploadError={(error: Error) => {
        //     console.error(error);
        //     alert(`Error: ${error.message}`);
        //   }}
        // />
      )}
    </div>
  );
}
