import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

export const registerUser  = (username, password, email) =>
  API.post("/register", { username, password, ...(email ? { email } : {}) });

export const loginUser     = (username, password) =>
  API.post("/login", { username, password });

export const saveCoverage     = (user_id, coverage) => API.post("/coverage", { user_id, coverage });
export const getCoverage      = (user_id) => API.get(`/coverage/${user_id}`);
export const saveAvailability = (user_id, availability) => API.post("/availability", { user_id, availability });
export const getAvailability  = (user_id) => API.get(`/availability/${user_id}`);
export const addTask          = (taskData) => API.post("/tasks", taskData);
export const getTasks         = (user_id) => API.get(`/tasks/${user_id}`);
export const deleteTask       = (task_id) => API.delete(`/tasks/${task_id}`);
export const generateSchedule = (user_id, start_offset_days = 0) =>
  API.post("/schedule", { user_id, start_offset_days });

export const notifyDeadline = (user_id) =>
  API.post("/notify/deadline", { user_id });

export const notifyDaily    = (user_id) =>
  API.post("/notify/daily", { user_id });

export const notifyWeekly   = (user_id) =>
  API.post("/notify/weekly", { user_id });

export const updateEmail    = (username, email) =>
  API.post("/user/email", { username, email });

export const healthCheck    = () => API.get("/health");
