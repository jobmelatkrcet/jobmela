import api from './api';

export const adminService = {
  async getDashboard() {
    const res = await api.get('/admin/dashboard/');
    return res.data;
  },

  async getStudents({ page = 1, search = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (search) params.append('search', search);
    const res = await api.get(`/admin/students/?${params.toString()}`);
    return res.data;
  },

  async getStudent(id) {
    const res = await api.get(`/admin/students/${id}/`);
    return res.data;
  },

  async getCompanies({ page = 1, search = '', order = 'name' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (search) params.append('search', search);
    if (order) params.append('order', order);
    const res = await api.get(`/admin/companies/?${params.toString()}`);
    return res.data;
  },

  async getCompany(id) {
    const res = await api.get(`/admin/companies/${id}/`);
    return res.data;
  },

  async getCompanyStudents(id, { page = 1, search = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (search) params.append('search', search);
    const res = await api.get(`/admin/companies/${id}/students/?${params.toString()}`);
    return res.data;
  },

  async previewCompaniesExcel(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('preview', 'true');
    const res = await api.post('/admin/companies/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async uploadCompaniesExcel(file, clearExisting = false) {
    const formData = new FormData();
    formData.append('file', file);
    if (clearExisting) {
      formData.append('clear_existing', 'true');
    }
    const res = await api.post('/admin/companies/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async clearAllCompanies() {
    const res = await api.post('/admin/companies/clear-all/');
    return res.data;
  },

  async exportCompanyExcel(companyId, defaultFilename = 'Registered_Students.xlsx') {
    const res = await api.get(`/admin/companies/${companyId}/export/`, {
      responseType: 'blob',
    });

    // Try extracting filename from content-disposition
    let filename = defaultFilename;
    const disposition = res.headers['content-disposition'];
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async downloadTemplate() {
    const res = await api.get('/admin/companies/template/', {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Company_Upload_Template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
