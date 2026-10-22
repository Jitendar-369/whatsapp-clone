import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_URL });

// Send the login token with every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// An expired or invalid token means we have to log in again
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthCall = error.config?.url?.startsWith('/users/login') || error.config?.url?.startsWith('/users/register');
    if (status === 401 && !isAuthCall) useAuthStore.getState().logout();
    return Promise.reject(error);
  },
);

// Public "is the server up" check - also wakes a sleeping free-tier server
export const pingServer = () => {
  return api.get('/health', { timeout: 90000 });
};

// Login and register both return { token, user }
export const registerUser = (username, email, password) => {
  return api.post('/users/register', { username, email, password });
};

export const loginUser = (username, password) => {
  return api.post('/users/login', { username, password });
};

export const getAllUsers = () => {
  return api.get('/users');
};

export const getOnlineUsers = () => {
  return api.get('/users/online');
};

// Rooms the signed-in user belongs to, each with its lastMessage
export const getMyRooms = () => {
  return api.get('/rooms');
};

export const createGroup = (name, description, memberIds) => {
  return api.post('/rooms/group', { name, description, memberIds });
};

export const openDirectChat = (otherUserId) => {
  return api.post(`/rooms/direct/${otherUserId}`);
};

export const getMessages = (roomId) => {
  return api.get(`/messages/room/${roomId}`);
};

export const sendMessageAPI = (roomId, content) => {
  return api.post('/messages', { roomId, content });
};

// Backend errors come back as plain strings
export const errorText = (err, fallback) => {
  const data = err.response?.data;
  if (typeof data === 'string' && data) return data;
  if (!err.response) return 'Cannot reach the server. If it was asleep it can take up to a minute to wake up - please try again.';
  return fallback;
};
