import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lessonsFilePath = path.join(__dirname, '../data/lessonsData.json');

const readLessonsFromFile = () => {
  try {
    const data = fs.readFileSync(lessonsFilePath, 'utf8');
    return JSON.parse(data).lessons || [];
  } catch (error) {
    console.error('❌ Error reading lessons file:', error);
    return [];
  }
};

// ✅ עדכון שיעור קיים לפי ID ושמירה לקובץ
const saveLessonsToFile = (lessons) => {
  try {
    const data = JSON.stringify({ lessons }, null, 2);
    fs.writeFileSync(lessonsFilePath, data, 'utf8');
    console.log('✅ Lessons saved successfully');
  } catch (error) {
    console.error('❌ Error saving lessons file:', error);
  }
};

// ✅ נקודת קצה לשליפת כל השיעורים
router.get('/lessons', (req, res) => {
  const lessons = readLessonsFromFile();
  res.status(200).json(lessons);
});

// ✅ נקודת קצה לעדכון שיעור
router.post('/update-lessons', (req, res) => {
  let lessonData = req.body;
  let lessons = readLessonsFromFile();

  // ✅ אם חסר מזהה – צור מזהה חדש
  if (!lessonData.id) {
    lessonData.id = uuidv4();
    lessonData.created_date = new Date().toISOString();
    lessonData.created_by = lessonData.created_by || 'system'; // ברירת מחדל
    console.log(`🆕 New lesson created with id: ${lessonData.id}`);
  }

  // ✅ עדכון זמן עדכון (updated_date) בכל שמירה
  lessonData.updated_date = new Date().toISOString();

  // 🔎 בדיקה אם השיעור כבר קיים לפי ID
  const index = lessons.findIndex(lesson => lesson.id === lessonData.id);

  if (index !== -1) {
    lessons[index] = {
      ...lessons[index],
      ...lessonData, // שמירה על השדות הקיימים בעדכון
    };
    console.log(`✅ Lesson updated: ${lessonData.id}`);
  } else {
    // ➕ אם לא קיים – צור שיעור חדש עם כל השדות הדרושים
    lessons.push({
      ...lessonData,
      title: lessonData.title || "",
      description: lessonData.description || "",
      topic: lessonData.topic || "",
      video_url: lessonData.video_url || "",
      attachments: lessonData.attachments || [],
      order: lessonData.order || 0,
      created_date: lessonData.created_date || new Date().toISOString(),
      updated_date: lessonData.updated_date || new Date().toISOString(),
      created_by: lessonData.created_by || "system",
      is_sample: lessonData.is_sample || false
    });
    console.log(`✅ New lesson added with ID: ${lessonData.id}`);
  }

  saveLessonsToFile(lessons);

  res.status(200).json({ message: 'Lesson updated successfully' });
});

router.delete('/lessons/:id', async (req, res) => {
  try {
      const { id } = req.params;

      // טען את כל השיעורים מהקובץ
      const lessonsData = JSON.parse(fs.readFileSync(lessonsFilePath));
      console.log('📂 Loaded lessonsData:', lessonsData);

      console.log(`🚮 Attempting to delete lesson with id: ${id}`);
      const updatedLessons = lessonsData.lessons.filter(lesson => lesson.id !== id);
      console.log('🗑️ Updated lessons:', updatedLessons);

      // ✅ עדכון הקובץ עם השיעורים אחרי המחיקה
      lessonsData.lessons = updatedLessons;
      fs.writeFileSync(lessonsFilePath, JSON.stringify(lessonsData, null, 2));

      console.log('✅ File updated successfully!');
      res.status(200).json({ success: true });
  } catch (err) {
      console.error('❌ Error deleting lesson:', err);
      res.status(500).json({ success: false, error: err.message });
  }
});


export default router;
