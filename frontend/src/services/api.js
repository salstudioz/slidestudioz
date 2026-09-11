import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getUserId = () => {
  let userId = localStorage.getItem('slidestudioz_user_id');
  if (!userId) {
    userId = 'usr_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36).slice(-4);
    localStorage.setItem('slidestudioz_user_id', userId);
  }
  return userId;
};

export const resetUserId = () => {
  const newUserId = 'usr_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36).slice(-4);
  localStorage.setItem('slidestudioz_user_id', newUserId);
  return newUserId;
};

api.interceptors.request.use((config) => {
  config.headers['X-User-ID'] = getUserId();
  return config;
});

export const getDownloadUrl = (projectId, format = 'pptx') => {
  const uId = getUserId();
  return `${API_BASE_URL}/projects/${projectId}/download?format=${format}&user_id=${uId}`;
};

export const projectService = {
  getHealth: () => api.get('/health'),
  createProject: (data) => api.post('/projects', data),
  getProject: (id) => api.get(`/projects/${id}`),
  listProjects: () => api.get('/projects'),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  generateDraft: (id) => api.post(`/projects/${id}/draft`),
  getDraft: (id) => api.get(`/projects/${id}/draft`),
  updateDraft: (id, draft) => api.put(`/projects/${id}/draft`, draft),
  regenerateDraft: (id) => api.post(`/projects/${id}/draft/regenerate`),
  generateFinal: (id) => api.post(`/projects/${id}/generate`),
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadKnowledgebase: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload-knowledgebase', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
};

