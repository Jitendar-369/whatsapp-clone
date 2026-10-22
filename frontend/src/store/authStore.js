import { create } from 'zustand';

const STORAGE_KEY = 'chat-auth';

// Seconds-since-epoch expiry from the token payload (not verified here - the server does that)
const tokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp ?? 0;
  } catch {
    return 0;
  }
};

const isExpired = (token) => tokenExpiry(token) * 1000 <= Date.now();

// Keep the user signed in across page reloads, until the token expires
const loadAuth = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.token && saved?.user && !isExpired(saved.token)) return saved;
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable or corrupt - start signed out
  }
  return { user: null, token: null };
};

export const useAuthStore = create((set) => ({
  ...loadAuth(),

  login: (user, token) => {
    const auth = { user: { id: user.id, username: user.username, email: user.email }, token };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } catch {
      // Storage unavailable - stay signed in for this tab only
    }
    set(auth);
  },

  logout: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    set({ user: null, token: null });
  },
}));
