import express from 'express';
import storage from '../storage.server.js';
import { randomUUID } from 'crypto';
import { logger } from '../lib/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await storage.getAll('courseContent');
    //logger.info("✅ Course content data from storage:", data);

    if (data && Array.isArray(data)) {
      return res.json(data); 
    }

    logger.info("❌ No course content found");
    res.json([]); 
  } catch (error) {
    logger.info("❌ Failed to load course content:", error);
    res.status(500).json({ error: 'Failed to load course content' });
  }
});

// ✅ POST: הוספת פריט חדש
router.post('/', async (req, res) => {
  try {
    const newItem = req.body;
    const data = await storage.getAll('courseContent') || [];

    const itemToAdd = {
      id: randomUUID(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      ...newItem,
    };

    data.push(itemToAdd);
    await storage.setAll('courseContent', data);

    res.status(201).json(itemToAdd);
  } catch (error) {
    logger.info("❌ Failed to add course content:", error);
    res.status(500).json({ error: 'Failed to add course content' });
  }
});

// ✅ PUT: עדכון פריט קיים לפי :id
router.put('/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const updatedFields = req.body;
    const data = await storage.getAll('courseContent') || [];

    const updatedData = data.map(item => 
      item.id === itemId ? { ...item, ...updatedFields, updated_date: new Date().toISOString() } : item
    );

    await storage.setAll('courseContent', updatedData);
    res.json({ success: true });
  } catch (error) {
    logger.info("❌ Failed to update course content:", error);
    res.status(500).json({ error: 'Failed to update course content' });
  }
});

// ✅ DELETE: מחיקת פריט לפי :id
router.delete('/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const data = await storage.getAll('courseContent') || [];

    const updatedData = data.filter(item => item.id !== itemId);

    await storage.setAll('courseContent', updatedData);
    res.json({ success: true });
  } catch (error) {
    logger.info("❌ Failed to delete course content:", error);
    res.status(500).json({ error: 'Failed to delete course content' });
  }
});

export default router;
