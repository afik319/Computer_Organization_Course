// src/api/entities.js

// ──────────────────────────────────────────────────────────────
// אין יותר localStorage או getAuthHeaders. הכול לפי credentials + headers
// ──────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────
// 1) שיעורים (Lesson)
// ──────────────────────────────────────────────────────────────
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

  static async getAllLessons() {
    try {
      const res = await fetch('/api/lessons', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch lessons');
      const data = await res.json();
      return data.map(d => new Lesson(d));
    } catch (err) {
      console.log('Error fetching lessons:', err);
      return [];
    }
  }

  static async delete(lessonId) {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to delete lesson with ID ${lessonId}`);
      }
    } catch (err) {
      console.log('Error deleting lesson:', err);
    }
  }

  static async create(newLesson) {
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newLesson)
      });
      if (!res.ok) throw new Error('Failed to create lesson');
      return await res.json();
    } catch (err) {
      console.log('Error creating lesson:', err);
      throw err;
    }
  }

  static async update(lessonId, updatedLesson) {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedLesson)
      });
      if (!res.ok) throw new Error('Failed to update lesson');
      return await res.json();
    } catch (err) {
      console.log('Error updating lesson:', err);
      throw err;
    }
  }
}

// ──────────────────────────────────────────────────────────────
// 2) מבחנים (Exam)
// ──────────────────────────────────────────────────────────────
export class Exam {
  static async list() {
    const response = await fetch('/api/exams', {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch exams');
    return await response.json();
  }

  static async create(newExam) {
    const response = await fetch('/api/exams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(newExam),
    });
    if (!response.ok) throw new Error('Failed to create exam');
    return response.json();
  }

  static async update(id, updatedExam) {
    const response = await fetch(`/api/exams/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(updatedExam),
    });
    if (!response.ok) throw new Error('Failed to update exam');
    return response.json();
  }

  static async delete(id) {
    const response = await fetch(`/api/exams/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete exam');
    return response.json();
  }
}

// ──────────────────────────────────────────────────────────────
// 3) תוצאות מבחן (ExamResult)
// ──────────────────────────────────────────────────────────────
export const ExamResult = {
  list: async () => {
    try {
      const response = await fetch('/api/exams/results', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch exam results');
      const results = await response.json();

      const latestResults = results.reduce((acc, result) => {
        const key = `${result.exam_id}_${result.created_by}`;
        if (!acc[key] || new Date(result.created_date) > new Date(acc[key].created_date)) {
          acc[key] = result;
        }
        return acc;
      }, {});
      return Object.values(latestResults);
    } catch (error) {
      console.log('Failed to load exam results:', error);
      return [];
    }
  },

  create: async (result) => {
    try {
      const response = await fetch('/api/exams/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(result)
      });
      if (!response.ok) throw new Error('Failed to save exam result');
      return await response.json();
    } catch (error) {
      console.log('Failed to create exam result:', error);
      return null;
    }
  },

  update: async (id, updatedFields) => {
    try {
      const response = await fetch(`/api/exams/results/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok) throw new Error('Failed to update exam result');
      return await response.json();
    } catch (error) {
      console.log('Failed to update exam result:', error);
      return null;
    }
  },

  remove: async (id) => {
    try {
      const response = await fetch(`/api/exams/results/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete exam result');
    } catch (error) {
      console.log('Failed to delete exam result:', error);
    }
  }
};

// ──────────────────────────────────────────────────────────────
// 4) משתמשים רשומים (RegisteredUser)
// ──────────────────────────────────────────────────────────────
export const RegisteredUser = {
  list: async () => {
    const response = await fetch('/api/registered-users', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch registered users');
    return response.json();
  },

  create: async (user) => {
    const response = await fetch('/api/registered-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to create registered user');
    }
    return await response.json();
  },

  update: async (id, updatedFields) => {
    const response = await fetch(`/api/registered-users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to update registered user');
    return await response.json();
  },

  remove: async (id) => {
    const response = await fetch(`/api/registered-users/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete registered user');
  },

  filter: async (criteria) => {
    const users = await RegisteredUser.list();
    return users.filter(user =>
      Object.entries(criteria).every(([key, value]) => user[key] === value)
    );
  },
};

// ──────────────────────────────────────────────────────────────
// 5) תוכן הקורס (CourseContent)
// ──────────────────────────────────────────────────────────────
export const CourseContent = {
  list: async () => {
    try {
      const response = await fetch('/api/course-content', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch course content');
      return await response.json();
    } catch (error) {
      console.log('Failed to load course content:', error);
      return [];
    }
  },

  create: async (course) => {
    try {
      const response = await fetch('/api/course-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(course),
      });
      if (!response.ok) throw new Error('Failed to create course content');
      return await response.json();
    } catch (error) {
      console.log('Failed to create course content:', error);
      return null;
    }
  },

  update: async (id, updatedFields) => {
    try {
      const response = await fetch(`/api/course-content/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok) throw new Error('Failed to update course content');
      return await response.json();
    } catch (error) {
      console.log('Failed to update course content:', error);
      return null;
    }
  },

  remove: async (id) => {
    try {
      const response = await fetch(`/api/course-content/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete course content');
    } catch (error) {
      console.log('Failed to delete course content:', error);
    }
  },

  filter: async (criteria) => {
    try {
      const content = await CourseContent.list();
      return content.filter((course) =>
        Object.entries(criteria).every(([key, value]) => course[key] === value)
      );
    } catch (error) {
      console.log('Failed to filter course content:', error);
      return [];
    }
  }
};

// ──────────────────────────────────────────────────────────────
// ייצוא ה־User (נשאר כבעבר, אם אתה צריך אותו)
// ──────────────────────────────────────────────────────────────
export { User } from './User.js';
