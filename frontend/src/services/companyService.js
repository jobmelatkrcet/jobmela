import api from './api';

export const companyService = {
  async getCompanies({ page = 1, search = '', page_size = 20, qualification = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (search) params.append('search', search);
    if (page_size) params.append('page_size', page_size);
    if (qualification && qualification !== 'all') params.append('qualification', qualification);

    const res = await api.get(`/companies/?${params.toString()}`);
    return res.data;
  },

  async getCompany(id) {
    const res = await api.get(`/companies/${id}/`);
    return res.data;
  },
};
