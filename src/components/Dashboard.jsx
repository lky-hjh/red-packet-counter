import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Statistic, List, Avatar, Space, Tabs, Message } from 'tdesign-react';
import { 
  UserIcon, 
  GiftIcon, 
  ChartIcon, 
  TrophyIcon, 
  PlusIcon,
  CalendarIcon,
  MoneyIcon 
} from 'tdesign-icons-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [records, setRecords] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // 生成年份选项
  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= currentYear - 5; year--) {
    yearOptions.push({ label: `${year}年`, value: year });
  }

  // 获取用户数据
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [recordsRes, totalRes, leaderboardRes] = await Promise.all([
        fetch(`/api/records?year=${selectedYear}&userId=${user.id}`),
        fetch(`/api/total?year=${selectedYear}&userId=${user.id}`),
        fetch('/api/leaderboard')
      ]);

      if (recordsRes.ok) {
        const data = await recordsRes.json();
        setRecords(data.data || []);
      }

      if (totalRes.ok) {
        const data = await totalRes.json();
        setTotalAmount(data.data.total || 0);
      }

      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json();
        setLeaderboard(data.data || []);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      Message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建新的红包计数器
  const createNewCounter = () => {
    window.location.href = '/counter';
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, selectedYear]);

  // 格式化金额
  const formatAmount = (amount) => {
    return amount.toLocaleString('zh-CN');
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* 顶部导航栏 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <GiftIcon className="text-red-500 text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">红包管理系统</h1>
              <p className="text-gray-600">欢迎回来，{user?.username}！</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              options={yearOptions}
              prefixIcon={<CalendarIcon />}
              className="w-32"
            />
            <Button 
              theme="primary" 
              icon={<PlusIcon />}
              onClick={createNewCounter}
            >
              新建计数器
            </Button>
            <Button 
              variant="outline" 
              onClick={logout}
            >
              退出登录
            </Button>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：统计信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center gold-gradient border-0">
              <Statistic
                title={`${selectedYear}年总收入`}
                value={totalAmount}
                prefix="¥"
                style={{ color: '#c53030' }}
                valueStyle={{ fontSize: '2rem', fontWeight: 'bold' }}
              />
            </Card>
            <Card className="text-center silver-gradient border-0">
              <Statistic
                title="红包数量"
                value={records.length}
                suffix="个"
                style={{ color: '#4a5568' }}
                valueStyle={{ fontSize: '2rem', fontWeight: 'bold' }}
              />
            </Card>
            <Card className="text-center red-packet-gradient border-0">
              <Statistic
                title="平均金额"
                value={records.length > 0 ? Math.round(totalAmount / records.length) : 0}
                prefix="¥"
                style={{ color: 'white' }}
                valueStyle={{ fontSize: '2rem', fontWeight: 'bold' }}
              />
            </Card>
          </div>

          {/* 红包记录列表 */}
          <Card 
            title={
              <div className="flex items-center space-x-2">
                <GiftIcon />
                <span>红包记录</span>
                <span className="text-sm text-gray-500">({selectedYear}年)</span>
              </div>
            }
            className="h-96"
          >
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <GiftIcon className="text-4xl mb-4" />
                <p className="text-lg">暂无红包记录</p>
                <p className="text-sm">点击"新建计数器"开始记录</p>
              </div>
            ) : (
              <div className="h-64 overflow-y-auto custom-scrollbar">
                <List
                  split
                  data={records}
                  render={({ item }) => (
                    <List.Item>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <MoneyIcon className="text-red-500" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">红包收入</div>
                            <div className="text-sm text-gray-500">{formatTime(item.created_at)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-500">¥{formatAmount(item.amount)}</div>
                          <div className="text-sm text-gray-500">{item.source || '未知来源'}</div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Card>
        </div>

        {/* 右侧：排行榜和快捷操作 */}
        <div className="space-y-6">
          {/* 收入排行榜 */}
          <Card 
            title={
              <div className="flex items-center space-x-2">
                <TrophyIcon />
                <span>收入排行榜</span>
              </div>
            }
          >
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <TrophyIcon className="text-3xl mx-auto mb-2" />
                <p>暂无排行榜数据</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <Avatar size="small" className="bg-red-100">
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <span className="font-medium">{user.username}</span>
                    </div>
                    <span className="font-bold text-red-500">¥{formatAmount(user.total_amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 快捷操作 */}
          <Card title="快捷操作">
            <div className="space-y-3">
              <Button 
                block 
                theme="primary" 
                icon={<PlusIcon />}
                onClick={createNewCounter}
              >
                新建红包计数器
              </Button>
              <Button 
                block 
                variant="outline" 
                icon={<ChartIcon />}
                onClick={() => Message.info('数据分析功能开发中...')}
              >
                查看数据分析
              </Button>
              <Button 
                block 
                variant="outline" 
                icon={<CalendarIcon />}
                onClick={() => Message.info('年度报告功能开发中...')}
              >
                生成年度报告
              </Button>
            </div>
          </Card>

          {/* 隐私设置提示 */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">隐私设置</h4>
                <p className="text-sm text-blue-700 mt-1">
                  您的红包记录默认仅自己可见，可在设置中调整可见性
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;