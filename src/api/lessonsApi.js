// /home/ec2-user/Computer_Organization_Course/src/api/lessonsApi.js

import express from 'express';
import storage from '../storage.server.js';
import { randomUUID } from 'crypto';

const router = express.Router();

router.get('/', async (req, res) => {
  const data = await storage.getAll('lessonsData') || {};
  const lessons = data.lessons || [];
  res.json(lessons);
});


// POST /api/lessons - יצירת שיעור חדש (אם תרצה לאפשר את זה)
router.post('/', async (req, res) => {
  const newLesson = req.body;
  const data = await storage.getAll('lessonsData') || { lessons: [] };
  const arr = data.lessons || [];

  const lessonToAdd = {
    id: randomUUID(),
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    ...newLesson,
  };
  arr.push(lessonToAdd);
  data.lessons = arr;

  await storage.setAll('lessonsData', data);
  return res.status(201).json(lessonToAdd);
});

// PUT /api/lessons/:id - עדכון שיעור
router.put('/:id', async (req, res) => {
  const lessonId = req.params.id;
  const updatedFields = req.body;

  const data = await storage.getAll('lessonsData') || { lessons: [] };
  let arr = data.lessons || [];

  arr = arr.map(lesson => {
    if (lesson.id === lessonId) {
      return {
        ...lesson,
        ...updatedFields,
        updated_date: new Date().toISOString(),
      };
    }
    return lesson;
  });

  data.lessons = arr;
  await storage.setAll('lessonsData', data);
  res.json({ success: true });
});

// DELETE /api/lessons/:id
router.delete('/:id', async (req, res) => {
  const lessonId = req.params.id;
  const data = await storage.getAll('lessonsData') || { lessons: [] };
  let arr = data.lessons || [];

  arr = arr.filter(lesson => lesson.id !== lessonId);
  data.lessons = arr;

  await storage.setAll('lessonsData', data);
  res.json({ success: true });
});

export default router;
