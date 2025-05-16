import { NextRequest, NextResponse } from "next/server";
import { uploadFileToS3, generateFileKey } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    // Check if the request is multipart/form-data
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

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
      return NextResponse.json(
        {
          error:
            "Invalid file type. Accepted types: JPG, PNG, GIF, WebP, MP4, WebM",
        },
        { status: 400 }
      );
    }

    // Check file size - 10MB limit
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Determine media type
    const mediaType = fileType.startsWith("image/") ? "IMAGE" : "VIDEO";

    // Generate key
    const key = generateFileKey(file.name);

    // Upload to S3
    const url = await uploadFileToS3(buffer, file.name, fileType, key);

    return NextResponse.json(
      {
        success: true,
        url,
        mediaType,
        key, // Include the S3 key in the response
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Configure the maximum payload size for this route
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
    responseLimit: false, // No response size limit
  },
};
