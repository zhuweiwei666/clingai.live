import { useState, useEffect } from 'react';
import { Table, Select, Button, Tag, Space, Card, Row, Col, Statistic, message, Modal, Progress } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { tasksApi } from '../services/api';
import dayjs from 'dayjs';

const typeMap = {
  photo2video: '图生视频',
  faceswap: '换脸',
  faceswap_video: '视频换脸',
  dressup: '换装',
  hd: '高清放大',
  remove: '去背景',
  aiimage: 'AI绘图',
};

const statusMap = {
  pending: { text: '等待中', color: 'orange' },
  processing: { text: '处理中', color: 'blue' },
  completed: { text: '已完成', color: 'green' },
  failed: { text: '失败', color: 'red' },
};

export default function Tasks() {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [queue, setQueue] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');

  const loadTasks = async (page = 1) => {
    setLoading(true);
    try {
      const [tasksRes, queueRes] = await Promise.all([
        tasksApi.getList({ page, limit: 20, status: statusFilter }),
        tasksApi.getQueue(),
      ]);
      setTasks(tasksRes.tasks);
      setStatusCounts(tasksRes.statusCounts);
      setPagination(tasksRes.pagination);
      setQueue(queueRes.queue);
    } catch (error) {
      message.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 10000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const handleRetry = async (task) => {
    try {
      await tasksApi.retry(task._id);
      message.success('任务已重新加入队列');
      loadTasks(pagination.page);
    } catch (error) {
      message.error(error.error || '重试失败');
    }
  };

  const handleCancel = async (task) => {
    Modal.confirm({
      title: '取消任务',
      content: '确定要取消这个任务吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await tasksApi.cancel(task._id);
        message.success('任务已取消');
        loadTasks(pagination.page);
      },
    });
  };

  const handleCleanQueue = (type) => {
    const typeText = type === 'completed' ? '已完成' : '失败';
    Modal.confirm({
      title: `清理${typeText}任务`,
      content: `确定要清理队列中所有${typeText}的任务吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await tasksApi.cleanQueue(type);
        message.success(`已清理${typeText}任务`);
        loadTasks();
      },
    });
  };

  const columns = [
    {
      title: '用户',
      dataIndex: 'userId',
      key: 'user',
      render: (v) => v?.email || '-',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (v) => <Tag color="purple">{typeMap[v] || v}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v) => {
        const s = statusMap[v] || { text: v, color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (v, r) => r.status === 'processing' ? <Progress percent={v} size="small" /> : '-',
    },
    {
      title: '消耗',
      dataIndex: 'costCoins',
      key: 'costCoins',
      render: (v) => <Tag color="gold">{v} 🪙</Tag>,
    },
    {
      title: '耗时',
      dataIndex: 'processingTime',
      key: 'processingTime',
      render: (v) => v ? `${(v / 1000).toFixed(1)}秒` : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => dayjs(v).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'failed' && (
            <Button size="small" onClick={() => handleRetry(record)}>重试</Button>
          )}
          {['pending', 'processing'].includes(record.status) && (
            <Button size="small" danger onClick={() => handleCancel(record)}>取消</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>任务监控</h2>

      {/* 队列状态 */}
      {queue && (
        <Card title="队列状态" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={4}>
              <Statistic title="等待中" value={queue.waiting} valueStyle={{ color: '#f97316' }} />
            </Col>
            <Col span={4}>
              <Statistic title="处理中" value={queue.active} valueStyle={{ color: '#3b82f6' }} />
            </Col>
            <Col span={4}>
              <Statistic title="已完成" value={queue.completed} valueStyle={{ color: '#10b981' }} />
            </Col>
            <Col span={4}>
              <Statistic title="失败" value={queue.failed} valueStyle={{ color: '#ef4444' }} />
            </Col>
            <Col span={8}>
              <Space>
                <Button size="small" onClick={() => handleCleanQueue('completed')}>清理已完成</Button>
                <Button size="small" danger onClick={() => handleCleanQueue('failed')}>清理失败</Button>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* 任务统计 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="等待中" value={statusCounts.pending || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="处理中" value={statusCounts.processing || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="已完成" value={statusCounts.completed || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="失败" value={statusCounts.failed || 0} />
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="任务状态"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
          allowClear
        >
          <Select.Option value="pending">等待中</Select.Option>
          <Select.Option value="processing">处理中</Select.Option>
          <Select.Option value="completed">已完成</Select.Option>
          <Select.Option value="failed">失败</Select.Option>
        </Select>
        <Button icon={<ReloadOutlined />} onClick={() => loadTasks()}>
          刷新
        </Button>
      </Space>

      <Table
        loading={loading}
        dataSource={tasks}
        columns={columns}
        rowKey="_id"
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showTotal: (total) => `共 ${total} 个任务`,
          onChange: loadTasks,
        }}
      />
    </div>
  );
}
