import { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Tag, Space, Modal, InputNumber, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { usersApi } from '../services/api';
import dayjs from 'dayjs';

export default function Users() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [coinModal, setCoinModal] = useState({ visible: false, user: null, amount: 0 });

  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await usersApi.getList({ page, limit: 20, search, plan: planFilter });
      setUsers(res.users);
      setPagination(res.pagination);
    } catch (error) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, planFilter]);

  const handleBan = async (user) => {
    try {
      await usersApi.toggleBan(user._id);
      message.success(user.isBanned ? 'User unbanned' : 'User banned');
      loadUsers(pagination.page);
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleModifyCoins = async () => {
    try {
      await usersApi.modifyCoins(coinModal.user._id, coinModal.amount, 'Admin adjustment');
      message.success('Coins updated');
      setCoinModal({ visible: false, user: null, amount: 0 });
      loadUsers(pagination.page);
    } catch (error) {
      message.error(error.error || 'Failed to update coins');
    }
  };

  const columns = [
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    {
      title: 'Coins',
      dataIndex: 'coins',
      key: 'coins',
      render: (v) => <Tag color="gold">{v}</Tag>,
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (v) => (
        <Tag color={v === 'free' ? 'default' : 'purple'}>{v}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isBanned',
      key: 'status',
      render: (v) => (
        <Tag color={v ? 'red' : 'green'}>{v ? 'Banned' : 'Active'}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => setCoinModal({ visible: true, user: record, amount: 0 })}
          >
            Coins
          </Button>
          <Button
            size="small"
            danger={!record.isBanned}
            onClick={() => handleBan(record)}
          >
            {record.isBanned ? 'Unban' : 'Ban'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Users</h2>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search email/username"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 250 }}
        />
        <Select
          placeholder="Plan"
          value={planFilter}
          onChange={setPlanFilter}
          style={{ width: 120 }}
          allowClear
        >
          <Select.Option value="free">Free</Select.Option>
          <Select.Option value="basic">Basic</Select.Option>
          <Select.Option value="pro">Pro</Select.Option>
          <Select.Option value="unlimited">Unlimited</Select.Option>
        </Select>
        <Button icon={<ReloadOutlined />} onClick={() => loadUsers()}>
          Refresh
        </Button>
      </Space>

      <Table
        loading={loading}
        dataSource={users}
        columns={columns}
        rowKey="_id"
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          onChange: loadUsers,
        }}
      />

      <Modal
        title={`Modify Coins - ${coinModal.user?.email}`}
        open={coinModal.visible}
        onOk={handleModifyCoins}
        onCancel={() => setCoinModal({ visible: false, user: null, amount: 0 })}
      >
        <p>Current coins: <strong>{coinModal.user?.coins}</strong></p>
        <InputNumber
          value={coinModal.amount}
          onChange={(v) => setCoinModal({ ...coinModal, amount: v })}
          style={{ width: '100%' }}
          placeholder="Enter positive to add, negative to deduct"
        />
      </Modal>
    </div>
  );
}
