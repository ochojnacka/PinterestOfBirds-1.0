import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let s3Client = null;

function getS3Client() {
  if (!s3Client) {
    console.log('Creating S3Client with:', {
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'MISSING',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'MISSING',
      bucket: process.env.S3_BUCKET_NAME,
    });
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }
  return s3Client;
}

export const uploadFile = async (key, body, contentType, acl = 'public-read') => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME || '',
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: acl,
  });
  const result = await getS3Client().send(command);
  const region = process.env.AWS_REGION || 'us-east-1';
  let url;
  if (region === 'us-east-1') {
    url = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
  } else {
    url = `https://${process.env.S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
  }
  return { ...result, Location: url };
};

export const getFile = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME || '',
    Key: key,
  });
  return await getS3Client().send(command);
};

export const getPresignedUrl = async (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME || '',
    Key: key,
  });
  return await getSignedUrl(getS3Client(), command, { expiresIn });
};

export const deleteFile = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME || '',
    Key: key,
  });
  return await getS3Client().send(command);
};

export default getS3Client();
