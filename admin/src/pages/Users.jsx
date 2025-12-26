import { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Tag, Space, Modal, InputNumber, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { usersApi } from '../services/api';
import dayjs from 'dayjs';

const planMap = {
  free: '免费版',
  basic: '基础版',
  pro: '专业版',
  unlimited: '无限版',
};

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
      message.error('加载用户失败');
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
      message.success(user.isBanned ? '已解封用户' : '已封禁用户');
      loadUsers(pagination.page);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleModifyCoins = async () => {
    try {
      await usersApi.modifyCoins(coinModal.user._id, coinModal.amount, '管理员调整');
      message.success('金币已更新');
      setCoinModal({ visible: false, user: null, amount: 0 });
      loadUsers(pagination.page);
    } catch (error) {
      message.error(error.error || '更新金币失败');
    }
  };

  const columns = [
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    {
      title: '金币',
      dataIndex: 'coins',
      key: 'coins',
      render: (v) => <Tag color="gold">{v} 🪙</Tag>,
    },
    {
      title: '会员等级',
      dataIndex: 'plan',
      key: 'plan',
      render: (v) => (
        <Tag color={v === 'free' ? 'default' : 'purple'}>{planMap[v] || v}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isBanned',
      key: 'status',
      render: (v) => (
        <Tag color={v ? 'red' : 'green'}>{v ? '已封禁' : '正常'}</Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => setCoinModal({ visible: true, user: record, amount: 0 })}
          >
            调整金币
          </Button>
          <Button
            size="small"
            danger={!record.isBanned}
            onClick={() => handleBan(record)}
          >
            {record.isBanned ? '解封' : '封禁'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>用户管理</h2>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索邮箱/用户名"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 250 }}
        />
        <Select
          placeholder="会员等级"
          value={planFilter}
          onChange={setPlanFilter}
          style={{ width: 120 }}
          allowClear
        >
          <Select.Option value="free">免费版</Select.Option>
          <Select.Option value="basic">基础版</Select.Option>
          <Select.Option value="pro">专业版</Select.Option>
          <Select.Option value="unlimited">无限版</Select.Option>
        </Select>
        <Button icon={<ReloadOutlined />} onClick={() => loadUsers()}>
          刷新
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
          showTotal: (total) => `共 ${total} 个用户`,
          onChange: loadUsers,
        }}
      />

      <Modal
        title={`调整金币 - ${coinModal.user?.email}`}
        open={coinModal.visible}
        onOk={handleModifyCoins}
        onCancel={() => setCoinModal({ visible: false, user: null, amount: 0 })}
        okText="确定"
        cancelText="取消"
      >
        <p>当前金币: <strong>{coinModal.user?.coins}</strong></p>
        <InputNumber
          value={coinModal.amount}
          onChange={(v) => setCoinModal({ ...coinModal, amount: v })}
          style={{ width: '100%' }}
          placeholder="正数增加，负数扣除"
        />
      </Modal>
    </div>
  );
}
