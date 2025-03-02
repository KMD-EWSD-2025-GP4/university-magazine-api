import { v4 as uuidv4 } from 'uuid';

import { generatePresignedUploadUrl } from '../../utils/s3';

export async function getUploadUrl(
  fileName: string,
  userId: string,
): Promise<{ url: string; path: string }> {
  const uuid = uuidv4();
  const fileExtension = fileName.split('.').pop();
  const key = `uploads/${userId}/${uuid}.${fileExtension}`;

  return {
    path: key,
    url: await generatePresignedUploadUrl('ewsd-bucket', key),
  };
}
