import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register/', data);
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login/', credentials);
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout/');
    } catch {
      // Ignore failure on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async getProfile() {
    const res = await api.get('/auth/profile/');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/auth/profile/', data);
    return res.data;
  },
};
