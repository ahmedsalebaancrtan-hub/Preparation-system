import axios from 'axios';

let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
// Remove trailing slash if present
if (apiUrl.endsWith('/')) {
  apiUrl = apiUrl.slice(0, -1);
}
// Append /api if not present
if (!apiUrl.endsWith('/api')) {
  apiUrl += '/api';
}
const API_BASE_URL = apiUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard
export const getDashboard = () => api.get('/dashboard');
export const getProgress = () => api.get('/progress');

// Subjects
export const getSubjects = () => api.get('/subjects');
export const getSubject = (id) => api.get(`/subjects/${id}`);
export const createSubject = (data) => api.post('/subjects', data);
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);

// Topics
export const getTopicsBySubject = (subjectId) => api.get(`/subjects/${subjectId}/topics`);
export const createTopic = (data) => api.post('/topics', data);
export const updateTopic = (id, data) => api.put(`/topics/${id}`, data);
export const toggleTopicComplete = (id) => api.put(`/topics/${id}/complete`);
export const toggleTopicWeak = (id) => api.put(`/topics/${id}/weak`);
export const deleteTopic = (id) => api.delete(`/topics/${id}`);

// Notes
export const getNotes = () => api.get('/notes');
export const getNotesBySubject = (subjectId) => api.get(`/subjects/${subjectId}/notes`);
export const createNote = (data) => api.post('/notes', data);
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);
export const deleteNote = (id) => api.delete(`/notes/${id}`);

// Study Plan
export const getStudyPlans = () => api.get('/study-plan');
export const getTodayStudyPlan = () => api.get('/study-plan/today');
export const createStudyPlan = (data) => api.post('/study-plan', data);
export const updateStudyPlan = (id, data) => api.put(`/study-plan/${id}`, data);
export const deleteStudyPlan = (id) => api.delete(`/study-plan/${id}`);

export default api;
