import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fromEnv } from '@aws-sdk/credential-providers'; // 👈 מוסיף את fromEnv
import express from 'express';

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromEnv() // 👈 קריאה אוטומטית מתוך הסביבה
});

router.get('/upload-url', async (req, res) => {
  try {
    const fileName = req.query.fileName || `upload_${Date.now()}`;
    const fileType = req.query.fileType || 'application/octet-stream';

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      ContentType: fileType
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    res.json({
      url: uploadUrl,
      key: fileName
    });
  } catch (err) {
    console.error('❌ Error generating upload URL:', err);
    res.status(500).json({ error: 'Failed to generate upload URL', details: err.message });
  }
});

export default router;
