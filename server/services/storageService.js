/**
 * Storage Service - 文件存储
 * 
 * TODO: 实现 Cloudflare R2 或 AWS S3 存储
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 本地上传目录（开发用）
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

// 确保目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * 上传文件到存储
 */
export async function uploadFile(fileBuffer, filename, folder = 'general') {
  const folderPath = path.join(UPLOAD_DIR, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const filePath = path.join(folderPath, filename);
  fs.writeFileSync(filePath, fileBuffer);

  // 返回 URL（本地开发）
  return `/uploads/${folder}/${filename}`;
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
  const relativePath = fileUrl.replace('/uploads/', '');
  const filePath = path.join(UPLOAD_DIR, relativePath);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
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

export default {
  uploadFile,
  downloadFile,
  deleteFile,
  generateFilename,
};
