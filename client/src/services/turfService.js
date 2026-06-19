import api from './api';

const turfService = {
  getTurfs: async (filters = {}) => {
    const response = await api.get('/turfs', { params: filters });
    return response.data.data;
  },

  getTurf: async (id) => {
    const response = await api.get(`/turfs/${id}`);
    return response.data.data;
  },

  createTurf: async (turfData) => {
    const response = await api.post('/turfs', turfData);
    return response.data.data;
  },

  updateTurf: async (id, turfData) => {
    const response = await api.put(`/turfs/${id}`, turfData);
    return response.data.data;
  },

  deleteTurf: async (id) => {
    const response = await api.delete(`/turfs/${id}`);
    return response.data;
  },

  uploadPhotos: async (id, files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }
    const response = await api.post(`/turfs/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  }
};

export default turfService;
