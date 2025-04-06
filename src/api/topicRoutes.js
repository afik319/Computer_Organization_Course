import { fileURLToPath } from 'url';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { logger } from '../lib/logger.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '../data/examTopics.json');

// קריאת רשימת הנושאים
router.get('/topics', (req, res) => {
  try {
    const data = fs.readFileSync(filePath);
    const topics = JSON.parse(data);
    res.json(topics);
  } catch (error) {
    logger.info('Error reading topics:', error);
    res.status(500).json({ error: 'Failed to load topics' });
  }
});

// הוספת נושא חדש
router.post('/topics', (req, res) => {
  try {
    const data = fs.readFileSync(filePath);
    const topics = JSON.parse(data);

    const newTopic = {
      id: topics.length > 0 ? topics[topics.length - 1].id + 1 : 1,
      label: req.body.label
    };

    topics.push(newTopic);
    fs.writeFileSync(filePath, JSON.stringify(topics, null, 2));
    res.json(newTopic);
  } catch (error) {
    logger.info('Error adding topic:', error);
    res.status(500).json({ error: 'Failed to add topic' });
  }
});

// מחיקת נושא
router.delete('/topics/:id', (req, res) => {
  try {
    const data = fs.readFileSync(filePath);
    let topics = JSON.parse(data);

    topics = topics.filter(topic => topic.id !== Number(req.params.id));

    fs.writeFileSync(filePath, JSON.stringify(topics, null, 2));
    res.json({ success: true });
  } catch (error) {
    logger.info('Error deleting topic:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

export default router;
