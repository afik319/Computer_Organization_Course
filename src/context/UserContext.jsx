import { createContext, useContext, useState } from "react";

// יצירת הקונטקסט
const UserContext = createContext();

// הוק לשימוש נוח בקונטקסט
export const useUser = () => useContext(UserContext);

// קומפוננטת הפרוביידר שעוטפת את האפליקציה
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // ✅ ניהול state כאן מקומית

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};
