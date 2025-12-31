import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 加载环境变量
dotenv.config();

// 导入数据库连接
import { connectDB } from './config/database.js';

// 导入路由
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import templateRoutes from './routes/template.js';
import generateRoutes from './routes/generate.js';
import workRoutes from './routes/work.js';
import orderRoutes from './routes/order.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin/index.js';

// 导入错误处理中间件
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/works', workRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    data: {
      status: 'ok', 
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

// 存储状态检查
app.get('/api/storage/status', async (req, res) => {
  try {
    const { getStorageStatus } = await import('./services/storageService.js');
    const status = getStorageStatus();
    return res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Storage status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get storage status',
    });
  }
});

// 404 处理
app.use('/api/*', notFoundHandler);

// 错误处理（必须在所有路由之后）
app.use(errorHandler);

// 启动服务器
async function start() {
  try {
    // 连接数据库
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`
🚀 ClingAI Server is running!
   Port: ${PORT}
   Environment: ${process.env.NODE_ENV || 'development'}
   API: http://localhost:${PORT}/api
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
