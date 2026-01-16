import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || '';

export const uploadFile = async (key, body, contentType, acl = 'public-read') => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: acl,
  });
  const result = await s3Client.send(command);
  // Return the public URL
  const region = process.env.AWS_REGION || 'us-east-1';
  // Handle different region URL formats
  let url;
  if (region === 'us-east-1') {
    url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
  } else {
    url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
  }
  return { ...result, Location: url };
};

export const getFile = async (key) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  return await s3Client.send(command);
};

export const getPresignedUrl = async (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
};

export const deleteFile = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  return await s3Client.send(command);
};

export default s3Client;
