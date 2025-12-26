import apiClient from './api';

export const generationService = {
  // ========== VIDEO ==========
  
  // Photo to Video
  generateVideo: async (imageUrl, templateId, prompt) => {
    const response = await apiClient.post('/video/generate', { imageUrl, templateId, prompt });
    return response.data;
  },

  // Video Face Swap
  videoFaceSwap: async (sourceImage, targetVideoUrl) => {
    const response = await apiClient.post('/video/face-swap', { sourceImage, targetVideoUrl });
    return response.data;
  },

  // Get video status
  getVideoStatus: async (taskId) => {
    const response = await apiClient.get(`/video/status/${taskId}`);
    return response.data;
  },

  // Get video history
  getVideoHistory: async () => {
    const response = await apiClient.get('/video/history');
    return response.data;
  },

  // ========== IMAGE ==========

  // AI Image Generation
  generateImage: async (prompt, style, aspectRatio) => {
    const response = await apiClient.post('/image/generate', { prompt, style, aspectRatio });
    return response.data;
  },

  // Image Face Swap
  imageFaceSwap: async (sourceImage, targetImage) => {
    const response = await apiClient.post('/image/face-swap', { sourceImage, targetImage });
    return response.data;
  },

  // Dress Up
  dressUp: async (personImage, clothingStyle) => {
    const response = await apiClient.post('/image/dress-up', { personImage, clothingStyle });
    return response.data;
  },

  // HD Upscale
  hdUpscale: async (imageUrl, scale = 2) => {
    const response = await apiClient.post('/image/hd-upscale', { imageUrl, scale });
    return response.data;
  },

  // Remove watermark/background
  remove: async (imageUrl, removeType) => {
    const response = await apiClient.post('/image/remove', { imageUrl, removeType });
    return response.data;
  },

  // Get image status
  getImageStatus: async (taskId) => {
    const response = await apiClient.get(`/image/status/${taskId}`);
    return response.data;
  },

  // Get image history
  getImageHistory: async () => {
    const response = await apiClient.get('/image/history');
    return response.data;
  },

  // ========== USER ==========

  // Get user's works
  getMyWorks: async () => {
    const response = await apiClient.get('/user/works');
    return response.data;
  },

  // Get coin balance
  getCoins: async () => {
    const response = await apiClient.get('/user/coins');
    return response.data;
  },
};

export default generationService;
