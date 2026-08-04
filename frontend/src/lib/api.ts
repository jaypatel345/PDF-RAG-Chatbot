import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Documents API
export const documentsAPI = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/documents');
    return response.data;
  },
  search: async (query: string) => {
    const response = await api.get('/documents/search', { params: { q: query } });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
  reprocess: async (id: number) => {
    const response = await api.post(`/documents/${id}/reprocess`);
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await api.get('/documents/dashboard');
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  ask: async (question: string, sessionId?: string) => {
    const response = await api.post('/chat/ask', { question, sessionId });
    return response.data;
  },
  getHistory: async (sessionId: string) => {
    const response = await api.get(`/chat/history/${sessionId}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/chat/stats');
    return response.data;
  },
};

export default api;
