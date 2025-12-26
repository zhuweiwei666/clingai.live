import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, InputNumber, Switch, message, Image, Dropdown } from 'antd';
import { PlusOutlined, ReloadOutlined, DownOutlined } from '@ant-design/icons';
import { templatesApi } from '../services/api';

const categories = [
  { value: 'photo2video', label: 'Photo to Video' },
  { value: 'faceswap', label: 'Face Swap' },
  { value: 'dressup', label: 'Dress Up' },
  { value: 'hd', label: 'HD Upscale' },
  { value: 'remove', label: 'Remove' },
  { value: 'aiimage', label: 'AI Image' },
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
      message.error('Failed to load templates');
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
        message.success('Template updated');
      } else {
        await templatesApi.create(values);
        message.success('Template created');
      }
      setModal({ visible: false, editing: null });
      form.resetFields();
      loadTemplates(pagination.page);
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Delete Template',
      content: 'Are you sure you want to delete this template?',
      onOk: async () => {
        await templatesApi.delete(id);
        message.success('Template deleted');
        loadTemplates(pagination.page);
      },
    });
  };

  const handleBatchAction = async (action, value) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select templates first');
      return;
    }
    try {
      await templatesApi.batch(selectedRowKeys, action, value);
      message.success(`Updated ${selectedRowKeys.length} templates`);
      setSelectedRowKeys([]);
      loadTemplates(pagination.page);
    } catch (error) {
      message.error('Batch operation failed');
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
    { key: 'enable', label: 'Enable Selected', onClick: () => handleBatchAction('enabled', true) },
    { key: 'disable', label: 'Disable Selected', onClick: () => handleBatchAction('enabled', false) },
    { type: 'divider' },
    { key: 'super-on', label: 'Mark as Super', onClick: () => handleBatchAction('isSuper', true) },
    { key: 'super-off', label: 'Remove Super', onClick: () => handleBatchAction('isSuper', false) },
    { type: 'divider' },
    { key: 'new-on', label: 'Mark as New', onClick: () => handleBatchAction('isNew', true) },
    { key: 'new-off', label: 'Remove New', onClick: () => handleBatchAction('isNew', false) },
    { type: 'divider' },
    { key: 'hot-on', label: 'Mark as Hot', onClick: () => handleBatchAction('isHot', true) },
    { key: 'hot-off', label: 'Remove Hot', onClick: () => handleBatchAction('isHot', false) },
    { type: 'divider' },
    { key: 'trending-on', label: 'Mark as Trending', onClick: () => handleBatchAction('isTrending', true) },
    { key: 'trending-off', label: 'Remove Trending', onClick: () => handleBatchAction('isTrending', false) },
  ];

  const columns = [
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 80,
      render: (v) => <Image src={v} width={60} height={80} style={{ objectFit: 'cover', borderRadius: 4 }} />,
    },
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name',
      width: 180,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Cost',
      dataIndex: 'costCoins',
      key: 'costCoins',
      width: 80,
      render: (v) => <Tag color="gold">{v} 🪙</Tag>,
    },
    {
      title: 'Sort',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
      sorter: (a, b) => b.sortOrder - a.sortOrder,
    },
    {
      title: 'Tags',
      key: 'tags',
      width: 200,
      render: (_, r) => (
        <Space wrap>
          {r.isSuper && <Tag color="purple">Super</Tag>}
          {r.isNew && <Tag color="green">New</Tag>}
          {r.isHot && <Tag color="red">Hot</Tag>}
          {r.isTrending && <Tag color="orange">Trending</Tag>}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 90,
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Enabled' : 'Disabled'}</Tag>,
    },
    { 
      title: 'Usage', 
      dataIndex: 'usageCount', 
      key: 'usageCount',
      width: 70,
      sorter: (a, b) => b.usageCount - a.usageCount,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openModal(record)}>Edit</Button>
          <Button size="small" danger onClick={() => handleDelete(record._id)}>Delete</Button>
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
      <h2 style={{ marginBottom: 24 }}>Templates</h2>

      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          style={{ width: 150 }}
          allowClear
          options={categories}
        />
        <Button icon={<ReloadOutlined />} onClick={() => loadTemplates()}>Refresh</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Add Template
        </Button>
        <Dropdown menu={{ items: batchMenuItems }} disabled={selectedRowKeys.length === 0}>
          <Button>
            Batch Actions ({selectedRowKeys.length}) <DownOutlined />
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
          showTotal: (total) => `Total ${total} templates`,
          onChange: loadTemplates,
        }}
      />

      <Modal
        title={modal.editing ? 'Edit Template' : 'Add Template'}
        open={modal.visible}
        onCancel={() => { setModal({ visible: false, editing: null }); form.resetFields(); }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Template name" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={categories} placeholder="Select category" />
          </Form.Item>
          <Form.Item name="thumbnail" label="Thumbnail URL" rules={[{ required: true }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="previewVideo" label="Preview Video URL">
            <Input placeholder="https://... (optional)" />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item name="costCoins" label="Cost (coins)" initialValue={5} style={{ width: 150 }}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="sortOrder" label="Sort Order" initialValue={0} style={{ width: 150 }}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item label="Tags" style={{ marginBottom: 8 }}>
            <Space>
              <Form.Item name="isSuper" valuePropName="checked" noStyle><Switch checkedChildren="Super" unCheckedChildren="Super" /></Form.Item>
              <Form.Item name="isNew" valuePropName="checked" noStyle><Switch checkedChildren="New" unCheckedChildren="New" /></Form.Item>
              <Form.Item name="isHot" valuePropName="checked" noStyle><Switch checkedChildren="Hot" unCheckedChildren="Hot" /></Form.Item>
              <Form.Item name="isTrending" valuePropName="checked" noStyle><Switch checkedChildren="Trending" unCheckedChildren="Trending" /></Form.Item>
            </Space>
          </Form.Item>
          <Form.Item name="enabled" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
