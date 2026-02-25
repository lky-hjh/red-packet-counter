import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Message } from 'tdesign-react';
import { UserIcon, GiftIcon, ChartIcon, TrophyIcon } from 'tdesign-icons-react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import CounterPage from './components/CounterPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// 主题配置
const themeConfig = {
  // 自定义主题色
  colors: {
    primary: '#e53e3e', // 红色主题
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  }
};

// 路由保护组件
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// 主应用组件
const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50">
      <Router>
        <Routes>
          {/* 登录页面 */}
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <LoginPage />
            } 
          />
          
          {/* 受保护的路由 */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/counter" 
            element={
              <ProtectedRoute>
                <CounterPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 默认重定向 */}
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
          
          {/* 404页面 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
                <p className="text-xl text-gray-600">页面未找到</p>
                <button 
                  onClick={() => window.history.back()}
                  className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  返回上一页
                </button>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </div>
  );
};

// 主应用入口
const App = () => {
  return (
    <ConfigProvider globalConfig={{
      // 全局配置
      calendar: {
        firstDayOfWeek: 1,
      },
      table: {
        // 表格配置
      },
    }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;