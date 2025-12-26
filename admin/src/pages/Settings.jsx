import { useState, useEffect } from 'react';
import { Card, Form, InputNumber, Button, Space, Switch, Input, Table, message, Tabs, Popconfirm } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { settingsApi } from '../services/api';

const featureNames = {
  photo2video: '图生视频',
  faceswap: '换脸',
  faceswap_video: '视频换脸',
  dressup: '换装',
  hd: '高清放大',
  remove: '去背景',
  aiimage: 'AI绘图',
};

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
      message.error('加载设置失败');
    } finally {
      setLoading(false);
    }
  };

  const saveCoinPackages = async () => {
    try {
      await settingsApi.updateCoinPackages(coinPackages);
      message.success('金币套餐已保存');
    } catch (error) {
      message.error('保存失败');
    }
  };

  const saveFeatureCosts = async () => {
    try {
      await settingsApi.updateFeatureCosts(featureCosts);
      message.success('功能消耗已保存');
    } catch (error) {
      message.error('保存失败');
    }
  };

  const toggleMaintenance = async () => {
    try {
      await settingsApi.setMaintenance(!maintenance);
      setMaintenance(!maintenance);
      message.success(`维护模式已${!maintenance ? '开启' : '关闭'}`);
    } catch (error) {
      message.error('更新失败');
    }
  };

  const saveAnnouncement = async () => {
    try {
      await settingsApi.setAnnouncement(announcement);
      message.success('公告已保存');
    } catch (error) {
      message.error('保存失败');
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
      title: '金币数量',
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
      title: '价格 ($)',
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
      title: '赠送',
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
      title: '操作',
      key: 'action',
      render: (_, __, i) => (
        <Popconfirm title="确定删除这个套餐吗？" onConfirm={() => removeCoinPackage(i)} okText="确定" cancelText="取消">
          <Button icon={<DeleteOutlined />} danger size="small" />
        </Popconfirm>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'packages',
      label: '金币套餐',
      children: (
        <Card>
          <Space style={{ marginBottom: 16 }}>
            <Button icon={<PlusOutlined />} onClick={addCoinPackage}>添加套餐</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={saveCoinPackages}>保存</Button>
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
      label: '功能消耗',
      children: (
        <Card>
          <Form layout="vertical">
            {Object.entries(featureCosts).map(([key, value]) => (
              <Form.Item key={key} label={featureNames[key] || key} style={{ display: 'inline-block', marginRight: 16 }}>
                <InputNumber
                  value={value}
                  onChange={(v) => setFeatureCosts({ ...featureCosts, [key]: v })}
                  min={1}
                  addonAfter="金币"
                />
              </Form.Item>
            ))}
          </Form>
          <Button type="primary" icon={<SaveOutlined />} onClick={saveFeatureCosts}>
            保存功能消耗
          </Button>
        </Card>
      ),
    },
    {
      key: 'system',
      label: '系统设置',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Card title="维护模式">
            <Space>
              <Switch checked={maintenance} onChange={toggleMaintenance} />
              <span>{maintenance ? '已开启 - 网站处于维护状态' : '已关闭'}</span>
            </Space>
          </Card>
          <Card title="系统公告">
            <Input.TextArea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              rows={4}
              placeholder="输入公告内容（留空则不显示）"
            />
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={saveAnnouncement}
              style={{ marginTop: 16 }}
            >
              保存公告
            </Button>
          </Card>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>系统设置</h2>
      <Tabs items={tabItems} />
    </div>
  );
}
