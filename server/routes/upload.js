import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from '../middleware/auth.js';
import { uploadFile, generateFilename } from '../services/storageService.js';
import { successResponse, errorResponse } from '../utils/response.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// 配置 multer 内存存储（直接处理 buffer）
const storage = multer.memoryStorage();

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许图片和视频
  if (file.mimetype && (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/'))) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter,
});

// 上传图片
router.post('/image', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 'NO_FILE', 400);
    }

    // 验证文件类型
    if (!req.file.mimetype.startsWith('image/')) {
      return errorResponse(res, 'File must be an image', 'INVALID_FILE_TYPE', 400);
    }

    // 验证文件大小（10MB for images）
    if (req.file.size > 10 * 1024 * 1024) {
      return errorResponse(res, 'Image size must be less than 10MB', 'FILE_TOO_LARGE', 400);
    }

    // 生成文件名
    const filename = generateFilename(req.file.originalname, 'img_');
    
    // 上传文件到 R2
    const fileUrl = await uploadFile(
      req.file.buffer, 
      filename, 
      'images',
      req.file.mimetype
    );

    // fileUrl 已经是完整的公共 URL（R2）或相对路径（本地）
    // 如果是本地路径，需要添加完整 URL
    const fullUrl = fileUrl.startsWith('http') 
      ? fileUrl 
      : `${req.protocol}://${req.get('host')}${fileUrl}`;

    return successResponse(res, {
      url: fullUrl,
      path: fileUrl,
      filename: filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error('Upload image error:', error);
    return errorResponse(res, 'Failed to upload image', 'UPLOAD_ERROR', 500);
  }
});

// 上传视频（可选）
router.post('/video', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 'NO_FILE', 400);
    }

    // 验证文件类型
    if (!req.file.mimetype.startsWith('video/')) {
      return errorResponse(res, 'File must be a video', 'INVALID_FILE_TYPE', 400);
    }

    // 验证文件大小（50MB for videos）
    if (req.file.size > 50 * 1024 * 1024) {
      return errorResponse(res, 'Video size must be less than 50MB', 'FILE_TOO_LARGE', 400);
    }

    // 生成文件名
    const filename = generateFilename(req.file.originalname, 'vid_');
    
    // 上传文件到 R2
    const fileUrl = await uploadFile(
      req.file.buffer, 
      filename, 
      'videos',
      req.file.mimetype
    );

    // fileUrl 已经是完整的公共 URL（R2）或相对路径（本地）
    // 如果是本地路径，需要添加完整 URL
    const fullUrl = fileUrl.startsWith('http') 
      ? fileUrl 
      : `${req.protocol}://${req.get('host')}${fileUrl}`;

    return successResponse(res, {
      url: fullUrl,
      path: fileUrl,
      filename: filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error('Upload video error:', error);
    return errorResponse(res, 'Failed to upload video', 'UPLOAD_ERROR', 500);
  }
});

export default router;

