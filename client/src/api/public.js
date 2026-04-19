import api from './axios';

export const publicApi = {
  getActiveScholarships: () => api.get('/scholarships/active'),
  getApplicationByRollNo: (rollNo) => api.get(`/applications/by-rollno/${rollNo}`),
  replyApplicationComment: (id, commentIndex, data) => api.patch(`/applications/${id}/comment/${commentIndex}/reply`, data),
  replyApplicationDocument: (id, docIndex, data) => api.patch(`/applications/${id}/document/${docIndex}/reply`, data),
};

export const documentRequestsApi = {
  getRequests: (filter) => api.get(`/document-requests?status=${filter}`),
  getAcademicsList: () => api.get('/document-requests/academics/list'),
  getStudentsList: () => api.get('/document-requests/students/list'),
  createRequest: (data) => api.post('/document-requests', data),
  completeRequest: (id) => api.patch(`/document-requests/${id}/complete`),
};
