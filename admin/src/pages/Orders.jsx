import { useState, useEffect } from 'react';
import { Table, Select, Button, Tag, Space, Statistic, Card, Row, Col, message, Modal } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { ordersApi } from '../services/api';
import dayjs from 'dayjs';

export default function Orders() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');

  const loadOrders = async (page = 1) => {
    setLoading(true);
    try {
      const res = await ordersApi.getList({ page, limit: 20, status: statusFilter });
      setOrders(res.orders);
      setStats(res.stats);
      setPagination(res.pagination);
    } catch (error) {
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleRefund = (order) => {
    Modal.confirm({
      title: 'Refund Order',
      content: `Are you sure you want to refund order ${order.orderId}?`,
      onOk: async () => {
        try {
          await ordersApi.refund(order._id);
          message.success('Order refunded');
          loadOrders(pagination.page);
        } catch (error) {
          message.error(error.error || 'Refund failed');
        }
      },
    });
  };

  const statusColors = {
    pending: 'orange',
    paid: 'green',
    failed: 'red',
    refunded: 'purple',
    cancelled: 'default',
  };

  const columns = [
    { title: 'Order ID', dataIndex: 'orderId', key: 'orderId' },
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
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (v, r) => `$${v} ${r.currency}`,
    },
    {
      title: 'Coins',
      dataIndex: 'coins',
      key: 'coins',
      render: (v, r) => v ? `${v}${r.bonusCoins ? ` (+${r.bonusCoins})` : ''}` : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v) => <Tag color={statusColors[v]}>{v}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'paid' && (
            <Button size="small" danger onClick={() => handleRefund(record)}>
              Refund
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Orders</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              valueStyle={{ color: '#8b5cf6' }}
            />
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
          <Select.Option value="paid">Paid</Select.Option>
          <Select.Option value="failed">Failed</Select.Option>
          <Select.Option value="refunded">Refunded</Select.Option>
        </Select>
        <Button icon={<ReloadOutlined />} onClick={() => loadOrders()}>
          Refresh
        </Button>
      </Space>

      <Table
        loading={loading}
        dataSource={orders}
        columns={columns}
        rowKey="_id"
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          onChange: loadOrders,
        }}
      />
    </div>
  );
}
