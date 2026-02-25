import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message } from 'tdesign-react';

// 创建认证上下文
const AuthContext = createContext();

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 登录函数
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        Message.success('登录成功！');
        return true;
      } else {
        Message.error(data.error || '登录失败');
        return false;
      }
    } catch (error) {
      console.error('登录错误:', error);
      Message.error('网络错误，请稍后重试');
      return false;
    }
  };

  // 注册函数
  const register = async (username, email, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Message.success('注册成功！请登录');
        return true;
      } else {
        Message.error(data.error || '注册失败');
        return false;
      }
    } catch (error) {
      console.error('注册错误:', error);
      Message.error('网络错误，请稍后重试');
      return false;
    }
  };

  // 登出函数
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    Message.success('已退出登录');
  };

  // 检查用户登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('解析用户数据错误:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};