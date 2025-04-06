import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import uploadRouter from './src/server/upload.js'; 
import dotenv from 'dotenv';
import path from 'path';
import videoRouter from './src/server/videoRoutes.js';
import topicRouter from './src/api/topicRoutes.js';
import examRouter from './src/api/examRoutes.js'; 
import lessonRouter from './src/server/lessonRoutes.js'; 
import registeredUserRoutes from './src/server/registeredUserRoutes.js';
import courseContentRouter from './src/api/courseContentApi.js';
import examTopicsRouter from './src/api/examTopicsApi.js';
import cookieParser from 'cookie-parser';
import { logger } from './src/lib/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cookieParser());
app.use(cors());
app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ limit: '300mb', extended: true }));
app.use('/api', uploadRouter);
app.use('/api', videoRouter);
app.use('/api', topicRouter);
app.use('/api/lessons', lessonRouter);
app.use('/api/registered-users', registeredUserRoutes);
app.use('/api/course-content', courseContentRouter);
app.use('/api/exams', examRouter);
app.use('/api/exam-topics', examTopicsRouter);
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use('/api', (req, res) => {
  logger.info(`❌ 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'API endpoint not found' });
});

console.log("\ud83d\ude80 Starting server...");
logger.info(`🚀 Starting server...`);
app.listen(3001, '0.0.0.0', (err) => {
  if (err) {
    console.log("\u274c Failed to start server:", err);
    logger.info(`❌ Failed to start server: ${err}`);
  } else {
    console.log(`\u2705 Server running on port 3001`);
    logger.info(`✅ Server running on port 3001`);
  }
});
console.log("\ud83d\udc49 After app.listen()")
logger.info(`🚀 After app.listen()`);
