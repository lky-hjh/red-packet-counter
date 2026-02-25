import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Space, 
  Statistic, 
  Table, 
  Typography, 
  Row, 
  Col,
  Tag,
  message,
  Divider
} from 'tdesign-react';
import { 
  ArrowLeftIcon, 
  MoneyIcon, 
  DeleteIcon, 
  RefreshIcon,
  GiftIcon,
  RemoveIcon
} from 'tdesign-icons-react';
import { db } from '../utils/IndexedDB';

const CounterPage = ({ onBackToDashboard, user }) => {
  const [records, setRecords] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 预定义的金额按钮
  const amountButtons = [1, 5, 10, 20, 50, 100];

  // 获取计数器记录
  const fetchCounterRecords = async () => {
    try {
      const records = await db.getAllRedPackets();
      setRecords(records);
    } catch (error) {
      console.error('获取记录失败:', error);
      message.error('获取记录失败');
    }
  };

  // 获取总金额
  const fetchTotalAmount = async () => {
    try {
      const total = await db.getTotalAmount();
      setTotalAmount(total);
    } catch (error) {
      console.error('获取总金额失败:', error);
      message.error('获取总金额失败');
    }
  };

  // 添加红包记录
  const addRecord = async (amount, source = '', note = '') => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await db.addRedPacket({
        amount,
        source: source || '快速记录',
        note: note || '',
        user: user.username || '默认用户'
      });
      
      message.success(`成功记录¥${amount}红包！`);
      await Promise.all([fetchCounterRecords(), fetchTotalAmount()]);
    } catch (error) {
      console.error('添加记录失败:', error);
      message.error('添加记录失败');
    } finally {
      setLoading(false);
    }
  };

  // 清空所有记录
  const clearAllRecords = async () => {
    if (!window.confirm('确定要清空所有红包记录吗？此操作不可撤销！')) {
      return;
    }

    try {
      await db.clearAllRecords();
      setRecords([]);
      setTotalAmount(0);
      message.success('所有记录已清空！');
    } catch (error) {
      console.error('清空记录失败:', error);
      message.error('清空记录失败');
    }
  };

  // 删除单条记录
  const deleteRecord = async (id) => {
    if (!window.confirm('确定要删除这条红包记录吗？此操作不可撤销！')) {
      return;
    }

    setLoading(true);
    try {
      await db.deleteRedPacket(id);
      message.success('记录删除成功！');
      await Promise.all([fetchCounterRecords(), fetchTotalAmount()]);
    } catch (error) {
      console.error('删除记录失败:', error);
      message.error('删除记录失败');
    } finally {
      setLoading(false);
    }
  };

  // 格式化金额显示
  const formatAmount = (amount) => {
    return amount.toLocaleString('zh-CN');
  };

  // 格式化时间显示
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 表格列配置
  const recordColumns = [
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
      cell: ({ row }) => row.source || '未指定'
    },
    {
      title: '备注',
      colKey: 'note',
      cell: ({ row }) => row.note || '-' 
    },
    {
      title: '时间',
      colKey: 'created_at',
      width: 140,
      cell: ({ row }) => formatTime(row.created_at)
    },
    {
      title: '操作',
      colKey: 'actions',
      width: 80,
      cell: ({ row }) => (
        <Button 
          size="small" 
          variant="text" 
          theme="danger"
          icon={<RemoveIcon />}
          onClick={() => deleteRecord(row.id)}
          loading={loading}
          title="删除记录"
        >
          删除
        </Button>
      )
    }
  ];

  useEffect(() => {
    fetchCounterRecords();
    fetchTotalAmount();
  }, []);

  return (
    <div style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
      {/* 头部导航 */}
      <Row gutter={16} align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Button 
            icon={<ArrowLeftIcon />} 
            variant="text"
            onClick={onBackToDashboard}
          >
            返回主面板
          </Button>
        </Col>
        <Col flex="auto">
          <Typography.Title level="h1" style={{ margin: 0 }}>
            <Space>
              <GiftIcon style={{ color: '#e74c3c' }} />
              红包计数器
            </Space>
          </Typography.Title>
        </Col>
        <Col>
          <Typography.Text type="secondary">
            欢迎，{user?.username || '用户'}
          </Typography.Text>
        </Col>
      </Row>

      {/* 总金额统计 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={24}>
          <Col span={12}>
            <Statistic
              title="累计红包总额"
              value={totalAmount}
              prefix="¥"
              unit="元"
              extra={(
                <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                  已记录 {records.length} 个红包
                </div>
              )}
            />
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', gap: '12px', height: '100%', alignItems: 'center' }}>
              <Button 
                icon={<RefreshIcon />} 
                variant="outline"
                onClick={() => Promise.all([fetchCounterRecords(), fetchTotalAmount()])}
                loading={loading}
              >
                刷新数据
              </Button>
              <Button 
                icon={<DeleteIcon />} 
                theme="danger"
                variant="outline"
                onClick={clearAllRecords}
                loading={loading}
              >
                清空记录
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 金额按钮区域 */}
      <Card title="快速记录" style={{ marginBottom: '24px' }}>
        <Typography.Paragraph style={{ marginBottom: '16px', color: '#666' }}>
          点击下方金额按钮快速记录红包收入
        </Typography.Paragraph>
        
        <Row gutter={[12, 12]}>
          {amountButtons.map((amount) => (
            <Col key={amount} span={4}>
              <Button 
                block
                size="large"
                theme="primary"
                icon={<MoneyIcon />}
                onClick={() => addRecord(amount)}
                loading={loading}
                style={{
                  height: '60px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                +¥{amount}
              </Button>
            </Col>
          ))}
        </Row>
        
        <Divider />
        
        <div style={{ textAlign: 'center' }}>
          <Typography.Text type="secondary">
            提示：点击金额按钮后，您可以在下方表格中查看详细记录
          </Typography.Text>
        </div>
      </Card>

      {/* 记录列表 */}
      <Card 
        title={
          <Space>
            <MoneyIcon />
            红包记录列表
          </Space>
        }
        actions={[
          <Button key="export" variant="text" onClick={() => message.info('导出功能开发中')}>
            导出数据
          </Button>
        ]}
      >
        <Table
          data={records}
          columns={recordColumns}
          rowKey="id"
          pagination={{
            defaultPageSize: 10,
            total: records.length,
            showJumper: true
          }}
          empty="暂无红包记录，点击上方按钮开始记录"
          loading={loading}
        />
      </Card>

      {/* 底部提示 */}
      <Card style={{ marginTop: '24px', background: '#fff9e6' }}>
        <Row gutter={16} align="middle">
          <Col span={20}>
            <Typography.Text type="secondary">
              💡 提示：所有数据都会自动保存到您的账户中，可以随时查看历史记录
            </Typography.Text>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            <Button variant="outline" onClick={onBackToDashboard}>
              返回主面板
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CounterPage;