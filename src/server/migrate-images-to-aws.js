import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { logger } from '../lib/logger.js';

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const PREFIX = 'uploads/';

async function setPublicRead() {
  try {
    logger.info(`🔍 Fetching files from bucket: ${BUCKET_NAME}/${PREFIX}`);

    // שליפת כל הקבצים בתיקייה 'uploads'
    const listObjects = await s3.listObjectsV2({
      Bucket: BUCKET_NAME,
      Prefix: PREFIX
    }).promise();

    if (!listObjects.Contents || listObjects.Contents.length === 0) {
      logger.info('🚫 No files found.');
      return;
    }

    for (const file of listObjects.Contents) {
      logger.info(`🚀 Setting public-read permission for: ${file.Key}`);

      // שינוי ה-ACL ל-public-read
      await s3.putObjectAcl({
        Bucket: BUCKET_NAME,
        Key: file.Key,
        ACL: 'public-read'
      }).promise();

      logger.info(`✅ ${file.Key} is now public-read`);
    }

    logger.info('🎉 All files have been set to public-read!');
  } catch (err) {
    logger.info(`❌ Error: ${err.message}`);
  }
}

setPublicRead();
