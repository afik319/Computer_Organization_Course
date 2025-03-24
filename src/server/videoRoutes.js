import express from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fromEnv } from '@aws-sdk/credential-providers';

const router = express.Router();

// הגדרת S3Client עם Transfer Acceleration אם מופעל
const s3 = new S3Client({
  region: process.env.VITE_AWS_REGION,
  credentials: fromEnv(),
  useAccelerateEndpoint: true,
});

router.get('/get-video-link', async (req, res) => {
  try {
    const videoKey = req.query.fileName || 'pipeline-part-c-cycles45.mp4';

    const command = new GetObjectCommand({
      Bucket: process.env.VITE_AWS_BUCKET_NAME,
      Key: videoKey,
    });

    // יוצרים URL חתום בתוקף של 3600 שניות (שעה)
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.json({ success: true, url });
  } catch (err) {
    console.error('❌ Error generating presigned URL:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
