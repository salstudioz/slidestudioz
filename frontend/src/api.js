const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

export const api = {
  // Health & System
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Failed to connect to GetSlideZ API server');
    return res.json();
  },

  // Projects
  async getProjects() {
    const res = await fetch(`${API_BASE_URL}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async createProject(data) {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  async getProjectDetails(projectId) {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}`);
    if (!res.ok) throw new Error('Failed to fetch project details');
    return res.json();
  },

  async deleteProject(projectId) {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete project');
    return res.json();
  },

  // Drafts & Slide Editing
  async generateDraft(projectId) {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/draft`, {
      method: 'POST',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Failed to generate slide draft');
    }
    return res.json();
  },

  async updateDraft(projectId, slides) {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/draft`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slides }),
    });
    if (!res.ok) throw new Error('Failed to update draft slides');
    return res.json();
  },

  // Presentation Rendering & Export
  async generatePresentation(projectId) {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/generate`, {
      method: 'POST',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Failed to generate final presentation');
    }
    return res.json();
  },

  // File Uploads
  async uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Failed to process document');
    }
    return res.json();
  },

  async uploadLogo(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/upload-logo`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Failed to upload logo');
    }
    return res.json();
  }
};
