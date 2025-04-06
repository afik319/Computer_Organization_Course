import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../lib/logger.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lessonsFilePath = path.join(__dirname, '../data/lessonsData.json');

const readLessonsFromFile = () => {
  try {
    const data = fs.readFileSync(lessonsFilePath, 'utf8');
    return JSON.parse(data).lessons || [];
  } catch (error) {
    logger.info('❌ Error reading lessons file:', error);
    return [];
  }
};

const saveLessonsToFile = (lessons) => {
  try {
    const data = JSON.stringify({ lessons }, null, 2);
    fs.writeFileSync(lessonsFilePath, data, 'utf8');
    logger.info('✅ Lessons saved successfully');
  } catch (error) {
    logger.info('❌ Error saving lessons file:', error);
  }
};

// ✅ שליפת כל השיעורים
router.get('/', (req, res) => {
  const lessons = readLessonsFromFile();
  res.status(200).json(lessons);
});

// ✅ שליפת שיעור בודד לפי מזהה
router.get('/:id', (req, res) => {
  const lessons = readLessonsFromFile();
  const lesson = lessons.find(l => l.id === req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }
  res.status(200).json(lesson);
});

// ✅ יצירת שיעור חדש בלבד (ללא עדכון)
router.post('/', (req, res) => {
  let lessonData = req.body;
  let lessons = readLessonsFromFile();

  if (lessonData.id) {
    return res.status(400).json({ error: 'POST request should not include ID' });
  }

  const newLesson = {
    ...lessonData,
    id: uuidv4(),
    title: lessonData.title || "",
    description: lessonData.description || "",
    topic: lessonData.topic || "",
    video_url: lessonData.video_url || "",
    attachments: lessonData.attachments || [],
    order: lessonData.order || 0,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    created_by: lessonData.created_by || 'system',
    is_sample: lessonData.is_sample || false
  };

  lessons.push(newLesson);
  saveLessonsToFile(lessons);

  logger.info(`🆕 New lesson created with id: ${newLesson.id}`);
  res.status(201).json(newLesson);
});

// ✅ עדכון שיעור לפי מזהה
router.put('/:id', (req, res) => {
  const lessonId = req.params.id;
  const updatedData = req.body;

  let lessons = readLessonsFromFile();
  const index = lessons.findIndex(l => l.id === lessonId);
  if (index === -1) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  lessons[index] = {
    ...lessons[index],
    ...updatedData,
    updated_date: new Date().toISOString()
  };

  saveLessonsToFile(lessons);
  res.status(200).json({ message: 'Lesson updated successfully' });
});

// ✅ מחיקת שיעור לפי מזהה
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lessonsData = JSON.parse(fs.readFileSync(lessonsFilePath));

    logger.info(`🚮 Attempting to delete lesson with id: ${id}`);
    const updatedLessons = lessonsData.lessons.filter(lesson => lesson.id !== id);
    lessonsData.lessons = updatedLessons;

    fs.writeFileSync(lessonsFilePath, JSON.stringify(lessonsData, null, 2));
    logger.info('✅ File updated successfully!');
    res.status(200).json({ success: true });
  } catch (err) {
    logger.info('❌ Error deleting lesson:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;