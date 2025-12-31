import apiClient from './api';

export const generationService = {
  // ========== VIDEO ==========
  
  // Photo to Video
  generateVideo: async (imageUrl, templateId, prompt) => {
    const response = await apiClient.post('/generate/photo2video', { 
      sourceImage: imageUrl, 
      templateId, 
      prompt,
      params: {}
    });
    return response.data;
  },

  // Video Face Swap
  videoFaceSwap: async (sourceImage, targetVideoUrl) => {
    const response = await apiClient.post('/generate/faceswap-video', { 
      sourceImage, 
      targetImage: targetVideoUrl,
      params: {}
    });
    return response.data;
  },

  // Get video status (统一使用 task 端点)
  getVideoStatus: async (taskId) => {
    const response = await apiClient.get(`/generate/task/${taskId}`);
    return response.data;
  },

  // Get video history (统一使用 history 端点)
  getVideoHistory: async () => {
    const response = await apiClient.get('/generate/history', { params: { type: 'photo2video' } });
    return response.data;
  },

  // ========== IMAGE ==========

  // AI Image Generation
  generateImage: async (prompt, style, aspectRatio) => {
    const response = await apiClient.post('/generate/aiimage', { 
      prompt,
      params: { style, aspectRatio }
    });
    return response.data;
  },

  // Image Face Swap
  imageFaceSwap: async (sourceImage, targetImage) => {
    const response = await apiClient.post('/generate/faceswap', { 
      sourceImage, 
      targetImage,
      params: {}
    });
    return response.data;
  },

  // Dress Up
  dressUp: async (personImage, clothingStyle) => {
    const response = await apiClient.post('/generate/dressup', { 
      sourceImage: personImage, 
      targetImage: clothingStyle,
      params: {}
    });
    return response.data;
  },

  // HD Upscale
  hdUpscale: async (imageUrl, scale = 2) => {
    const response = await apiClient.post('/generate/hd', { 
      sourceImage: imageUrl,
      params: { scale }
    });
    return response.data;
  },

  // Remove watermark/background
  remove: async (imageUrl, removeType) => {
    const response = await apiClient.post('/generate/remove', { 
      sourceImage: imageUrl,
      params: { removeType }
    });
    return response.data;
  },

  // Get image status (统一使用 task 端点)
  getImageStatus: async (taskId) => {
    const response = await apiClient.get(`/generate/task/${taskId}`);
    return response.data;
  },

  // Get image history (统一使用 history 端点)
  getImageHistory: async () => {
    const response = await apiClient.get('/generate/history', { params: { type: 'aiimage' } });
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
