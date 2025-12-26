import { Router } from 'express';
import { verifyToken, verifyAdmin } from '../../middleware/auth.js';

import dashboardRoutes from './dashboard.js';
import usersRoutes from './users.js';
import templatesRoutes from './templates.js';
import ordersRoutes from './orders.js';
import settingsRoutes from './settings.js';
import tasksRoutes from './tasks.js';

const router = Router();

// 所有 admin 路由都需要验证 token 和管理员权限
router.use(verifyToken);
router.use(verifyAdmin);

// 子路由
router.use('/dashboard', dashboardRoutes);
router.use('/users', usersRoutes);
router.use('/templates', templatesRoutes);
router.use('/orders', ordersRoutes);
router.use('/settings', settingsRoutes);
router.use('/tasks', tasksRoutes);

export default router;
