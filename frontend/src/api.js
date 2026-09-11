import { projectService, getDownloadUrl } from './services/api';

export const api = {
  async getHealth() {
    const res = await projectService.getHealth();
    return res.data;
  },

  async getProjects() {
    const res = await projectService.listProjects();
    return res.data;
  },

  async createProject(data) {
    const res = await projectService.createProject(data);
    return res.data;
  },

  async getProjectDetails(projectId) {
    const res = await projectService.getProject(projectId);
    return res.data;
  },

  async deleteProject(projectId) {
    const res = await projectService.deleteProject(projectId);
    return res.data;
  },

  async generateDraft(projectId) {
    const res = await projectService.generateDraft(projectId);
    return res.data;
  },

  async updateDraft(projectId, slides) {
    const res = await projectService.updateDraft(projectId, { slides });
    return res.data;
  },

  async generatePresentation(projectId) {
    const res = await projectService.generateFinal(projectId);
    return res.data;
  },

  async uploadDocument(file) {
    const res = await projectService.uploadDocument(file);
    return res.data;
  },

  async uploadLogo(file) {
    const res = await projectService.uploadLogo(file);
    return res.data;
  },

  getDownloadUrl(projectId, format = 'pptx') {
    return getDownloadUrl(projectId, format);
  }
};

