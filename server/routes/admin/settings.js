import { Router } from 'express';
import { getSetting, setSetting, getAllSettings } from '../../models/Settings.js';

const router = Router();

// 获取所有设置
router.get('/', async (req, res) => {
  try {
    const settings = await getAllSettings();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// 获取单个设置
router.get('/:key', async (req, res) => {
  try {
    const value = await getSetting(req.params.key);
    res.json({ success: true, key: req.params.key, value });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Failed to get setting' });
  }
});

// 更新设置
router.put('/:key', async (req, res) => {
  try {
    const { value } = req.body;
    await setSetting(req.params.key, value);
    res.json({ success: true, message: 'Setting updated' });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// 更新金币套餐
router.put('/packages/coins', async (req, res) => {
  try {
    const { packages } = req.body;
    await setSetting('coinPackages', packages);
    res.json({ success: true, message: 'Coin packages updated' });
  } catch (error) {
    console.error('Update coin packages error:', error);
    res.status(500).json({ error: 'Failed to update coin packages' });
  }
});

// 更新订阅计划
router.put('/plans/subscription', async (req, res) => {
  try {
    const { plans } = req.body;
    await setSetting('subscriptionPlans', plans);
    res.json({ success: true, message: 'Subscription plans updated' });
  } catch (error) {
    console.error('Update subscription plans error:', error);
    res.status(500).json({ error: 'Failed to update subscription plans' });
  }
});

// 更新功能消耗金币
router.put('/costs/features', async (req, res) => {
  try {
    const { costs } = req.body;
    await setSetting('featureCosts', costs);
    res.json({ success: true, message: 'Feature costs updated' });
  } catch (error) {
    console.error('Update feature costs error:', error);
    res.status(500).json({ error: 'Failed to update feature costs' });
  }
});

// 设置维护模式
router.put('/maintenance', async (req, res) => {
  try {
    const { enabled } = req.body;
    await setSetting('maintenance', enabled);
    res.json({ success: true, maintenance: enabled });
  } catch (error) {
    console.error('Set maintenance error:', error);
    res.status(500).json({ error: 'Failed to set maintenance mode' });
  }
});

// 设置公告
router.put('/announcement', async (req, res) => {
  try {
    const { text } = req.body;
    await setSetting('announcement', text);
    res.json({ success: true, message: 'Announcement updated' });
  } catch (error) {
    console.error('Set announcement error:', error);
    res.status(500).json({ error: 'Failed to set announcement' });
  }
});

export default router;
