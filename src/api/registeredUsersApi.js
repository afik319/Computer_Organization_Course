// /home/ec2-user/Computer_Organization_Course/src/api/registeredUsersApi.js

import express from 'express';
import storage from '../storage.server.js';
import crypto from 'crypto';
import { authenticateToken } from '../auth.js';

const router = express.Router();

// נתייחס לקובץ "registeredUsers.json" דרך המפתח storage: "registeredUsers"

router.get('/', async (req, res) => {
  const data = await storage.getAll('registeredUsers'); 
  // data אמור להיראות כמו { "registeredUsers": [ ... ] }
  if (!data) return res.json([]);
  res.json(data.registeredUsers || []);
});

// דוגמה פשוטה ליצירת משתמש (יכול לשמש כרישום בסיסי)
router.post('/', async (req, res) => {
  const newUser = req.body;
  const data = await storage.getAll('registeredUsers') || { registeredUsers: [] };
  const arr = data.registeredUsers || [];

  // יוצרים מזהות אקראית, אם אין כבר
  const userToAdd = {
    ...newUser,
    id: crypto.randomUUID(),
    created_date: new Date().toISOString(),
    status: 'pending',
  };

  arr.push(userToAdd);
  data.registeredUsers = arr;
  await storage.setAll('registeredUsers', data);

  return res.status(201).json(userToAdd);
});

// עדכון (PUT)
router.put('/:id', async (req, res) => {
  const userId = req.params.id;
  const updatedFields = req.body;

  const data = await storage.getAll('registeredUsers') || { registeredUsers: [] };
  let arr = data.registeredUsers || [];

  arr = arr.map(u => {
    if (u.id === userId) {
      return { 
        ...u, 
        ...updatedFields, 
        updated_date: new Date().toISOString() 
      };
    }
    return u;
  });

  data.registeredUsers = arr;
  await storage.setAll('registeredUsers', data);
  res.json({ success: true });
});

// מחיקה (DELETE)
router.delete('/:id', async (req, res) => {
  const userId = req.params.id;

  const data = await storage.getAll('registeredUsers') || { registeredUsers: [] };
  let arr = data.registeredUsers || [];
  arr = arr.filter(u => u.id !== userId);

  data.registeredUsers = arr;
  await storage.setAll('registeredUsers', data);

  res.json({ success: true });
});

/* --------------
   פונקציות מיוחדות
   -------------- */

// "login" (פשוטה/הדגמתית) - 
// כאן נניח שאנחנו מסמנים "currentUserEmail" כל עוד אין ניהול סשן
router.post('/login', async (req, res) => {
  const { email, fullName } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  const data = await storage.getAll('registeredUsers') || { registeredUsers: [] };
  let arr = data.registeredUsers || [];

  let user = arr.find(u => u.email === email);
  if (!user) {
    // נוצר משתמש חדש במצב pending
    user = {
      id: crypto.randomUUID(),
      email,
      full_name: fullName || '',
      status: 'pending',
      created_date: new Date().toISOString(),
    };
    arr.push(user);
  }

  // "מסמנים" את המשתמש הזה כ'נוכחי' בצורה נאיבית
  data.currentUserEmail = email;

  data.registeredUsers = arr;
  await storage.setAll('registeredUsers', data);

  res.json(user);
});

// logout
router.post('/logout', async (req, res) => {
  const data = await storage.getAll('registeredUsers') || {};
  delete data.currentUserEmail;
  await storage.setAll('registeredUsers', data);
  res.json({ success: true });
});


router.get('/me', authenticateToken, async (req, res) => {
  const email = req.user.email; // נשלף מה-JWT
  const data = await storage.getAll('registeredUsers') || { registeredUsers: [] };
  const user = data.registeredUsers.find(u => u.email === email);
  if (!user) 
    return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// approve
router.post('/approve', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  const data = await storage.getAll('registeredUsers') || { registeredUsers: [] };
  let arr = data.registeredUsers || [];
  arr = arr.map(u => (u.email === email ? { ...u, status: 'approved' } : u));

  data.registeredUsers = arr;
  await storage.setAll('registeredUsers', data);
  res.json({ success: true });
});

// reject
router.post('/reject', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  const data = await storage.getAll('registeredUsers') || { registeredUsers: [] };
  let arr = data.registeredUsers || [];
  arr = arr.filter(u => u.email !== email);

  data.registeredUsers = arr;
  await storage.setAll('registeredUsers', data);
  res.json({ success: true });
});

export default router;
