import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await authApi.login(values.email, values.password);
      if (res.user && !res.user.isAdmin) {
        message.error('需要管理员权限');
        return;
      }
      setAuth(res.token, res.user);
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      message.error(error.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
    }}>
      <Card
        style={{ width: 400, background: '#1a1a1a', border: '1px solid #333' }}
        title={
          <div style={{ textAlign: 'center', color: '#8b5cf6', fontSize: 24 }}>
            Hot AI 运营后台
          </div>
        }
      >
        <Form onFinish={handleSubmit} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[{ required: true, message: '请输入邮箱' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="邮箱" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
