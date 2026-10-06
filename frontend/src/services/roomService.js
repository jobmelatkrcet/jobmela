import api from './api';

export const roomService = {
  // Get complete allocation overview and statistics
  async getRoomsSummary() {
    const res = await api.get('/admin/rooms/summary/');
    return res.data;
  },

  // Upload room Excel file and generate preview
  async previewRoomExcel(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/admin/rooms/upload-preview/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Confirm and persist the sequential allocation
  async confirmAllocation(rooms) {
    const res = await api.post('/admin/rooms/confirm-allocation/', {
      rooms,
    });
    return res.data;
  },

  // Download official sample Excel template
  async downloadRoomTemplate() {
    const res = await api.get('/admin/rooms/template/', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Room_Numbers_Template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Get Room details with vector QR SVG
  async getRoomQR(roomId) {
    const res = await api.get(`/admin/rooms/${roomId}/qr/`);
    return res.data;
  },

  // Toggle QR code active / inactive status
  async toggleRoomStatus(roomId, qrStatus) {
    const res = await api.post(`/admin/rooms/${roomId}/toggle-status/`, {
      qr_status: qrStatus,
    });
    return res.data;
  },

  // Public/Student Room QR scan inspection
  async getCheckInInfo(roomToken) {
    const res = await api.get(`/rooms/checkin/${encodeURIComponent(roomToken)}/`);
    return res.data;
  },

  // Student check-in submission
  async submitCheckIn(roomToken) {
    const res = await api.post(`/rooms/checkin/${encodeURIComponent(roomToken)}/`);
    return res.data;
  },

  // Student interview attempt history & remaining quota
  async getMyAttempts() {
    const res = await api.get('/rooms/my-attempts/');
    return res.data;
  },

  // Admin live room & candidate check-in monitor
  async getLiveRoomCheckins(search = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const res = await api.get(`/admin/rooms/live-checkins/?${params.toString()}`);
    return res.data;
  },
};

export default roomService;
