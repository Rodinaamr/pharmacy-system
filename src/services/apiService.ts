import axios from 'axios';

// Replace with your local machine's IP address if testing on a real device
// Example: const API_URL = 'http://192.168.1.5:5202/api';
const API_URL = 'http://localhost:5202/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const medicationService = {
  getAll: () => api.get('/medications'),
  getById: (id: string) => api.get(`/medications/${id}`),
  create: (data: any) => api.post('/medications', data),
  update: (id: string, data: any) => api.put(`/medications/${id}`, data),
  delete: (id: string) => api.delete(`/medications/${id}`),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getActivities: () => api.get('/dashboard/activities'),
};

export const uploadService = {
  uploadPrescriptionDocument: (formData: FormData) => api.post('/prescriptions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;
