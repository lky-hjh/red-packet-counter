import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Space, 
  Statistic, 
  Select, 
  Table, 
  Typography, 
  Row, 
  Col,
  Tag,
  Avatar,
  Divider,
  message,
  Dropdown
} from 'tdesign-react';
import { 
  UserIcon, 
  MoneyIcon, 
  ChartRingIcon, 
  AddIcon, 
  CalendarIcon,
  LeaderboardIcon,
  GiftIcon,
  LogoutIcon
} from 'tdesign-icons-react';

const MainDashboard = ({ onNavigateToCounter, onLogout, user }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [summaryData, setSummaryData] = useState({
    totalAmount: 0,
    packetCount: 0,
    averageAmount: 0
  });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // 年份选项
  const yearOptions = [
    { label: '2026年', value: 2026 },
    { label: '2025年', value: 2025 },
    { label: '2024年', value: 2024 },
    { label: '2023年', value: 2023 }
  ];

  // 模拟数据获取
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟汇总数据
      setSummaryData({
        totalAmount: 28650,
        packetCount: 42,
        averageAmount: 682
      });

      // 模拟排行榜数据
      setLeaderboardData([
        { rank: 1, username: '张三', totalAmount: 5680, packetCount: 8 },
        { rank: 2, username: '李四', totalAmount: 4320, packetCount: 6 },
        { rank: 3, username: '王五', totalAmount: 3980, packetCount: 5 },
        { rank: 4, username: '赵六', totalAmount: 2560, packetCount: 4 },
        { rank: 5, username: '钱七', totalAmount: 1890, packetCount: 3 }
      ]);

      // 模拟最近记录
      setRecentRecords([
        { id: 1, amount: 100, source: '爷爷', note: '新年快乐', time: '2026-02-25 10:30' },
        { id: 2, amount: 200, source: '奶奶', note: '学业进步', time: '2026-02-25 09:15' },
        { id: 3, amount: 50, source: '舅舅', note: '身体健康', time: '2026-02-24 20:00' }
      ]);

    } catch (error) {
      message.error('获取数据失败');
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建新计数器
  const handleCreateCounter = () => {
    message.success('创建红包计数器成功！');
    if (onNavigateToCounter) {
      onNavigateToCounter();
    }
  };

  // 查看排行榜
  const handleViewLeaderboard = () => {
    message.info('正在加载排行榜数据...');
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentYear]);

  // 排行榜表格列配置
  const leaderboardColumns = [
    {
      title: '排名',
      colKey: 'rank',
      width: 80,
      cell: ({ row }) => (
        <Tag 
          theme={row.rank <= 3 ? 'primary' : 'default'}
          shape="round"
        >
          {row.rank}
        </Tag>
      )
    },
    {
      title: '用户名',
      colKey: 'username',
      cell: ({ row }) => (
        <Space>
          <Avatar size="small" icon={<UserIcon />} />
          <span>{row.username}</span>
        </Space>
      )
    },
    {
      title: '总金额',
      colKey: 'totalAmount',
      cell: ({ row }) => (
        <Typography.Text strong theme="primary">
          ¥{row.totalAmount.toLocaleString()}
        </Typography.Text>
      )
    },
    {
      title: '红包数量',
      colKey: 'packetCount',
      cell: ({ row }) => `${row.packetCount}个`
    }
  ];

  // 最近记录表格列配置
  const recentRecordsColumns = [
    {
      title: '金额',
      colKey: 'amount',
      width: 100,
      cell: ({ row }) => (
        <Tag theme="primary" variant="light">
          ¥{row.amount}
        </Tag>
      )
    },
    {
      title: '来源',
      colKey: 'source',
      cell: ({ row }) => row.source
    },
    {
      title: '备注',
      colKey: 'note',
      cell: ({ row }) => row.note || '-' 
    },
    {
      title: '时间',
      colKey: 'time',
      width: 140,
      cell: ({ row }) => row.time
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
      {/* 头部标题和操作区域 */}
      <Row gutter={16} align="middle" style={{ marginBottom: '24px' }}>
        <Col flex="auto">
          <Typography.Title level="h1">
            <Space>
              <GiftIcon style={{ color: '#e74c3c' }} />
              红包管理系统
            </Space>
          </Typography.Title>
        </Col>
        <Col>
          <Space>
            <Select
              value={currentYear}
              options={yearOptions}
              onChange={(value) => setCurrentYear(value)}
              placeholder="选择年份"
              style={{ width: '120px' }}
            />
            <Dropdown
              trigger="click"
              options={[
                {
                  content: (
                    <Space>
                      <UserIcon />
                      {user?.username || '用户'}
                    </Space>
                  ),
                  value: 'profile',
                  disabled: true
                },
                { value: 'divider', type: 'divider' },
                {
                  content: (
                    <Space>
                      <LogoutIcon />
                      退出登录
                    </Space>
                  ),
                  value: 'logout',
                  onClick: onLogout
                }
              ]}
            >
              <Button variant="text">
                <Space>
                  <Avatar size="small" icon={<UserIcon />} />
                  {user?.username || '用户'}
                </Space>
              </Button>
            </Dropdown>
            <Button 
              icon={<AddIcon />} 
              theme="primary"
              onClick={handleCreateCounter}
            >
              新建计数器
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 数据汇总卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card 
            title="总金额统计" 
            bordered
            loading={loading}
            actions={[
              <Button key="view" variant="text" onClick={() => Message.info('查看详细统计')}>
                查看详情
              </Button>
            ]}
          >
            <Statistic
              title="累计红包总额"
              value={summaryData.totalAmount}
              prefix="¥"
              unit="元"
              extra={(
                <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                  {currentYear}年数据
                </div>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            title="红包数量" 
            bordered
            loading={loading}
            actions={[
              <Button key="view" variant="text" onClick={() => Message.info('查看红包分布')}>
                分析分布
              </Button>
            ]}
          >
            <Statistic
              title="收到红包总数"
              value={summaryData.packetCount}
              unit="个"
              extra={(
                <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                  平均¥{summaryData.averageAmount}/个
                </div>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            title="收入分析" 
            bordered
            loading={loading}
            actions={[
              <Button key="view" variant="text" onClick={() => Message.info('生成分析报告')}>
                生成报告
              </Button>
            ]}
          >
            <Statistic
              title="日均收入"
              value={Math.round(summaryData.totalAmount / 30)}
              prefix="¥"
              unit="元/天"
              extra={(
                <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                  基于30天计算
                </div>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 左侧：最近记录 */}
        <Col span={12}>
          <Card 
            title={
              <Space>
                <CalendarIcon />
                最近红包记录
              </Space>
            }
            bordered
            loading={loading}
            actions={[
              <Button key="refresh" variant="text" onClick={fetchDashboardData}>
                刷新
              </Button>
            ]}
          >
            <Table
              data={recentRecords}
              columns={recentRecordsColumns}
              size="small"
              rowKey="id"
              pagination={false}
              empty="暂无红包记录"
            />
          </Card>
        </Col>

        {/* 右侧：排行榜 */}
        <Col span={12}>
          <Card 
            title={
              <Space>
                <LeaderboardIcon />
                红包收入排行榜
              </Space>
            }
            bordered
            loading={loading}
            actions={[
              <Button 
                key="view" 
                variant="text" 
                icon={<ChartRingIcon />}
                onClick={handleViewLeaderboard}
              >
                查看完整榜
              </Button>
            ]}
          >
            <Table
              data={leaderboardData}
              columns={leaderboardColumns}
              size="small"
              rowKey="rank"
              pagination={false}
              empty="暂无排行榜数据"
            />
            <Divider />
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <Button 
                variant="outline" 
                onClick={() => Message.info('功能开发中...')}
              >
                查看我的排名
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 底部操作区域 */}
      <Card style={{ marginTop: '24px' }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Typography.Text type="secondary">
              系统提示：点击"新建计数器"开始记录您的红包收入
            </Typography.Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button variant="outline" onClick={() => Message.info('数据导出功能开发中')}>
                导出数据
              </Button>
              <Button variant="outline" onClick={() => Message.info('打印功能开发中')}>
                打印报表
              </Button>
              <Button theme="primary" onClick={handleCreateCounter}>
                <Space>
                  <MoneyIcon />
                  开始记录红包
                </Space>
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MainDashboard;