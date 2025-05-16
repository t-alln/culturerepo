import { NextRequest, NextResponse } from "next/server";
import { getPresignedUrl, getKeyFromUrl } from "@/lib/s3";
import * as z from "zod";

const urlSchema = z.object({
  url: z.string().url(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the request body
    const { url } = urlSchema.parse(body);

    // Extract the key from the URL
    const key = getKeyFromUrl(url);

    if (!key) {
      return NextResponse.json(
        { error: "Invalid S3 URL format" },
        { status: 400 }
      );
    }

    // Generate a presigned URL for the object
    const presignedUrl = await getPresignedUrl(key);

    return NextResponse.json({ presignedUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
