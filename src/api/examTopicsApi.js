// /home/ec2-user/Computer_Organization_Course/src/api/examTopicsApi.js

import express from 'express';
import storage from '../storage.server.js';
import { randomUUID } from 'crypto';

const router = express.Router();

// GET
router.get('/', async (req, res) => {
  // נשים במיפוי ב- storage.server.js את: examTopics: 'examTopics.json'
  const topics = await storage.getAll('examTopics');
  // במקרה שהקובץ הוא *רק* מערך, נצטרך להתייחס לסיטואציה: 
  if (!Array.isArray(topics)) {
    return res.json([]); 
  }
  res.json(topics);
});

// אפשר להוסיף פה POST/PUT/DELETE אם צריך לאפשר CRUD על רשימת הנושאים
router.post('/', async (req, res) => {
  const newTopic = req.body;
  let topics = await storage.getAll('examTopics');
  if (!Array.isArray(topics)) {
    topics = [];
  }

  const topicToAdd = {
    ...newTopic,
    uuid: randomUUID(),
  };
  topics.push(topicToAdd);

  await storage.setAll('examTopics', topics);
  res.status(201).json(topicToAdd);
});

export default router;
