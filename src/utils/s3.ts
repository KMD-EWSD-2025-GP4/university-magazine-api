import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Generate a presigned URL for uploading a file to S3
 * @param bucket - The S3 bucket name
 * @param key - The object key (file path in S3)
 * @param expiresIn - URL expiration time in seconds (default: 3600s = 1 hour)
 * @returns Promise<string> - The presigned URL for upload
 */
export async function generatePresignedUploadUrl(
  bucket: string = env.AWS_BUCKET_NAME,
  key: string,
  // 1 hour
  expiresIn: number = 3600,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating presigned upload URL:', error);
    throw error;
  }
}

/**
 * Generate a presigned URL for downloading a file from S3
 * @param bucket - The S3 bucket name
 * @param key - The object key (file path in S3)
 * @param expiresIn - URL expiration time in seconds (default: 3600s = 1 hour)
 * @returns Promise<string> - The presigned URL for download
 */
export async function generatePresignedDownloadUrl(
  bucket: string = env.AWS_BUCKET_NAME,
  key: string,
  // 7 days
  expiresIn: number = 604800,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating presigned download URL:', error);
    throw error;
  }
}
