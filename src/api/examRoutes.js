import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// מצביע על C:\Users\afikr\Desktop\אתר\קוד\src\data\exams.json
const filePath = path.join(__dirname, '../data/exams.json');

/**
 * לקרוא את exams.json
 */
function readExamsFile() {
  const fileData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileData); // מחזיר אובייקט JS
}

/**
 * לכתוב בחזרה ל-exams.json
 */
function writeExamsFile(jsonObject) {
  fs.writeFileSync(filePath, JSON.stringify(jsonObject, null, 2), 'utf-8');
}

/** 
 * דוגמה לנתיב שמחזיר את כל הבחינות 
 */
router.get('/exams', (req, res) => {
  try {
    const data = readExamsFile();
    // ב-exams.json רואים שיש מבנה { "exams": [...], "examResults": [...] }
    // לכן נניח:
    const exams = data.exams || [];
    res.json(exams);
  } catch (err) {
    console.error('Error reading exams:', err);
    res.status(500).json({ error: 'Failed to read exams' });
  }
});

/**
 * עדכון בחינה קיימת (PUT /api/exams/:id)
 */
router.put('/exams/:id', (req, res) => {
  try {
    const id = req.params.id;
    const data = readExamsFile();
    const exams = data.exams || [];

    // מחפשים בחינה עם מזהה תואם
    const index = exams.findIndex(ex => ex.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // ניקח את הבחינה הקיימת, ונעדכן אותה בכל השדות שקיבלנו בגוף הבקשה (req.body).
    const existingExam = exams[index];
    const updatedExam = { 
      ...existingExam,
      ...req.body, 
      // אפשרויות נוספות (לשמור על id ישן, לעדכן תאריך עדכון וכו')
      updated_date: new Date().toISOString()
    };

    // שמירה במערך
    exams[index] = updatedExam;

    // כתיבה חזרה לקובץ
    data.exams = exams;
    writeExamsFile(data);

    // מחזירים ללקוח את האובייקט המעודכן
    return res.json(updatedExam);

  } catch (err) {
    console.error('Error updating exam:', err);
    res.status(500).json({ error: 'Failed to update exam' });
  }
});

/**
 * יצירת בחינה חדשה (POST /api/exams)
 */
router.post('/exams', (req, res) => {
  try {
    const data = readExamsFile();
    const exams = data.exams || [];

    // צור מזהה חדש לבחינה
    const newId = Date.now().toString();

    // בונים את האובייקט החדש
    const newExam = {
      ...req.body,
      id: newId,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };

    exams.push(newExam);
    data.exams = exams;
    writeExamsFile(data);

    return res.json(newExam);
  } catch (err) {
    console.error('Error creating exam:', err);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

/**
 * מחיקת בחינה (DELETE /api/exams/:id)
 */
router.delete('/exams/:id', (req, res) => {
  try {
    const id = req.params.id;
    const data = readExamsFile();
    const exams = data.exams || [];

    const filtered = exams.filter(ex => ex.id !== id);
    data.exams = filtered;
    writeExamsFile(data);

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting exam:', err);
    res.status(500).json({ error: 'Failed to delete exam' });
  }
});

router.get('/exam-results', (req, res) => {
  try {
      const data = readExamsFile();
      const results = data.examResults || [];
      res.json(results);
  } catch (err) {
      console.error('Error reading exam results:', err);
      res.status(500).json({ error: 'Failed to read exam results' });
  }
});

router.post('/exam-results', (req, res) => {
  try {
      const data = readExamsFile();
      const results = data.examResults || [];

      // חיפוש תוצאה קיימת
      const existingIndex = results.findIndex(
          r => r.exam_id === req.body.exam_id && r.created_by === req.body.created_by
      );

      if (existingIndex !== -1) {
          // אם יש תוצאה קיימת – נעדכן אותה
          results[existingIndex] = {
              ...results[existingIndex],
              ...req.body,
              updated_date: new Date().toISOString()
          };
      } else {
          // אם אין – ניצור חדשה
          const newResult = {
              ...req.body,
              id: req.body.id || Date.now().toString(),
              created_date: new Date().toISOString(),
              updated_date: new Date().toISOString()
          };
          results.push(newResult);
      }

      // שמירה בקובץ
      data.examResults = results;
      writeExamsFile(data);

      res.json({ success: true });
  } catch (err) {
      console.error('Error saving exam result:', err);
      res.status(500).json({ error: 'Failed to save exam result' });
  }
});


export default router;
