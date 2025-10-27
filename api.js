import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.204:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  async (config) => {
    const url = config?.url || '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');
    config.headers = config.headers || {};
    if (isAuthRoute) {
      delete config.headers.Authorization;
      return config;
    }
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      console.error('Authentication error');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData) =>
    api.post('/auth/register', userData),
  
  getProfile: (token) =>
    api.post('/auth/profile', {}, {
      headers: { Authorization: `Bearer ${token}` }
    }),
};

export const tagsApi = {
  getTags: () => api.get('/tags'),
  getTagById: (id) => api.get(`/tags/${id}`),
  getTagByMacAddress: (macAddress) => api.get(`/tags/mac/${macAddress}`),
  createTag: (tagData) => api.post('/tags', tagData),
  updateTag: (id, tagData) => api.put(`/tags/${id}`, tagData),
  deleteTag: (id) => api.delete(`/tags/${id}`),
  updateTagStatus: (id, statusData) => api.post(`/tags/${id}/status`, statusData),
  getTagLogs: (id, limit) => api.get(`/tags/${id}/logs`, { params: { limit } }),
  getStats: () => api.get('/tags/stats/overview'),
  assignToMember: (id, familyMemberId) => api.put(`/tags/${id}/assign`, { familyMemberId }),
};

export const familiesApi = {
  me: () => api.get('/families/me'),
  linkUser: (memberId) => api.post(`/families/${memberId}/link-user`),
};
