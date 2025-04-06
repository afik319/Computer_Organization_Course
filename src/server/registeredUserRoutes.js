import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { logger } from '../lib/logger.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../data/registeredUsers.json');
const SECRET_KEY = process.env.JWT_SECRET;

function readEntireData() {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    logger.info('❌ Error reading registeredUsers.json:', error);
    return {};
  }
}

function writeEntireData(obj) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf8');
    logger.info('✅ registeredUsers.json updated successfully');
  } catch (error) {
    logger.info('❌ Error saving registeredUsers.json:', error);
  }
}

function writeUsersArray(users) {
  const entireData = readEntireData();
  entireData.registeredUsers = users;
  writeEntireData(entireData);
}

function readUsersArray() {
  const entireData = readEntireData();
  return entireData.registeredUsers || [];
}

function authenticate(req, res, next) {
  const token = req.cookies?.token;

  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

router.get('/', authenticate, (req, res) => {
  const users = readUsersArray();
  res.status(200).json(users);
});

router.post('/', (req, res) => {
  const userData = req.body;
  const users = readUsersArray();

  const newUser = {
    email: userData.email || "",
    full_name: userData.full_name || "",
    status: userData.status || "pending",
    request_date: userData.request_date || new Date().toISOString(),
    approval_date: userData.approval_date || null,
    notes: userData.notes || "",
    id: uuidv4(),
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    created_by: userData.created_by || "system"
  };

  users.push(newUser);
  writeUsersArray(users);

  logger.info('✅ New user created:', newUser);
  res.status(201).json(newUser);
});

router.put('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;
  const users = readUsersArray();

  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users[index] = {
      ...users[index],
      ...updatedFields,
      updated_date: new Date().toISOString()
    };
    writeUsersArray(users);
    logger.info(`✅ User updated: ${id}`);
    res.status(200).json(users[index]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.delete('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  let users = readUsersArray();

  const initialLength = users.length;
  users = users.filter(user => user.id !== id);

  if (users.length < initialLength) {
    writeUsersArray(users);
    logger.info(`✅ User deleted: ${id}`);
    res.status(200).json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.post('/login', (req, res) => {
  const { email, fullName } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  const users = readUsersArray();
  let user = users.find(u => u.email === email);

  if (!user) {
    user = {
      id: uuidv4(),
      email,
      full_name: fullName || '',
      status: 'pending',
      created_date: new Date().toISOString(),
    };
    users.push(user);
    writeUsersArray(users);
  }

  const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '7d' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,          // חובה בפרודקשן עם HTTPS
    sameSite: 'Strict',    // מונע שליחת הטוקן בין דומיינים
    maxAge: 1000 * 60 * 60 * 12 // 12 שעות
  });

  res.status(200).json({ 
    success: true,
    user
  });
});

  router.get('/me', authenticate, (req, res) => {
    const users = readUsersArray();
    const user = users.find(u => u.email === req.user.email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  });

  router.post('/logout', (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });
    res.status(200).json({ success: true });
  });  

export default router;
