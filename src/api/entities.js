import storage from "./storage";
import examResultsData from "../data/ExamResults.json";
import lessonsData from '../data/lessonsData.json';
import examsData from "@/data/exams.json";
import registeredUsersData from "../data/registeredUsers.json";
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
        is_sample = false
    }) {
        this.id = id;
        this.created_date = created_date;
        this.updated_date = updated_date;
        this.created_by = created_by;
        this.is_sample = is_sample;

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
}


export class Exam {
  static list() {
    return Promise.resolve(examsData.exams);
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
    is_sample: false,
  
    list: async () => {
      const results = storage.get("examResults");
      if (!results || !results.length) {
        storage.set("examResults", examResultsData.examResults);
        return examResultsData.examResults;
      }
      return results;
    },
  
    create: async (result) => {
      const results = storage.get("examResults") || [];
      results.push(result);
      storage.set("examResults", results);
      return result;
    },
  
    update: async (id, updatedFields) => {
      const results = storage.get("examResults") || [];
      const index = results.findIndex((r) => r.id === id);
      if (index !== -1) {
        results[index] = { ...results[index], ...updatedFields, updated_date: new Date().toISOString() };
        storage.set("examResults", results);
        return results[index];
      }
      return null;
    },
  
    remove: async (id) => {
      let results = storage.get("examResults") || [];
      results = results.filter((r) => r.id !== id);
      storage.set("examResults", results);
    },
  };
    
  export const RegisteredUser = {
    email: "",
    full_name: "",
    status: "",
    request_date: "",
    approval_date: "",
    notes: "",
    id: "",
    created_date: "",
    updated_date: "",
    created_by: "",
    is_sample: false,

    list: async () => {
        const users = storage.get("registeredUsers");
        if (!users || !users.length) {
            storage.set("registeredUsers", registeredUsersData.registeredUsers);
            return registeredUsersData.registeredUsers;
        }
        return users;
    },

    create: async (user) => {
        const users = storage.get("registeredUsers") || [];
        const newUser = {
            ...user,
            id: generateId(), // ודא שיש לך פונקציה כזו ליצירת מזהה ייחודי
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString(),
            is_sample: false
        };
        users.push(newUser);
        storage.set("registeredUsers", users);
        return newUser;
    },

    update: async (id, updatedFields) => {
        const users = storage.get("registeredUsers") || [];
        const index = users.findIndex((u) => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updatedFields, updated_date: new Date().toISOString() };
            storage.set("registeredUsers", users);
            return users[index];
        }
        return null;
    },

    remove: async (id) => {
        let users = storage.get("registeredUsers") || [];
        users = users.filter((u) => u.id !== id);
        storage.set("registeredUsers", users);
    },

    filter: async (criteria) => {
        const users = await RegisteredUser.list(); // קבל את כל המשתמשים
        return users.filter((user) =>
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
    is_sample: false,

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


// auth sdk:
//export const User = base44.auth;

export { User };