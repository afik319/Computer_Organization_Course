import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './lib/logger.js';

// הגדרת __dirname באמצעות import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileMapping = {
  courseContent: 'courseContent.json',
  exams: 'exams.json',
  examTopics: 'examTopics.json',
  lessonsData: 'lessonsData.json',
  registeredUsers: 'registeredUsers.json',
};

const storage = {
  getAll: async (key) => {
    try {
      if (!fileMapping[key]) {
        logger.info(`❌ Invalid key [${key}] - not mapped to any file`);
        return [];
      }
  
      const filePath = path.resolve(__dirname, 'data', fileMapping[key]);
      logger.info(`➡️ Attempting to read file: ${filePath}`);
  
      const data = await fs.readFile(filePath, 'utf8');
  
      const json = JSON.parse(data);
  
      return json[key] || []; 
    } catch (error) {
      logger.info(`❌ Failed to read ${key}:`, error);
      return [];
    }
  },
  
  


  setAll: async (key, data) => {
    try {
      if (!fileMapping[key]) {
        logger.info(`❌ Invalid key [${key}] - not mapped to any file`);
        return;
      }

      const filePath = path.resolve(__dirname, 'data', fileMapping[key]);
      logger.info(`➡️ Attempting to write file: ${filePath}`);

      const json = { [key]: data };
      await fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8');

      logger.info(`✅ Data written to file [${filePath}]`);
    } catch (error) {
      logger.info(`❌ Failed to write ${key}:`, error);
    }
  }
};

export default storage;
