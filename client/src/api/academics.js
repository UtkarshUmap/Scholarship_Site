import axios from 'axios';

const academicsApi = axios.create({
  baseURL: '/api'
});

academicsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('academicsToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

academicsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('academicsToken');
      localStorage.removeItem('academics');
      window.location.href = '/academics-login';
    }
    return Promise.reject(error);
  }
);

export const academicsAuthApi = {
  login: (data) => academicsApi.post('/auth/academics/login', data),
};

export const academicsDocumentRequestsApi = {
  getMyRequests: () => academicsApi.get('/document-requests/my'),
  getRequest: (id) => academicsApi.get(`/document-requests/${id}`),
  respondToRequest: (id, data) => academicsApi.post(`/document-requests/${id}/respond`, data),
};
