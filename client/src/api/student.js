import axios from 'axios';

const studentApi = axios.create({
  baseURL: '/api'
});

studentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('studentToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

studentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('studentToken');
      localStorage.removeItem('student');
      window.location.href = '/student-login';
    }
    return Promise.reject(error);
  }
);

export const studentAuthApi = {
  login: (data) => studentApi.post('/auth/student/login', data),
  register: (data) => studentApi.post('/auth/student/register', data),
  getMe: () => studentApi.get('/auth/student/me'),
  linkRollNo: (data) => studentApi.patch('/auth/student/rollno', data),
};

export const studentApplicationsApi = {
  getMyApplications: () => studentApi.get('/applications/my/applications'),
  getAvailableScholarships: () => studentApi.get('/applications/scholarships/available'),
  getExternalScholarships: () => studentApi.get('/applications/scholarships/external'),
  apply: (data) => studentApi.post('/applications/student/apply', data),
  getStudentApplication: (id) => studentApi.get(`/applications/student/${id}`),
  uploadDocument: (id, formData) => studentApi.post(`/applications/student/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateDocument: (id, docIndex, data) => studentApi.patch(`/applications/student/${id}/document/${docIndex}`, data),
};

export const studentProfileApi = {
  getProfile: () => studentApi.get('/student/profile').catch(() => studentApi.get('/auth/student/me')),
  updateProfile: (data) => studentApi.post('/student/profile', data),
};

export const studentExternalRequestsApi = {
  getMyRequests: () => studentApi.get('/external-requests/me'),
  createRequest: (data) => studentApi.post('/external-requests', data),
};
