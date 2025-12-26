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
      <h2 style={{ marginBottom: 24 }}>Dashboard</h2>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Users"
              value={overview?.total?.users || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Revenue"
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
              title="Today Tasks"
              value={overview?.today?.tasks || 0}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#f97316' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="New Users (Today)"
              value={overview?.today?.newUsers || 0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#ec4899' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Weekly Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Weekly Users" value={overview?.weekly?.newUsers || 0} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Weekly Revenue" value={overview?.weekly?.revenue || 0} prefix="$" precision={2} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Pending Tasks" value={overview?.tasks?.pending || 0} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Processing" value={overview?.tasks?.processing || 0} />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Daily Trends (Last 7 Days)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                <Line type="monotone" dataKey="newUsers" stroke="#8b5cf6" name="New Users" />
                <Line type="monotone" dataKey="totalTasks" stroke="#f97316" name="Tasks" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Feature Usage (Last 30 Days)">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usage.map(u => ({ name: u._id, value: u.count }))}
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

      {/* Queue Status */}
      {overview?.queue && (
        <Card title="Queue Status" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={4}>
              <Statistic title="Waiting" value={overview.queue.waiting} />
            </Col>
            <Col span={4}>
              <Statistic title="Active" value={overview.queue.active} />
            </Col>
            <Col span={4}>
              <Statistic title="Completed" value={overview.queue.completed} />
            </Col>
            <Col span={4}>
              <Statistic title="Failed" value={overview.queue.failed} />
            </Col>
            <Col span={4}>
              <Statistic title="Delayed" value={overview.queue.delayed} />
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
}
