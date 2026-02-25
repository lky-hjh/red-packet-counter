import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  Form, 
  Input, 
  Space, 
  Typography, 
  Divider,
  message
} from 'tdesign-react';
import { UserIcon, LockOnIcon, GiftIcon } from 'tdesign-icons-react';

const LoginPage = ({ onLoginSuccess }) => {
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);

  // 登录处理（纯前端版本）
  const handleLogin = async (formData) => {
    console.log('登录表单数据:', formData);
    setLoading(true);
    try {
      // 模拟登录成功 - 纯前端版本不需要真实验证
      const user = {
        id: Date.now(),
        username: formData.email.split('@')[0] || '用户',
        email: formData.email
      };
      
      localStorage.setItem('token', 'frontend-token');
      localStorage.setItem('user', JSON.stringify(user));
      message.success('登录成功！');
      console.log('登录成功，用户信息:', user);
      onLoginSuccess(user);
    } catch (error) {
      message.error('登录失败');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 注册处理（纯前端版本）
  const handleRegister = async (formData) => {
    console.log('注册表单数据:', formData);
    setLoading(true);
    try {
      // 模拟注册成功
      message.success('注册成功！请登录');
      console.log('注册成功，切换到登录选项卡');
      setActiveTab('login');
      registerForm.reset();
    } catch (error) {
      message.error('注册失败');
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 快速登录（演示用）
  const handleQuickLogin = () => {
    const demoUser = {
      id: 1,
      username: 'demo',
      email: 'demo@example.com'
    };
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('user', JSON.stringify(demoUser));
    message.success('演示模式登录成功！');
    onLoginSuccess(demoUser);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        bordered 
        style={{ 
          width: '400px', 
          maxWidth: '90vw',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}
        header={
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Space direction="vertical" size="small">
              <GiftIcon style={{ fontSize: '48px', color: '#e74c3c' }} />
              <Typography.Title level="h2" style={{ margin: 0, color: '#e74c3c' }}>
                红包管理系统
              </Typography.Title>
              <Typography.Text type="secondary">
                记录和管理您的红包收入
              </Typography.Text>
            </Space>
          </div>
        }
      >
        {/* 选项卡切换 */}
        <div style={{ marginBottom: '24px' }}>
          <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              variant={activeTab === 'login' ? 'base' : 'text'}
              onClick={() => setActiveTab('login')}
              style={{ 
                fontWeight: activeTab === 'login' ? 'bold' : 'normal',
                borderBottom: activeTab === 'login' ? '2px solid #e74c3c' : 'none'
              }}
            >
              登录
            </Button>
            <Button
              variant={activeTab === 'register' ? 'base' : 'text'}
              onClick={() => setActiveTab('register')}
              style={{ 
                fontWeight: activeTab === 'register' ? 'bold' : 'normal',
                borderBottom: activeTab === 'register' ? '2px solid #e74c3c' : 'none'
              }}
            >
              注册
            </Button>
          </Space>
        </div>

        {/* 登录表单 */}
        {activeTab === 'login' && (
          <Form
            form={loginForm}
            onSubmit={() => {
              console.log('登录表单提交事件触发');
              loginForm.validate().then((result) => {
                console.log('登录表单验证结果:', result);
                if (result === true) {
                  const formData = loginForm.getFieldsValue(true);
                  console.log('登录表单数据:', formData);
                  handleLogin(formData);
                } else {
                  console.log('登录表单验证失败:', result);
                }
              });
            }}
            labelWidth={80}
            colon={false}
          >
            <Form.FormItem
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input prefix={<UserIcon />} placeholder="请输入邮箱" />
            </Form.FormItem>

            <Form.FormItem
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度至少6位' }
              ]}
            >
              <Input type="password" prefix={<LockOnIcon />} placeholder="请输入密码" autocomplete="current-password" />
            </Form.FormItem>

            <Form.FormItem style={{ marginBottom: '16px' }}>
              <Button 
                theme="primary" 
                block 
                type="submit" 
                loading={loading}
              >
                登录
              </Button>
            </Form.FormItem>
          </Form>
        )}

        {/* 注册表单 */}
        {activeTab === 'register' && (
          <Form
            form={registerForm}
            onFinish={handleRegister}
            onSubmit={() => {
              console.log('注册表单提交事件触发');
              registerForm.validate().then((result) => {
                console.log('注册表单验证结果:', result);
                if (result === true) {
                  const formData = registerForm.getFieldsValue(true);
                  console.log('注册表单数据:', formData);
                  handleRegister(formData);
                } else {
                  console.log('注册表单验证失败:', result);
                }
              });
            }}
            labelWidth={80}
            colon={false}
          >
            <Form.FormItem
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 2, message: '用户名长度至少2位' }
              ]}
            >
              <Input prefix={<UserIcon />} placeholder="请输入用户名" autocomplete="username" />
            </Form.FormItem>

            <Form.FormItem
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input prefix={<UserIcon />} placeholder="请输入邮箱" autocomplete="email" />
            </Form.FormItem>

            <Form.FormItem
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度至少6位' }
              ]}
            >
              <Input type="password" prefix={<LockOnIcon />} placeholder="请输入密码" autocomplete="new-password" />
            </Form.FormItem>

            <Form.FormItem style={{ marginBottom: '16px' }}>
              <Button 
                theme="primary" 
                block 
                type="submit" 
                loading={loading}
              >
                注册
              </Button>
            </Form.FormItem>
          </Form>
        )}

        <Divider>
          <Typography.Text type="secondary">或</Typography.Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Button variant="outline" onClick={handleQuickLogin}>
            快速体验（演示模式）
          </Button>
        </div>

        {/* 调试按钮 */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Button variant="text" size="small" onClick={() => {
            console.log('测试注册函数');
            handleRegister({ validateResult: true, username: 'test', email: 'test@test.com', password: '123456' });
          }}>
            调试：测试注册功能
          </Button>
        </div>

        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: '#f5f7fa', 
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          演示账号：demo@example.com / 任意密码
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;