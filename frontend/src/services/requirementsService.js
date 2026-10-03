import api from './api';

export const requirementsService = {
  // Public/Student: fetch all active requirements
  getPublicRequirements: async () => {
    const response = await api.get('/requirements/');
    return response.data;
  },

  // Admin: get all requirements
  getAdminRequirements: async () => {
    const response = await api.get('/admin/requirements/');
    return response.data;
  },

  // Admin: create a requirement
  createRequirement: async (data) => {
    const response = await api.post('/admin/requirements/', data);
    return response.data;
  },

  // Admin: update a requirement
  updateRequirement: async (id, data) => {
    const response = await api.put(`/admin/requirements/${id}/`, data);
    return response.data;
  },

  // Admin: delete a requirement
  deleteRequirement: async (id) => {
    const response = await api.delete(`/admin/requirements/${id}/`);
    return response.data;
  },
};

export default requirementsService;
