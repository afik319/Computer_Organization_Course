import express from 'express';
import storage from '../storage.server.js';
import { randomUUID } from 'crypto';

const router = express.Router();

// GET כל התוצאות
router.get('/', async (req, res) => {
  const data = await storage.getAll('examResults');
  if (!data) return res.json([]);
  res.json(data.examResults || []);
});

// POST יצירת תוצאה חדשה
router.post('/', async (req, res) => {
  const newResult = req.body;
  const data = await storage.getAll('examResults') || { examResults: [] };
  const arr = data.examResults || [];

  const resultToAdd = {
    id: randomUUID(),
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    ...newResult,
  };
  arr.push(resultToAdd);
  data.examResults = arr;

  await storage.setAll('examResults', data);
  res.status(201).json(resultToAdd);
});

// PUT עדכון תוצאה
router.put('/:id', async (req, res) => {
  const resultId = req.params.id;
  const updatedFields = req.body;

  const data = await storage.getAll('examResults') || { examResults: [] };
  let arr = data.examResults || [];

  arr = arr.map(r => {
    if (r.id === resultId) {
      return {
        ...r,
        ...updatedFields,
        updated_date: new Date().toISOString(),
      };
    }
    return r;
  });

  data.examResults = arr;
  await storage.setAll('examResults', data);
  res.json({ success: true });
});

// DELETE מחיקת תוצאה
router.delete('/:id', async (req, res) => {
  const resultId = req.params.id;

  const data = await storage.getAll('examResults') || { examResults: [] };
  let arr = data.examResults || [];
  arr = arr.filter(r => r.id !== resultId);

  data.examResults = arr;
  await storage.setAll('examResults', data);
  res.json({ success: true });
});

export default router;
