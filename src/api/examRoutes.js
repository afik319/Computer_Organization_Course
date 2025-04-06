import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const examsPath = path.join(__dirname, '../data/exams.json');
const resultsPath = path.join(__dirname, '../data/ExamResults.json');

function readExamsFile() {
  try {
    if (!fs.existsSync(examsPath)) {
      fs.writeFileSync(examsPath, JSON.stringify({ exams: [] }, null, 2));
    }
    const fileData = fs.readFileSync(examsPath, 'utf-8');
    const parsed = JSON.parse(fileData);
    return parsed && typeof parsed === 'object' ? parsed : { exams: [] };
  } catch (err) {
    console.log('Error initializing exams.json:', err);
    return { exams: [] };
  }
}

function readResultsFile() {
  const fileData = fs.readFileSync(resultsPath, 'utf-8');
  return JSON.parse(fileData); 
}

function writeResultsFile(jsonObject) {
  fs.writeFileSync(resultsPath, JSON.stringify(jsonObject, null, 2), 'utf-8');
}

// GET /api/exams
router.get('/', (req, res) => {
  try {
    const data = readExamsFile();
    res.json(data.exams || []);
  } catch (err) {
    console.log('Error reading exams:', err);
    res.status(500).json({ error: 'Failed to read exams' });
  }
});

// POST /api/exams
router.post('/', (req, res) => {
  try {
    const data = readExamsFile();
    const exams = data.exams || [];

    const newExam = {
      id: Date.now().toString(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      ...req.body,
    };

    exams.push(newExam);
    fs.writeFileSync(examsPath, JSON.stringify({ exams }, null, 2), 'utf-8');

    res.status(201).json(newExam);
  } catch (err) {
    console.log('Error creating exam:', err);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

// PUT /api/exams/:id
router.put('/:id', (req, res) => {
  try {
    const examId = req.params.id;
    const updatedFields = req.body;

    const data = readExamsFile();
    let exams = data.exams || [];

    let updated = false;
    exams = exams.map(exam => {
      if (exam.id === examId) {
        updated = true;
        return {
          ...exam,
          ...updatedFields,
          updated_date: new Date().toISOString(),
        };
      }
      return exam;
    });

    if (!updated) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    fs.writeFileSync(examsPath, JSON.stringify({ exams }, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err) {
    console.log('Error updating exam:', err);
    res.status(500).json({ error: 'Failed to update exam' });
  }
});

// DELETE /api/exams/:id
router.delete('/:id', (req, res) => {
  try {
    const examId = req.params.id;
    const data = readExamsFile();
    let exams = data.exams || [];

    const filtered = exams.filter(exam => exam.id !== examId);
    if (filtered.length === exams.length) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    fs.writeFileSync(examsPath, JSON.stringify({ exams: filtered }, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err) {
    console.log('Error deleting exam:', err);
    res.status(500).json({ error: 'Failed to delete exam' });
  }
});

// GET /api/exams/results
router.get('/results', (req, res) => {
  try {
    const data = readResultsFile();
    res.json(data.examResults || []);
  } catch (err) {
    console.log('Error reading exam results:', err);
    res.status(500).json({ error: 'Failed to read exam results' });
  }
});

// POST /api/exams/results
router.post('/results', (req, res) => {
  try {
    const data = readResultsFile();
    let results = data.examResults || [];

    results = results.filter(result => !(result.exam_id === req.body.exam_id && result.created_by === req.body.created_by));

    const newResult = {
      ...req.body,
      id: req.body.id || Date.now().toString(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };

    results.push(newResult);
    data.examResults = results;
    writeResultsFile(data);

    res.json({ success: true, newResult });
  } catch (err) {
    console.log('Error saving exam result:', err);
    res.status(500).json({ error: 'Failed to save exam result' });
  }
});

// PUT /api/exams/results/:id
router.put('/results/:id', (req, res) => {
  try {
    const resultId = req.params.id;
    const updatedFields = req.body;

    const data = readResultsFile();
    let results = data.examResults || [];

    let updated = false;
    results = results.map(result => {
      if (result.id === resultId) {
        updated = true;
        return {
          ...result,
          ...updatedFields,
          updated_date: new Date().toISOString()
        };
      }
      return result;
    });

    if (!updated) {
      return res.status(404).json({ error: 'Result not found' });
    }

    data.examResults = results;
    writeResultsFile(data);
    res.json({ success: true });
  } catch (err) {
    console.log('Error updating exam result:', err);
    res.status(500).json({ error: 'Failed to update exam result' });
  }
});

// DELETE /api/exams/results/:id
router.delete('/results/:id', (req, res) => {
  try {
    const resultId = req.params.id;
    const data = readResultsFile();
    const before = data.examResults || [];
    const after = before.filter(result => result.id !== resultId);

    if (after.length === before.length) {
      return res.status(404).json({ error: 'Result not found' });
    }

    data.examResults = after;
    writeResultsFile(data);
    res.json({ success: true });
  } catch (err) {
    console.log('Error deleting exam result:', err);
    res.status(500).json({ error: 'Failed to delete exam result' });
  }
});

export default router;
