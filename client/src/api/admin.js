import api from './axios';

export const adminApi = {
  getDashboard: (params) => api.get('/dashboard', { params }),
  
  getStudents: (params) => api.get('/students', { params }),
  getStudentBranches: () => api.get('/students/branches'),
  getStudentFinancialYears: () => api.get('/students/financial-years'),
  createStudent: (data) => api.post('/students', data),
  updateStudent: (id, data) => api.put(`/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/students/${id}`),

  getScholarships: (params) => api.get('/scholarships', { params }),
  getActiveScholarships: () => api.get('/scholarships/active'),
  createScholarship: (data) => api.post('/scholarships', data),
  updateScholarship: (id, data) => api.put(`/scholarships/${id}`, data),
  deleteScholarship: (id) => api.delete(`/scholarships/${id}`),
  toggleScholarship: (id) => api.patch(`/scholarships/${id}/toggle`),

  getApplications: (params) => api.get('/applications', { params }),
  getApplication: (id) => api.get(`/applications/${id}`),
  updateApplicationStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  updateApplicationDocument: (appId, docIndex, data) => api.patch(`/applications/${appId}/document/${docIndex}`, data),
  addApplicationComment: (id, data) => api.post(`/applications/${id}/comment`, data),
  notifyApplication: (id, data) => api.post(`/applications/${id}/notify`, data),
  bulkUpdateApplicationStatus: (data) => api.patch('/applications/bulk-status', data),

  getApplicationByRollNo: (rollNo) => api.get(`/applications/by-rollno/${rollNo}`),
  replyApplicationComment: (id, commentIndex, data) => api.patch(`/applications/${id}/comment/${commentIndex}/reply`, data),
  replyApplicationDocument: (id, docIndex, data) => api.patch(`/applications/${id}/document/${docIndex}/reply`, data),

  getSettings: () => api.get('/settings'),
  getSettingsDefaults: () => api.get('/settings/defaults'),
  getSettingsEmail: () => api.get('/settings/email'),
  updateSettingsBulk: (data) => api.post('/settings/bulk', data),
  updateSettingsEmail: (data) => api.post('/settings/email', data),
  updateSettingsDocumentPresets: (data) => api.post('/settings/document-presets', data),

  getAcademics: () => api.get('/academics'),
  createAcademics: (data) => api.post('/academics', data),
  deleteAcademics: (id) => api.delete(`/academics/${id}`),

  importPreview: (formData) => api.post('/import/preview', formData),
  importData: (formData) => api.post('/import/import', formData),
  getImportTemplate: () => api.get('/import/template', { responseType: 'blob' }),

  login: (data) => api.post('/auth/login', data),

  getRequests: (status) => api.get(`/external-requests?status=${status}`),
  approveRequest: (id) => api.patch(`/external-requests/${id}/approve`, {}),
  rejectRequest: (id, data) => api.patch(`/external-requests/${id}/reject`, data),
};
