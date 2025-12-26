import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, InputNumber, Switch, message, Image, Dropdown } from 'antd';
import { PlusOutlined, ReloadOutlined, DownOutlined } from '@ant-design/icons';
import { templatesApi } from '../services/api';

const categories = [
  { value: 'photo2video', label: '图生视频' },
  { value: 'faceswap', label: '换脸' },
  { value: 'dressup', label: '换装' },
  { value: 'hd', label: '高清放大' },
  { value: 'remove', label: '去背景' },
  { value: 'aiimage', label: 'AI绘图' },
];

export default function Templates() {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modal, setModal] = useState({ visible: false, editing: null });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();

  const loadTemplates = async (page = 1) => {
    setLoading(true);
    try {
      const res = await templatesApi.getList({ page, limit: 20, category: categoryFilter });
      setTemplates(res.templates);
      setPagination(res.pagination);
    } catch (error) {
      message.error('加载模板失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [categoryFilter]);

  const handleSave = async (values) => {
    try {
      if (modal.editing) {
        await templatesApi.update(modal.editing._id, values);
        message.success('模板已更新');
      } else {
        await templatesApi.create(values);
        message.success('模板已创建');
      }
      setModal({ visible: false, editing: null });
      form.resetFields();
      loadTemplates(pagination.page);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '删除模板',
      content: '确定要删除这个模板吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        await templatesApi.delete(id);
        message.success('模板已删除');
        loadTemplates(pagination.page);
      },
    });
  };

  const handleBatchAction = async (action, value) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择模板');
      return;
    }
    try {
      await templatesApi.batch(selectedRowKeys, action, value);
      message.success(`已更新 ${selectedRowKeys.length} 个模板`);
      setSelectedRowKeys([]);
      loadTemplates(pagination.page);
    } catch (error) {
      message.error('批量操作失败');
    }
  };

  const openModal = (template = null) => {
    setModal({ visible: true, editing: template });
    if (template) {
      form.setFieldsValue(template);
    } else {
      form.resetFields();
    }
  };

  const batchMenuItems = [
    { key: 'enable', label: '启用选中', onClick: () => handleBatchAction('enabled', true) },
    { key: 'disable', label: '禁用选中', onClick: () => handleBatchAction('enabled', false) },
    { type: 'divider' },
    { key: 'super-on', label: '设为Super', onClick: () => handleBatchAction('isSuper', true) },
    { key: 'super-off', label: '取消Super', onClick: () => handleBatchAction('isSuper', false) },
    { type: 'divider' },
    { key: 'new-on', label: '设为New', onClick: () => handleBatchAction('isNew', true) },
    { key: 'new-off', label: '取消New', onClick: () => handleBatchAction('isNew', false) },
    { type: 'divider' },
    { key: 'hot-on', label: '设为Hot', onClick: () => handleBatchAction('isHot', true) },
    { key: 'hot-off', label: '取消Hot', onClick: () => handleBatchAction('isHot', false) },
  ];

  const columns = [
    {
      title: '缩略图',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 80,
      render: (v) => <Image src={v} width={60} height={80} style={{ objectFit: 'cover', borderRadius: 4 }} />,
    },
    { 
      title: '名称', 
      dataIndex: 'name', 
      key: 'name',
      width: 180,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (v) => {
        const cat = categories.find(c => c.value === v);
        return <Tag color="blue">{cat?.label || v}</Tag>;
      },
    },
    {
      title: '消耗',
      dataIndex: 'costCoins',
      key: 'costCoins',
      width: 80,
      render: (v) => <Tag color="gold">{v} 🪙</Tag>,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
      sorter: (a, b) => b.sortOrder - a.sortOrder,
    },
    {
      title: '标签',
      key: 'tags',
      width: 180,
      render: (_, r) => (
        <Space wrap>
          {r.isSuper && <Tag color="purple">Super</Tag>}
          {r.isNew && <Tag color="green">New</Tag>}
          {r.isHot && <Tag color="red">Hot</Tag>}
          {r.isTrending && <Tag color="orange">热门</Tag>}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '禁用'}</Tag>,
    },
    { 
      title: '使用次数', 
      dataIndex: 'usageCount', 
      key: 'usageCount',
      width: 80,
      sorter: (a, b) => b.usageCount - a.usageCount,
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openModal(record)}>编辑</Button>
          <Button size="small" danger onClick={() => handleDelete(record._id)}>删除</Button>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>模板管理</h2>

      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="选择分类"
          value={categoryFilter}
          onChange={setCategoryFilter}
          style={{ width: 150 }}
          allowClear
          options={categories}
        />
        <Button icon={<ReloadOutlined />} onClick={() => loadTemplates()}>刷新</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          添加模板
        </Button>
        <Dropdown menu={{ items: batchMenuItems }} disabled={selectedRowKeys.length === 0}>
          <Button>
            批量操作 ({selectedRowKeys.length}) <DownOutlined />
          </Button>
        </Dropdown>
      </Space>

      <Table
        loading={loading}
        dataSource={templates}
        columns={columns}
        rowKey="_id"
        rowSelection={rowSelection}
        scroll={{ x: 1000 }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 个模板`,
          onChange: loadTemplates,
        }}
      />

      <Modal
        title={modal.editing ? '编辑模板' : '添加模板'}
        open={modal.visible}
        onCancel={() => { setModal({ visible: false, editing: null }); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="模板名称" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select options={categories} placeholder="选择分类" />
          </Form.Item>
          <Form.Item name="thumbnail" label="缩略图URL" rules={[{ required: true, message: '请输入缩略图URL' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="previewVideo" label="预览视频URL">
            <Input placeholder="https://... (可选)" />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="costCoins" label="消耗金币" initialValue={5} style={{ width: 150 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="sortOrder" label="排序值" initialValue={0} style={{ width: 150 }}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item label="标签" style={{ marginBottom: 8 }}>
            <Space>
              <Form.Item name="isSuper" valuePropName="checked" noStyle><Switch checkedChildren="Super" unCheckedChildren="Super" /></Form.Item>
              <Form.Item name="isNew" valuePropName="checked" noStyle><Switch checkedChildren="New" unCheckedChildren="New" /></Form.Item>
              <Form.Item name="isHot" valuePropName="checked" noStyle><Switch checkedChildren="Hot" unCheckedChildren="Hot" /></Form.Item>
              <Form.Item name="isTrending" valuePropName="checked" noStyle><Switch checkedChildren="热门" unCheckedChildren="热门" /></Form.Item>
            </Space>
          </Form.Item>
          <Form.Item name="enabled" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
