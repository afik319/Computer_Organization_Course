import storage from "../storage";

export const User = {
  me: async () => {
    const email = storage.get("currentUserEmail");
    if (!email) return null;

    const users = storage.get("users") || [];
    return users.find(user => user.email === email) || null;
  },

  login: async (email, fullName) => {
    let users = storage.get("users") || [];

    let user = users.find(user => user.email === email);

    if (!user) {
      // אם המשתמש לא קיים – יצטרך לבקש הרשאות
      user = {
        id: email,
        email,
        full_name: fullName || "",
        status: "pending", // ממתין לאישור
        role: "user"
      };
      users.push(user);
      storage.set("users", users);
    }

    storage.set("currentUserEmail", email);
    return user;
  },

  logout: () => {
    storage.remove("currentUserEmail");
  },

  approve: (email) => {
    let users = storage.get("users") || [];
    users = users.map(user =>
      user.email === email ? { ...user, status: "approved" } : user
    );
    storage.set("users", users);
  },

  reject: (email) => {
    let users = storage.get("users") || [];
    users = users.filter(user => user.email !== email);
    storage.set("users", users);
  },

  list: () => {
    return storage.get("users") || [];
  },
};
