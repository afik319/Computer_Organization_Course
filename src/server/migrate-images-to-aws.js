import AWS from 'aws-sdk';
import dotenv from 'dotenv';

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
    console.log(`🔍 Fetching files from bucket: ${BUCKET_NAME}/${PREFIX}`);

    // שליפת כל הקבצים בתיקייה 'uploads'
    const listObjects = await s3.listObjectsV2({
      Bucket: BUCKET_NAME,
      Prefix: PREFIX
    }).promise();

    if (!listObjects.Contents || listObjects.Contents.length === 0) {
      console.log('🚫 No files found.');
      return;
    }

    for (const file of listObjects.Contents) {
      console.log(`🚀 Setting public-read permission for: ${file.Key}`);

      // שינוי ה-ACL ל-public-read
      await s3.putObjectAcl({
        Bucket: BUCKET_NAME,
        Key: file.Key,
        ACL: 'public-read'
      }).promise();

      console.log(`✅ ${file.Key} is now public-read`);
    }

    console.log('🎉 All files have been set to public-read!');
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
  }
}

setPublicRead();
