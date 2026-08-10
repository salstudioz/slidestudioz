import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const projectService = {
  createProject: (data) => api.post('/projects/', data),
  getProject: (id) => api.get(`/projects/${id}`),
  listProjects: () => api.get('/projects/'),
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
