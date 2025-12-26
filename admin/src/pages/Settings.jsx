import { useState, useEffect } from 'react';
import { Card, Form, InputNumber, Button, Space, Switch, Input, Table, message, Tabs, Popconfirm } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { settingsApi } from '../services/api';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});
  const [coinPackages, setCoinPackages] = useState([]);
  const [featureCosts, setFeatureCosts] = useState({});
  const [maintenance, setMaintenance] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getAll();
      setSettings(res.settings);
      setCoinPackages(res.settings.coinPackages || []);
      setFeatureCosts(res.settings.featureCosts || {});
      setMaintenance(res.settings.maintenance || false);
      setAnnouncement(res.settings.announcement || '');
    } catch (error) {
      message.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveCoinPackages = async () => {
    try {
      await settingsApi.updateCoinPackages(coinPackages);
      message.success('Coin packages saved');
    } catch (error) {
      message.error('Failed to save');
    }
  };

  const saveFeatureCosts = async () => {
    try {
      await settingsApi.updateFeatureCosts(featureCosts);
      message.success('Feature costs saved');
    } catch (error) {
      message.error('Failed to save');
    }
  };

  const toggleMaintenance = async () => {
    try {
      await settingsApi.setMaintenance(!maintenance);
      setMaintenance(!maintenance);
      message.success(`Maintenance mode ${!maintenance ? 'enabled' : 'disabled'}`);
    } catch (error) {
      message.error('Failed to update');
    }
  };

  const saveAnnouncement = async () => {
    try {
      await settingsApi.setAnnouncement(announcement);
      message.success('Announcement saved');
    } catch (error) {
      message.error('Failed to save');
    }
  };

  const addCoinPackage = () => {
    setCoinPackages([
      ...coinPackages,
      { id: `pkg_${Date.now()}`, coins: 100, price: 9.99, bonus: 0 },
    ]);
  };

  const removeCoinPackage = (index) => {
    setCoinPackages(coinPackages.filter((_, i) => i !== index));
  };

  const updateCoinPackage = (index, field, value) => {
    const updated = [...coinPackages];
    updated[index][field] = value;
    setCoinPackages(updated);
  };

  const packageColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (v, _, i) => (
        <Input
          value={v}
          onChange={(e) => updateCoinPackage(i, 'id', e.target.value)}
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: 'Coins',
      dataIndex: 'coins',
      key: 'coins',
      render: (v, _, i) => (
        <InputNumber
          value={v}
          onChange={(val) => updateCoinPackage(i, 'coins', val)}
          min={1}
        />
      ),
    },
    {
      title: 'Price ($)',
      dataIndex: 'price',
      key: 'price',
      render: (v, _, i) => (
        <InputNumber
          value={v}
          onChange={(val) => updateCoinPackage(i, 'price', val)}
          min={0}
          precision={2}
        />
      ),
    },
    {
      title: 'Bonus',
      dataIndex: 'bonus',
      key: 'bonus',
      render: (v, _, i) => (
        <InputNumber
          value={v}
          onChange={(val) => updateCoinPackage(i, 'bonus', val)}
          min={0}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, __, i) => (
        <Popconfirm title="Delete this package?" onConfirm={() => removeCoinPackage(i)}>
          <Button icon={<DeleteOutlined />} danger size="small" />
        </Popconfirm>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'packages',
      label: 'Coin Packages',
      children: (
        <Card>
          <Space style={{ marginBottom: 16 }}>
            <Button icon={<PlusOutlined />} onClick={addCoinPackage}>Add Package</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={saveCoinPackages}>Save</Button>
          </Space>
          <Table
            dataSource={coinPackages}
            columns={packageColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      ),
    },
    {
      key: 'costs',
      label: 'Feature Costs',
      children: (
        <Card>
          <Form layout="vertical">
            {Object.entries(featureCosts).map(([key, value]) => (
              <Form.Item key={key} label={key} style={{ display: 'inline-block', marginRight: 16 }}>
                <InputNumber
                  value={value}
                  onChange={(v) => setFeatureCosts({ ...featureCosts, [key]: v })}
                  min={1}
                  addonAfter="coins"
                />
              </Form.Item>
            ))}
          </Form>
          <Button type="primary" icon={<SaveOutlined />} onClick={saveFeatureCosts}>
            Save Feature Costs
          </Button>
        </Card>
      ),
    },
    {
      key: 'system',
      label: 'System',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Card title="Maintenance Mode">
            <Space>
              <Switch checked={maintenance} onChange={toggleMaintenance} />
              <span>{maintenance ? 'Enabled - Site is in maintenance mode' : 'Disabled'}</span>
            </Space>
          </Card>
          <Card title="Announcement">
            <Input.TextArea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              rows={4}
              placeholder="Enter announcement text (leave empty to hide)"
            />
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={saveAnnouncement}
              style={{ marginTop: 16 }}
            >
              Save Announcement
            </Button>
          </Card>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Settings</h2>
      <Tabs items={tabItems} />
    </div>
  );
}
