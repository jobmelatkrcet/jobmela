import api from './api';

export const applicationService = {
  async applyToCompany(companyId) {
    const res = await api.post('/applications/', { company_id: companyId });
    return res.data;
  },

  async getMyApplications() {
    const res = await api.get('/applications/my/');
    return res.data;
  },

  async getStudentStats() {
    const res = await api.get('/applications/stats/');
    return res.data;
  },
};
