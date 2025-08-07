import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('supabase.auth.token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('supabase.auth.token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email) => api.post('/auth/login', { email }),
  generateCode: (email) => api.post('/auth/generate-code', { email }),
  verifyCode: (email, code) => api.post('/auth/verify-code', { email, code }),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (updates) => api.put('/users/profile', updates),
  submitApplication: (applicationData) => api.post('/users/application', applicationData),
  getApplications: () => api.get('/users/applications'),
  reviewApplication: (id, review) => api.put(`/users/applications/${id}`, review),
};

// Document API calls
export const documentAPI = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (params) => api.get('/documents', { params }),
  download: (id) => api.post(`/documents/${id}/download`),
};

// Chat API calls
export const chatAPI = {
  getThreads: () => api.get('/chat/threads'),
  createThread: (threadData) => api.post('/chat/threads', threadData),
  getMessages: (threadId, params) => api.get(`/chat/threads/${threadId}/messages`, { params }),
  sendMessage: (threadId, messageData) => api.post(`/chat/threads/${threadId}/messages`, messageData),
};

// AI API calls
export const aiAPI = {
  generateCaption: (content, mediaType) => api.post('/ai/generate-caption', { content, mediaType }),
  moderateContent: (content, contentType) => api.post('/ai/moderate-content', { content, contentType }),
};

// Post API calls
export const postAPI = {
  create: (postData) => api.post('/posts', postData),
  getAll: (params) => api.get('/posts', { params }),
  like: (postId) => api.post(`/posts/${postId}/like`),
  unlike: (postId) => api.delete(`/posts/${postId}/like`),
  comment: (postId, commentData) => api.post(`/posts/${postId}/comments`, commentData),
};

// Payment API calls
export const paymentAPI = {
  createSubscription: (subscriptionData) => api.post('/payments/create-subscription', subscriptionData),
  getHistory: () => api.get('/payments/history'),
  createCheckoutSession: (sessionData) => api.post('/payments/checkout-session', sessionData),
};

export default api;