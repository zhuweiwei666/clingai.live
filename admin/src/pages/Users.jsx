import { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Tag, Space, Modal, InputNumber, message, Drawer, Descriptions, Tabs, Image } from 'antd';
import { SearchOutlined, ReloadOutlined, UserOutlined, FileImageOutlined, DollarOutlined } from '@ant-design/icons';
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
  const [detailVisible, setDetailVisible] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const loadUserDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await usersApi.getDetail(id);
      setUserDetail(res);
      setDetailVisible(true);
    } catch (error) {
      message.error('获取详情失败');
    } finally {
      setDetailLoading(false);
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
          <Button size="small" onClick={() => loadUserDetail(record._id)}>详情</Button>
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

      <Drawer
        title="用户详情"
        width={800}
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
      >
        {detailLoading || !userDetail ? (
          <p>加载中...</p>
        ) : (
          <>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="ID">{userDetail.user._id}</Descriptions.Item>
              <Descriptions.Item label="用户名">{userDetail.user.username}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{userDetail.user.email}</Descriptions.Item>
              <Descriptions.Item label="会员等级">{planMap[userDetail.user.plan]}</Descriptions.Item>
              <Descriptions.Item label="金币余额">{userDetail.user.coins}</Descriptions.Item>
              <Descriptions.Item label="注册时间">{dayjs(userDetail.user.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Tabs
                items={[
                  {
                    key: 'stats',
                    label: '数据统计',
                    children: (
                      <Descriptions bordered column={3}>
                        <Descriptions.Item label="生成作品数">{userDetail.stats.works}</Descriptions.Item>
                        <Descriptions.Item label="充值订单数">{userDetail.stats.orders}</Descriptions.Item>
                        <Descriptions.Item label="任务总数">{userDetail.stats.tasks}</Descriptions.Item>
                      </Descriptions>
                    ),
                  },
                  {
                    key: 'orders',
                    label: '最近充值',
                    children: (
                      <Table
                        dataSource={userDetail.recentOrders}
                        rowKey="_id"
                        pagination={false}
                        size="small"
                        columns={[
                          { title: '订单号', dataIndex: 'orderId' },
                          { title: '金额', dataIndex: 'amount', render: v => `$${v}` },
                          { title: '金币', dataIndex: 'coins' },
                          { title: '状态', dataIndex: 'status' },
                          { title: '时间', dataIndex: 'createdAt', render: v => dayjs(v).format('MM-DD HH:mm') },
                        ]}
                      />
                    ),
                  },
                  {
                    key: 'works',
                    label: '最近作品',
                    children: (
                      <Table
                        dataSource={userDetail.recentWorks}
                        rowKey="_id"
                        pagination={false}
                        size="small"
                        columns={[
                          { title: '类型', dataIndex: 'type' },
                          { title: '缩略图', dataIndex: 'thumbnail', render: v => v ? <Image src={v} width={40} /> : '-' },
                          { title: '结果', dataIndex: 'resultUrl', render: v => v ? <a href={v} target="_blank">查看</a> : '-' },
                          { title: '时间', dataIndex: 'createdAt', render: v => dayjs(v).format('MM-DD HH:mm') },
                        ]}
                      />
                    ),
                  },
                ]}
              />
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
