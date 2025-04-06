let lastId = Number(localStorage.getItem("lastId")) || 0;

export const generateId = () => {
  lastId += 1;
  // שמור את הערך המעודכן ב-localStorage
  localStorage.setItem("lastId", String(lastId));
  return String(lastId);
};