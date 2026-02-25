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
  Progress
} from 'tdesign-react';
import { 
  UserIcon, 
  MoneyIcon, 
  ChartRingIcon, 
  AddIcon, 
  CalendarIcon,
  LeaderboardIcon,
  GiftIcon,
  LogoutIcon,
  ChartBarIcon
} from 'tdesign-icons-react';
import { db } from '../utils/IndexedDB';

const SimpleDashboard = ({ onNavigateToCounter, onLogout }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [summaryData, setSummaryData] = useState({
    totalAmount: 0,
    packetCount: 0,
    averageAmount: 0
  });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [amountDistribution, setAmountDistribution] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 获取可用年份
      const years = await db.getAvailableYears();
      const yearOptions = years.map(year => ({
        label: `${year}年`,
        value: year
      }));
      
      if (years.length > 0) {
        setYearOptions(yearOptions);
      } else {
        // 如果没有数据，添加当前年份选项
        setYearOptions([{ label: `${currentYear}年`, value: currentYear }]);
      }

      // 获取当前年份的数据
      const records = await db.getAllRedPackets(currentYear);
      const totalAmount = await db.getTotalAmount(currentYear);
      const leaderboard = await db.getIncomeRanking(currentYear);
      
      // 设置汇总数据
      setSummaryData({
        totalAmount: totalAmount,
        packetCount: records.length,
        averageAmount: records.length > 0 ? Math.round(totalAmount / records.length) : 0
      });
      
      // 设置排行榜数据
      setLeaderboardData(leaderboard.map((item, index) => ({
        rank: index + 1,
        username: item.user,
        totalAmount: item.total,
        packetCount: item.count
      })));
      
      // 设置最近记录（最近5条）
      setRecentRecords(records.slice(0, 5).map(record => ({
        id: record.id,
        amount: record.amount,
        source: record.source,
        note: record.note,
        time: new Date(record.createdAt).toLocaleString('zh-CN')
      })));

      // 获取面额分布数据
      const distribution = await db.getAmountDistribution(currentYear);
      setAmountDistribution(distribution);
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 年份变化处理
  const handleYearChange = async (year) => {
    setCurrentYear(year);
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
    loadData();
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
            <Button 
              variant="text"
              icon={<LogoutIcon />}
              onClick={onLogout}
            >
              退出
            </Button>
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
        <Col span={6}>
          <Card 
            title="总金额统计" 
            bordered
            actions={[
              <Button key="view" variant="text" onClick={() => message.info('查看详细统计')}>
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
        <Col span={6}>
          <Card 
            title="红包数量" 
            bordered
            actions={[
              <Button key="view" variant="text" onClick={() => message.info('查看红包分布')}>
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
        <Col span={12}>
          <Card 
            title={
              <Space>
                <ChartBarIcon />
                面额统计
              </Space>
            } 
            bordered
            actions={[
              <Button key="refresh" variant="text" onClick={() => loadData()}>
                刷新数据
              </Button>
            ]}
          >
            {amountDistribution.length > 0 ? (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {amountDistribution.map((item, index) => (
                  <div key={index} style={{ 
                    marginBottom: '12px', 
                    padding: '8px', 
                    background: '#f8f9fa', 
                    borderRadius: '6px' 
                  }}>
                    <Row gutter={8} align="middle">
                      <Col span={6}>
                        <Typography.Text strong>¥{item.amount}</Typography.Text>
                      </Col>
                      <Col span={6}>
                        <Typography.Text>{item.count}个</Typography.Text>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Progress 
                            percentage={item.percentage} 
                            size="small" 
                            style={{ flex: 1 }}
                            theme="primary"
                          />
                          <Typography.Text type="secondary">{item.percentage}%</Typography.Text>
                        </div>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                暂无红包记录
              </div>
            )}
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
            actions={[
              <Button key="refresh" variant="text" onClick={() => message.info('数据已刷新')}>
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
                onClick={() => message.info('功能开发中...')}
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
              <Button variant="outline" onClick={() => message.info('数据导出功能开发中')}>
                导出数据
              </Button>
              <Button variant="outline" onClick={() => message.info('打印功能开发中')}>
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

export default SimpleDashboard;