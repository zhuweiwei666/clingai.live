import { useState, useEffect } from 'react';
import { Table, Select, Button, Tag, Space, Card, Row, Col, Statistic, message, Modal, Progress } from 'antd';
import { ReloadOutlined, ClearOutlined } from '@ant-design/icons';
import { tasksApi } from '../services/api';
import dayjs from 'dayjs';

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
      message.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 10000); // Auto refresh every 10s
    return () => clearInterval(interval);
  }, [statusFilter]);

  const handleRetry = async (task) => {
    try {
      await tasksApi.retry(task._id);
      message.success('Task requeued');
      loadTasks(pagination.page);
    } catch (error) {
      message.error(error.error || 'Retry failed');
    }
  };

  const handleCancel = async (task) => {
    Modal.confirm({
      title: 'Cancel Task',
      content: 'Are you sure you want to cancel this task?',
      onOk: async () => {
        await tasksApi.cancel(task._id);
        message.success('Task cancelled');
        loadTasks(pagination.page);
      },
    });
  };

  const handleCleanQueue = (type) => {
    Modal.confirm({
      title: `Clean ${type} jobs`,
      content: `Are you sure you want to clean all ${type} jobs from the queue?`,
      onOk: async () => {
        await tasksApi.cleanQueue(type);
        message.success(`Cleaned ${type} jobs`);
        loadTasks();
      },
    });
  };

  const statusColors = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    failed: 'red',
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'user',
      render: (v) => v?.email || '-',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (v) => <Tag color="purple">{v}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v) => <Tag color={statusColors[v]}>{v}</Tag>,
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (v, r) => r.status === 'processing' ? <Progress percent={v} size="small" /> : '-',
    },
    {
      title: 'Cost',
      dataIndex: 'costCoins',
      key: 'costCoins',
      render: (v) => <Tag color="gold">{v}</Tag>,
    },
    {
      title: 'Time',
      dataIndex: 'processingTime',
      key: 'processingTime',
      render: (v) => v ? `${(v / 1000).toFixed(1)}s` : '-',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => dayjs(v).format('MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'failed' && (
            <Button size="small" onClick={() => handleRetry(record)}>Retry</Button>
          )}
          {['pending', 'processing'].includes(record.status) && (
            <Button size="small" danger onClick={() => handleCancel(record)}>Cancel</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Tasks</h2>

      {/* Queue Status */}
      {queue && (
        <Card title="Queue Status" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={4}>
              <Statistic title="Waiting" value={queue.waiting} valueStyle={{ color: '#f97316' }} />
            </Col>
            <Col span={4}>
              <Statistic title="Active" value={queue.active} valueStyle={{ color: '#3b82f6' }} />
            </Col>
            <Col span={4}>
              <Statistic title="Completed" value={queue.completed} valueStyle={{ color: '#10b981' }} />
            </Col>
            <Col span={4}>
              <Statistic title="Failed" value={queue.failed} valueStyle={{ color: '#ef4444' }} />
            </Col>
            <Col span={8}>
              <Space>
                <Button size="small" onClick={() => handleCleanQueue('completed')}>Clean Completed</Button>
                <Button size="small" danger onClick={() => handleCleanQueue('failed')}>Clean Failed</Button>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* Task Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Pending" value={statusCounts.pending || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Processing" value={statusCounts.processing || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Completed" value={statusCounts.completed || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Failed" value={statusCounts.failed || 0} />
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
          allowClear
        >
          <Select.Option value="pending">Pending</Select.Option>
          <Select.Option value="processing">Processing</Select.Option>
          <Select.Option value="completed">Completed</Select.Option>
          <Select.Option value="failed">Failed</Select.Option>
        </Select>
        <Button icon={<ReloadOutlined />} onClick={() => loadTasks()}>
          Refresh
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
          onChange: loadTasks,
        }}
      />
    </div>
  );
}
