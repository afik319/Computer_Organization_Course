import storage from "./storage";
import lessonsData from '../data/lessonsData.json';
import { generateId } from "@/utils/utils";
import courseContentData from "../data/courseContent.json";
import { User } from "./User";

// Lesson
export class Lesson {
    constructor({
        title = "",
        description = "",
        topic = "",
        video_url = "",
        attachments = [],
        order = 0,
        id = null,
        created_date = new Date().toISOString(),
        updated_date = new Date().toISOString(),
        created_by = null,
    }) {
        this.id = id;
        this.created_date = created_date;
        this.updated_date = updated_date;
        this.created_by = created_by;

        this.title = title;
        this.description = description;
        this.topic = topic;
        this.video_url = video_url;
        this.attachments = attachments;
        this.order = order;
    }

    addAttachment({ title, file_url, type }) {
        if (["presentation", "pdf", "other"].includes(type)) {
            this.attachments.push({ title, file_url, type });
        } else {
            throw new Error(`Invalid attachment type: ${type}`);
        }
    }

    static getAllLessons() {
        return lessonsData.lessons.map(data => new Lesson(data));
    }

    static async delete(lessonId) {
        const response = await fetch(`/api/lessons/${lessonId}`, {
            method: 'DELETE',
        });
    
        if (!response.ok) {
            throw new Error(`Failed to delete lesson with ID ${lessonId}`);
        }
    }
    
}


export class Exam {
    static async list() {
      const response = await fetch('/api/exams');
        if (!response.ok) throw new Error('Failed to fetch exams');
        return await response.json();
    }
  
    static async create(newExam) {
      const response = await fetch('/api/exams', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(newExam),
      });
      if (!response.ok) throw new Error('Failed to create exam');
      return response.json();
    }
  
    static async update(id, updatedExam) {
      const response = await fetch(`/api/exams/${id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(updatedExam),
      });
      if (!response.ok) throw new Error('Failed to update exam');
      return response.json();
    }
  
    static async delete(id) {
      const response = await fetch(`/api/exams/${id}`, {
         method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete exam');
      return response.json();
    }
  }
  
  export const ExamResult = {
    exam_id: "",
    score: 0,
    answers: [],
    completed_date: "",
    id: "",
    created_date: "",
    updated_date: "",
    created_by: "",

    // קריאה מה-API (GET)
    list: async () => {
        try {
            const response = await fetch('/api/exam-results');
            if (!response.ok) throw new Error('Failed to fetch exam results');
            const results = await response.json();

            // שמור רק את התוצאה האחרונה של כל מבחן עבור כל משתמש
            const latestResults = results.reduce((acc, result) => {
                const key = `${result.exam_id}_${result.created_by}`;
                if (!acc[key] || new Date(result.created_date) > new Date(acc[key].created_date)) {
                    acc[key] = result;
                }
                return acc;
            }, {});

            return Object.values(latestResults);
        } catch (error) {
            console.error('Failed to load exam results:', error);
            return [];
        }
    },

    // יצירה או עדכון של תוצאה (POST)
    create: async (result) => {
        try {
            const response = await fetch('/api/exam-results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result)
            });

            if (!response.ok) throw new Error('Failed to save exam result');
                return await response.json();
        } catch (error) {
            console.error('Failed to create exam result:', error);
            return null;
        }
    },

    // עדכון תוצאה קיימת
    update: async (id, updatedFields) => {
        try {
            const result = await ExamResult.create({ id, ...updatedFields });
            return result;
        } catch (error) {
            console.error('Failed to update exam result:', error);
            return null;
        }
    },

    // מחיקת תוצאה
    remove: async (id) => {
        try {
            const response = await fetch(`/api/exam-results/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete exam result');
        } catch (error) {
            console.error('Failed to delete exam result:', error);
        }
    }
};
    
export const RegisteredUser = {
    list: async () => {
      const response = await fetch('/api/registered-users');
      return response.json();
    },
  
    create: async (user) => {
      const response = await fetch('/api/registered-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      return response.json();
    },
  
    update: async (id, updatedFields) => {
      const response = await fetch(`/api/registered-users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      return response.json();
    },
  
    remove: async (id) => {
      await fetch(`/api/registered-users/${id}`, {
        method: 'DELETE'
      });
    },
  
    filter: async (criteria) => {
      const users = await RegisteredUser.list();
      return users.filter(user =>
        Object.entries(criteria).every(([key, value]) => user[key] === value)
      );
    },
  };

export const CourseContent = {
    title: "",
    description: "",
    last_updated: "",
    updated_by: "",
    id: "",
    created_date: "",
    updated_date: "",
    created_by: "",

    list: async () => {
        const content = storage.get("courseContent");
        if (!content || !content.length) {
            storage.set("courseContent", courseContentData.courseContent);
            return courseContentData.courseContent;
        }
        return content;
    },

    create: async (course) => {
        const content = storage.get("courseContent") || [];
        const newCourse = { 
            id: generateId(),
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString(),
            ...course 
        };
        content.push(newCourse);
        storage.set("courseContent", content);
        return newCourse;
    },

    update: async (id, updatedFields) => {
        const content = storage.get("courseContent") || [];
        const index = content.findIndex((c) => c.id === id);
        if (index !== -1) {
            content[index] = { 
                ...content[index], 
                ...updatedFields, 
                updated_date: new Date().toISOString() 
            };
            storage.set("courseContent", content);
            return content[index];
        }
        return null;
    },

    remove: async (id) => {
        let content = storage.get("courseContent") || [];
        content = content.filter((c) => c.id !== id);
        storage.set("courseContent", content);
    },

    filter: async (criteria) => {
        const content = await CourseContent.list();
        return content.filter((course) =>
            Object.entries(criteria).every(([key, value]) => course[key] === value)
        );
    }
};


export { User };