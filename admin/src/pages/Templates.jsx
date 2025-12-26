import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, InputNumber, Switch, message, Image } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
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

  const openModal = (template = null) => {
    setModal({ visible: true, editing: template });
    if (template) {
      form.setFieldsValue(template);
    } else {
      form.resetFields();
    }
  };

  const columns = [
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      render: (v) => <Image src={v} width={60} height={80} style={{ objectFit: 'cover', borderRadius: 4 }} />,
    },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Cost',
      dataIndex: 'costCoins',
      key: 'costCoins',
      render: (v) => <Tag color="gold">{v} coins</Tag>,
    },
    {
      title: 'Tags',
      key: 'tags',
      render: (_, r) => (
        <Space>
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
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Enabled' : 'Disabled'}</Tag>,
    },
    { title: 'Usage', dataIndex: 'usageCount', key: 'usageCount' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openModal(record)}>Edit</Button>
          <Button size="small" danger onClick={() => handleDelete(record._id)}>Delete</Button>
        </Space>
      ),
    },
  ];

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
      </Space>

      <Table
        loading={loading}
        dataSource={templates}
        columns={columns}
        rowKey="_id"
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
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
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={categories} />
          </Form.Item>
          <Form.Item name="thumbnail" label="Thumbnail URL" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="previewVideo" label="Preview Video URL">
            <Input />
          </Form.Item>
          <Form.Item name="costCoins" label="Cost (coins)" initialValue={5}>
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sort Order" initialValue={0}>
            <InputNumber />
          </Form.Item>
          <Space>
            <Form.Item name="isSuper" valuePropName="checked"><Switch checkedChildren="Super" /></Form.Item>
            <Form.Item name="isNew" valuePropName="checked"><Switch checkedChildren="New" /></Form.Item>
            <Form.Item name="isHot" valuePropName="checked"><Switch checkedChildren="Hot" /></Form.Item>
            <Form.Item name="isTrending" valuePropName="checked"><Switch checkedChildren="Trending" /></Form.Item>
            <Form.Item name="enabled" valuePropName="checked" initialValue={true}><Switch checkedChildren="Enabled" /></Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
