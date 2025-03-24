import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();
const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});
const BUCKET_NAME = process.env.AWS_PUBLIC_BUCKET_NAME;
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

// ✅ יצירת URL חתום לצפייה בקובץ
router.get('/get-file-url', async (req, res) => {
  try {
    const { fileName } = req.query;
    if (!fileName) throw new Error("Missing fileName parameter");

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName
    });

    // יוצרים URL חתום לקריאה (בתוקף של שעה)
    const fileUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.json({ url: fileUrl });
  } catch (err) {
    console.error("❌ Error generating file URL:", err);
    res.status(500).json({ error: 'Failed to generate file URL', details: err.message });
  }
});

router.post('/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const fileName = `lesson-${Date.now()}-${req.file.originalname}`;
    const params = {
      Bucket: BUCKET_NAME,
      Key: `uploads/${fileName}`,
      Body: req.file.buffer,
      ContentType: 'application/pdf',
      ACL: 'public-read',
    };

    // ✅ שימוש ב-PutObjectCommand במקום upload()
    const command = new PutObjectCommand(params);
    await s3.send(command);

    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${fileName}`;

    console.log('✅ PDF uploaded:', fileUrl);
    res.status(200).json({ url: fileUrl });
  } catch (err) {
    console.error('❌ Error uploading PDF:', err);
    res.status(500).json({ error: 'Failed to upload file', details: err.message });
  }
});



export default router;
