// /home/ec2-user/Computer_Organization_Course/src/api/examsApi.js

import express from 'express';
import storage from '../storage.server.js';
import { randomUUID } from 'crypto';

const router = express.Router();

// GET: החזרת כל המבחנים
router.get('/', async (req, res) => {
  const data = await storage.getAll('exams');
  if (!data) return res.json([]);
  res.json(data.exams || []);
});

// POST: יצירת מבחן חדש
router.post('/', async (req, res) => {
  const newExam = req.body;
  const data = await storage.getAll('exams') || { exams: [] };
  const arr = data.exams || [];

  const examToAdd = {
    id: randomUUID(),
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    ...newExam,
  };
  arr.push(examToAdd);
  data.exams = arr;

  await storage.setAll('exams', data);
  res.status(201).json(examToAdd);
});

// PUT: עדכון מבחן
router.put('/:id', async (req, res) => {
  const examId = req.params.id;
  const updatedFields = req.body;

  const data = await storage.getAll('exams') || { exams: [] };
  let arr = data.exams || [];

  arr = arr.map(ex => {
    if (ex.id === examId) {
      return {
        ...ex,
        ...updatedFields,
        updated_date: new Date().toISOString(),
      };
    }
    return ex;
  });

  data.exams = arr;
  await storage.setAll('exams', data);
  res.json({ success: true });
});

// DELETE: מחיקת מבחן
router.delete('/:id', async (req, res) => {
  const examId = req.params.id;
  const data = await storage.getAll('exams') || { exams: [] };
  let arr = data.exams || [];

  arr = arr.filter(ex => ex.id !== examId);
  data.exams = arr;

  await storage.setAll('exams', data);
  res.json({ success: true });
});

export default router;
