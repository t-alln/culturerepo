import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  endpoint: process.env.AWS_S3_ENDPOINT,
  forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === "true",
});

// The bucket name
const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "";

// Generate a unique key for the file
export const generateFileKey = (fileName: string): string => {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "");
  return `${timestamp}-${cleanFileName}`;
};

// Upload a file to S3
export async function uploadFileToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  key?: string
): Promise<string> {
  const fileKey = key || generateFileKey(fileName);

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Body: file,
    ContentType: contentType,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));

    // Return the URL for the uploaded file
    return `https://${BUCKET_NAME}.s3.${
      process.env.AWS_REGION || "us-east-1"
    }.amazonaws.com/${fileKey}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file");
  }
}

// Generate a presigned URL to get a file from S3 (for private access)
export async function getPresignedUrl(key: string): Promise<string> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  try {
    return await getSignedUrl(s3Client, new GetObjectCommand(params), {
      expiresIn: 3600, // URL expires in 1 hour
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate presigned URL");
  }
}

// Extract the key from a full S3 URL
export function getKeyFromUrl(url: string): string | null {
  const baseUrl = `https://${BUCKET_NAME}.s3.${
    process.env.AWS_REGION || "us-east-1"
  }.amazonaws.com/`;

  if (url.startsWith(baseUrl)) {
    return url.substring(baseUrl.length);
  }

  return null;
}
