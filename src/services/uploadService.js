import apiClient from './api';

export const uploadService = {
  // 上传图片
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // 响应格式已由 apiClient 拦截器处理，直接返回 data
    return response.data;
  },

  // 上传视频（可选）
  uploadVideo: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

export default uploadService;

