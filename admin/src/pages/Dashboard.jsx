import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardApi } from '../services/api';

const COLORS = ['#8b5cf6', '#ec4899', '#f97316', '#10b981', '#3b82f6', '#f59e0b'];

const TYPE_NAMES = {
  'photo2video': '图生视频',
  'faceswap': '换脸',
  'faceswap_video': '视频换脸',
  'dressup': '换装',
  'hd': '高清放大',
  'remove': '去背景',
  'aiimage': 'AI绘图',
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [usage, setUsage] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overviewRes, trendsRes, usageRes] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getTrends(7),
        dashboardApi.getUsage(30),
      ]);
      setOverview(overviewRes.data);
      setTrends(trendsRes.stats || []);
      setUsage(usageRes.usage || []);
    } catch (error) {
      console.error('Load dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>仪表盘</h2>

      {/* 核心指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="总用户数"
              value={overview?.total?.users || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="总收入"
              value={overview?.total?.revenue || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="今日任务"
              value={overview?.today?.tasks || 0}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#f97316' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="今日新增用户"
              value={overview?.today?.newUsers || 0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#ec4899' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 周期统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="本周新增用户" value={overview?.weekly?.newUsers || 0} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="本周收入" value={overview?.weekly?.revenue || 0} prefix="$" precision={2} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="等待处理" value={overview?.tasks?.pending || 0} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="正在处理" value={overview?.tasks?.processing || 0} />
          </Card>
        </Col>
      </Row>

      {/* 图表 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="7日趋势">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                <Line type="monotone" dataKey="newUsers" stroke="#8b5cf6" name="新增用户" />
                <Line type="monotone" dataKey="totalTasks" stroke="#f97316" name="任务数" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="功能使用分布 (30天)">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usage.map(u => ({ name: TYPE_NAMES[u._id] || u._id, value: u.count }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {usage.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 队列状态 */}
      {overview?.queue && (
        <Card title="队列状态" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={4}>
              <Statistic title="等待中" value={overview.queue.waiting} />
            </Col>
            <Col span={4}>
              <Statistic title="处理中" value={overview.queue.active} />
            </Col>
            <Col span={4}>
              <Statistic title="已完成" value={overview.queue.completed} />
            </Col>
            <Col span={4}>
              <Statistic title="失败" value={overview.queue.failed} />
            </Col>
            <Col span={4}>
              <Statistic title="延迟" value={overview.queue.delayed} />
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
}
