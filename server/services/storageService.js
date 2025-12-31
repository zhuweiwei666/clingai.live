/**
 * Storage Service - 文件存储
 * 使用 Cloudflare R2 (兼容 S3 API)
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import dotenv from 'dotenv';

// 确保加载环境变量
dotenv.config();

// R2 配置
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'clingailive';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-17497f33464648bdb5f47bbbdbf732e7.r2.dev';
const R2_ENDPOINT = process.env.R2_ENDPOINT || (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : 'https://18f292ca4a886046b6a8ad0b3fa316a0.r2.cloudflarestorage.com');

// 是否启用 R2（如果配置了凭证则启用）
const R2_ENABLED = !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);

// 初始化 S3 客户端（用于 R2）
let s3Client = null;
if (R2_ENABLED) {
  try {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
    console.log('[Storage] R2 storage enabled');
    console.log('[Storage] Bucket:', R2_BUCKET_NAME);
    console.log('[Storage] Public URL:', R2_PUBLIC_URL);
  } catch (error) {
    console.error('[Storage] Failed to initialize R2 client:', error.message);
    s3Client = null;
  }
} else {
  console.warn('[Storage] R2 not configured, using local storage');
  console.warn('[Storage] Missing:', {
    R2_ACCOUNT_ID: !R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: !R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: !R2_SECRET_ACCESS_KEY,
  });
}

/**
 * 上传文件到 R2 或本地存储
 * @param {Buffer} fileBuffer - 文件内容
 * @param {string} filename - 文件名
 * @param {string} folder - 文件夹路径（在 R2 中作为前缀）
 * @param {string} contentType - MIME 类型
 * @returns {Promise<string>} 文件 URL
 */
export async function uploadFile(fileBuffer, filename, folder = 'general', contentType = 'application/octet-stream') {
  if (R2_ENABLED && s3Client) {
    // 使用 R2 存储
    const key = `${folder}/${filename}`;
    
    try {
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        // R2 公共访问需要单独配置，这里假设文件是公开的
      });

      await s3Client.send(command);
      
      // 返回公共 URL
      const publicUrl = `${R2_PUBLIC_URL}/${key}`;
      console.log(`[Storage] File uploaded to R2: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      console.error('[Storage] R2 upload error:', error);
      throw new Error(`Failed to upload to R2: ${error.message}`);
    }
  } else {
    // 回退到本地存储（开发环境）
    const fs = await import('fs');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
    
    const folderPath = path.join(UPLOAD_DIR, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, filename);
    fs.writeFileSync(filePath, fileBuffer);

    // 返回本地 URL
    return `/uploads/${folder}/${filename}`;
  }
}

/**
 * 从 URL 下载文件
 */
export async function downloadFile(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

/**
 * 删除文件
 */
export async function deleteFile(fileUrl) {
  if (R2_ENABLED && s3Client) {
    // 从 R2 删除
    try {
      // 从公共 URL 提取 key
      const key = fileUrl.replace(R2_PUBLIC_URL + '/', '');
      
      const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      console.log(`[Storage] File deleted from R2: ${key}`);
    } catch (error) {
      console.error('[Storage] R2 delete error:', error);
      throw new Error(`Failed to delete from R2: ${error.message}`);
    }
  } else {
    // 从本地删除
    const fs = await import('fs');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
    
    const relativePath = fileUrl.replace('/uploads/', '');
    const filePath = path.join(UPLOAD_DIR, relativePath);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

/**
 * 生成文件名
 */
export function generateFilename(originalName, prefix = '') {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}${timestamp}_${random}${ext}`;
}

/**
 * 获取存储状态
 */
export function getStorageStatus() {
  return {
    enabled: R2_ENABLED,
    type: R2_ENABLED ? 'R2' : 'local',
    bucket: R2_ENABLED ? R2_BUCKET_NAME : null,
    publicUrl: R2_ENABLED ? R2_PUBLIC_URL : null,
  };
}

export default {
  uploadFile,
  downloadFile,
  deleteFile,
  generateFilename,
  getStorageStatus,
};
