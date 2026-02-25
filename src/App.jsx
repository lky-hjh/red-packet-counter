import React, { useState, useEffect } from 'react';
import { ConfigProvider } from 'tdesign-react';
import SimpleDashboard from './components/SimpleDashboard';
import LoginPage from './components/LoginPage';
import CounterPage from './components/CounterPage';

const App = () => {
  const [currentView, setCurrentView] = useState('login'); // login, dashboard, counter
  const [user, setUser] = useState(null);

  // 检查本地存储的登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setCurrentView('dashboard');
      } catch (error) {
        console.error('解析用户数据失败:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // 登录成功处理
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  // 登出处理
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('login');
  };

  // 导航到计数器页面
  const handleNavigateToCounter = () => {
    setCurrentView('counter');
  };

  // 返回主面板
  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // 渲染当前视图
  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case 'dashboard':
        return (
          <SimpleDashboard 
            onNavigateToCounter={handleNavigateToCounter}
            onLogout={handleLogout}
            user={user}
          />
        );
      case 'counter':
        return (
          <CounterPage 
            onBackToDashboard={handleBackToDashboard}
            user={user}
          />
        );
      default:
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <ConfigProvider>
      <div style={{ minHeight: '100vh' }}>
        {renderCurrentView()}
      </div>
    </ConfigProvider>
  );
};

export default App;