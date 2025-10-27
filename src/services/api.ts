import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the same base URL the device can reach (same as mobile/api.js)
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
    config.headers = config.headers || {} as any;
    if (isAuthRoute) {
      delete (config.headers as any).Authorization;
      return config;
    }
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
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
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  getProfile: (token: string) =>
    api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }),
};

export const tagsApi = {
  getTags: () => api.get('/tags'),
  getTagById: (id: string) => api.get(`/tags/${id}`),
  getTagByMacAddress: (macAddress: string) => api.get(`/tags/mac/${macAddress}`),
  createTag: (tagData: any) => api.post('/tags', tagData),
  updateTag: (id: string, tagData: any) => api.put(`/tags/${id}`, tagData),
  deleteTag: (id: string) => api.delete(`/tags/${id}`),
  updateTagStatus: (id: string, statusData: any) => api.post(`/tags/${id}/status`, statusData),
  getTagLogs: (id: string, limit?: number) => api.get(`/tags/${id}/logs`, { params: { limit } }),
  getStats: () => api.get('/tags/stats/overview'),
  assignToMember: (id: string, familyMemberId?: string) => api.put(`/tags/${id}/assign`, { familyMemberId }),
};

export const usersApi = {
  getUsers: (token: string) =>
    api.get('/users', {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getUserById: (id: string, token: string) =>
    api.get(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  createUser: (userData: any, token: string) =>
    api.post('/users', userData, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  updateUser: (id: string, userData: any, token: string) =>
    api.put(`/users/${id}`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  deleteUser: (id: string, token: string) =>
    api.delete(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
};

export const tenantsApi = {
  getTenants: (token: string) =>
    api.get('/tenants', {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getTenantById: (id: string, token: string) =>
    api.get(`/tenants/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  createTenant: (tenantData: any, token: string) =>
    api.post('/tenants', tenantData, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  updateTenant: (id: string, tenantData: any, token: string) =>
    api.put(`/tenants/${id}`, tenantData, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  deleteTenant: (id: string, token: string) =>
    api.delete(`/tenants/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
};

export const familiesApi = {
  me: () => api.get('/families/me') as Promise<any>,
  linkUser: (memberId: string) => api.post(`/families/${memberId}/link-user`) as Promise<any>,
};

export async function pairTagToCurrentMember(params: {
  macAddress: string;
  name?: string;
  tenantId?: string; // backend infers tenantId from token; name is optional
  location?: { lat: number; lng: number };
  rssi?: number;
}) {
  // 1) Find current member
  const member: any = await familiesApi.me();
  if (!member || !(member as any)._id) {
    throw new Error('Nenhum membro vinculado ao usuário atual. Vincule em /families primeiro.');
  }

  // 2) Find or create tag by MAC
  let tag = null as any;
  try {
    tag = await tagsApi.getTagByMacAddress(params.macAddress);
  } catch (_) {}

  if (!tag || !(tag as any)._id) {
    tag = await (tagsApi.createTag as any)({
      name: params.name || params.macAddress,
      macAddress: params.macAddress,
    });
  }

  // 3) Assign to current member
  await (tagsApi.assignToMember as any)((tag as any)._id, (member as any)._id);

  // 4) Update status/location
  await (tagsApi.updateTagStatus as any)((tag as any)._id, {
    status: 'active',
    location: params.location,
    rssi: params.rssi,
  });

  return tag;
}
