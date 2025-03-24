import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import uploadRouter from './upload.js'; 
import dotenv from 'dotenv';
import path from 'path';
import videoRouter from './videoRoutes.js';
import topicRouter from '../api/topicRoutes.js';
import examRouter from '../api/examRoutes.js'; 
import lessonRouter from './lessonRoutes.js'; 
import registeredUserRoutes from './registeredUserRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// ✅ רישום כל הנתיבים כראוטרים באפליקציה
app.use('/api', uploadRouter);
app.use('/api', videoRouter);
app.use('/api', topicRouter);
app.use('/api', examRouter);
app.use('/api', lessonRouter); 
app.use('/api', registeredUserRoutes);

app.use('/data', express.static(path.join(__dirname, 'data')));

app.use(express.static(path.join(__dirname, '..', '..', 'dist')));

// fallback route לכל בקשה שלא תואמת – מחזיר את index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
