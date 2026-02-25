import React, { useState } from 'react';
import { Card, Button, Input, Tabs, Message, Space } from 'tdesign-react';
import { UserIcon, GiftIcon } from 'tdesign-icons-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  
  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  // 注册表单状态
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // 处理登录
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login(loginForm.email, loginForm.password);
    setLoading(false);
  };

  // 处理注册
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      Message.error('两次输入的密码不一致');
      return;
    }
    
    if (registerForm.password.length < 6) {
      Message.error('密码长度至少6位');
      return;
    }
    
    setLoading(true);
    const success = await register(registerForm.username, registerForm.email, registerForm.password);
    setLoading(false);
    
    if (success) {
      setActiveTab('login');
      setRegisterForm({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 头部标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
            <GiftIcon className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">红包管理系统</h1>
          <p className="text-gray-600">记录您的每一份祝福与收获</p>
        </div>

        {/* 登录/注册卡片 */}
        <Card 
          className="shadow-xl border-0"
          header={
            <Tabs 
              value={activeTab} 
              onChange={setActiveTab}
              theme="card"
              size="large"
            >
              <Tabs.TabPanel value="login" label="登录账户">
                <div className="flex items-center space-x-2">
                  <UserIcon />
                  <span>登录</span>
                </div>
              </Tabs.TabPanel>
              <Tabs.TabPanel value="register" label="注册账户">
                <div className="flex items-center space-x-2">
                  <UserIcon />
                  <span>注册</span>
                </div>
              </Tabs.TabPanel>
            </Tabs>
          }
        >
          {/* 登录表单 */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="请输入邮箱"
                prefixIcon={<UserIcon />}
                value={loginForm.email}
                onChange={(value) => setLoginForm({...loginForm, email: value})}
                required
              />
              <Input
                type="password"
                placeholder="请输入密码"
                prefixIcon={<LockIcon />}
                value={loginForm.password}
                onChange={(value) => setLoginForm({...loginForm, password: value})}
                required
              />
              <Button 
                type="submit" 
                theme="primary" 
                block
                loading={loading}
                className="h-12"
              >
                登录
              </Button>
            </form>
          )}

          {/* 注册表单 */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                placeholder="请输入用户名"
                prefixIcon={<UserIcon />}
                value={registerForm.username}
                onChange={(value) => setRegisterForm({...registerForm, username: value})}
                required
              />
              <Input
                type="email"
                placeholder="请输入邮箱"
                prefixIcon={<UserIcon />}
                value={registerForm.email}
                onChange={(value) => setRegisterForm({...registerForm, email: value})}
                required
              />
              <Input
                type="password"
                placeholder="请输入密码（至少6位）"
                prefixIcon={<LockIcon />}
                value={registerForm.password}
                onChange={(value) => setRegisterForm({...registerForm, password: value})}
                required
              />
              <Input
                type="password"
                placeholder="请确认密码"
                prefixIcon={<LockIcon />}
                value={registerForm.confirmPassword}
                onChange={(value) => setRegisterForm({...registerForm, confirmPassword: value})}
                required
              />
              <Button 
                type="submit" 
                theme="primary" 
                block
                loading={loading}
                className="h-12"
              >
                注册
              </Button>
            </form>
          )}
        </Card>

        {/* 功能说明 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <GiftIcon className="text-red-500 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-900">红包记录</h3>
            <p className="text-sm text-gray-600">详细记录每一份红包</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <UserIcon className="text-yellow-500 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-900">年份筛选</h3>
            <p className="text-sm text-gray-600">按年份查看历史记录</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <LockIcon className="text-green-500 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-900">数据安全</h3>
            <p className="text-sm text-gray-600">保护您的隐私数据</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;