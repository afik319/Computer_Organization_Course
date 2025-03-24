import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../data/registeredUsers.json');

const readDataFromFile = () => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data).registeredUsers || [];
  } catch (error) {
    console.error('❌ Error reading registeredUsers.json:', error);
    return [];
  }
};

const writeDataToFile = (data) => {
  try {
    fs.writeFileSync(
      filePath,
      JSON.stringify({ registeredUsers: data }, null, 2),
      'utf8'
    );
    console.log('✅ registeredUsers.json updated successfully');
  } catch (error) {
    console.error('❌ Error saving registeredUsers.json:', error);
  }
};

// ✅ שליפת כל המשתמשים
router.get('/registered-users', (req, res) => {
  const users = readDataFromFile();
  res.status(200).json(users);
});

// ✅ יצירת משתמש חדש
router.post('/registered-users', (req, res) => {
  const userData = req.body;
  const users = readDataFromFile();

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
  writeDataToFile(users);

  console.log('✅ New user created:', newUser);
  res.status(201).json(newUser);
});

// ✅ עדכון משתמש קיים
router.put('/registered-users/:id', (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;
  const users = readDataFromFile();

  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users[index] = {
      ...users[index],
      ...updatedFields,
      updated_date: new Date().toISOString()
    };
    writeDataToFile(users);
    console.log(`✅ User updated: ${id}`);
    res.status(200).json(users[index]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// ✅ מחיקת משתמש
router.delete('/registered-users/:id', (req, res) => {
  const { id } = req.params;
  let users = readDataFromFile();

  const initialLength = users.length;
  users = users.filter(user => user.id !== id);

  if (users.length < initialLength) {
    writeDataToFile(users);
    console.log(`✅ User deleted: ${id}`);
    res.status(200).json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

export default router;
