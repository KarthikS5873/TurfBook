import api from './api';

const reviewService = {
  addReview: async (reviewData, files = []) => {
    // We send as multipart/form-data for review photos
    const formData = new FormData();
    formData.append('turfId', reviewData.turfId);
    formData.append('rating', reviewData.rating);
    formData.append('comment', reviewData.comment || '');
    
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }

    const response = await api.post('/reviews', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  getTurfReviews: async (turfId) => {
    const response = await api.get(`/reviews/turf/${turfId}`);
    return response.data.data;
  },

  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  }
};

export default reviewService;
