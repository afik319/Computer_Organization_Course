import express from 'express';
import cors from 'cors';
import uploadRouter from './upload.js'; 
import dotenv from 'dotenv';
import path from 'path';
import videoRouter from './videoRoutes.js';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', uploadRouter);
app.use('/api', videoRouter);

// --- הגשת קבצים סטטיים ---
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '..', '..', 'dist')));

// fallback route לכל בקשה שלא תואמת – מחזיר את index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
