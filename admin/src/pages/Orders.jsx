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
      message.error('加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleRefund = (order) => {
    Modal.confirm({
      title: '退款确认',
      content: `确定要退款订单 ${order.orderId} 吗？`,
      okText: '确定退款',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await ordersApi.refund(order._id);
          message.success('退款成功');
          loadOrders(pagination.page);
        } catch (error) {
          message.error(error.error || '退款失败');
        }
      },
    });
  };

  const statusMap = {
    pending: { text: '待支付', color: 'orange' },
    paid: { text: '已支付', color: 'green' },
    failed: { text: '失败', color: 'red' },
    refunded: { text: '已退款', color: 'purple' },
    cancelled: { text: '已取消', color: 'default' },
  };

  const typeMap = {
    coins: '金币充值',
    subscription: '订阅',
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderId', key: 'orderId' },
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
      render: (v) => <Tag>{typeMap[v] || v}</Tag>,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (v, r) => `$${v} ${r.currency || 'USD'}`,
    },
    {
      title: '金币',
      dataIndex: 'coins',
      key: 'coins',
      render: (v, r) => v ? `${v}${r.bonusCoins ? ` (+${r.bonusCoins})` : ''}` : '-',
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
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'paid' && (
            <Button size="small" danger onClick={() => handleRefund(record)}>
              退款
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>订单管理</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总收入"
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
              title="总订单数"
              value={stats.totalOrders}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="订单状态"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
          allowClear
        >
          <Select.Option value="pending">待支付</Select.Option>
          <Select.Option value="paid">已支付</Select.Option>
          <Select.Option value="failed">失败</Select.Option>
          <Select.Option value="refunded">已退款</Select.Option>
        </Select>
        <Button icon={<ReloadOutlined />} onClick={() => loadOrders()}>
          刷新
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
          showTotal: (total) => `共 ${total} 条订单`,
          onChange: loadOrders,
        }}
      />
    </div>
  );
}
