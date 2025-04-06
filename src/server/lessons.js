import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '@/lib/logger.js';

const router = express.Router();

const jsonPath = path.join(__dirname, '../data/lessonsData.json');

router.post('/update-lessons', async (req, res) => {
  try {
    await fs.writeFile(jsonPath, JSON.stringify(req.body, null, 2));
    res.status(200).json({ success: true });
  } catch (err) {
    logger.info('Error updating lessons:', err);
    res.status(500).json({ error: 'Failed to update lessons' });
  }
});

export default router;
