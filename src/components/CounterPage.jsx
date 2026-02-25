import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Statistic, List, Space, Message, BackTop } from 'tdesign-react';
import { 
  GiftIcon, 
  MoneyIcon, 
  ArrowLeftIcon,
  PlusIcon,
  DeleteIcon,
  SaveIcon 
} from 'tdesign-icons-react';
import { useAuth } from '../contexts/AuthContext';

const CounterPage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newRecord, setNewRecord] = useState({
    amount: '',
    source: '',
    note: ''
  });

  // 预定义金额按钮
  const amountButtons = [1, 5, 10, 20, 50, 100, 200, 500];

  // 获取当前计数器数据
  const fetchCounterData = async () => {
    try {
      const response = await fetch(`/api/counter/records?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.data || []);
        
        // 计算总金额
        const total = data.data.reduce((sum, record) => sum + record.amount, 0);
        setTotalAmount(total);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };

  // 添加红包记录
  const addRecord = async (amount, source = '手动添加', note = '') => {
    if (!amount || amount <= 0) {
      Message.warning('请输入有效的金额');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/counter/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: parseInt(amount),
          source,
          note
        }),
      });

      if (response.ok) {
        Message.success('红包记录添加成功！');
        setNewRecord({ amount: '', source: '', note: '' });
        await fetchCounterData(); // 刷新数据
      } else {
        const data = await response.json();
        Message.error(data.error || '添加失败');
      }
    } catch (error) {
      console.error('添加记录失败:', error);
      Message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除记录
  const deleteRecord = async (recordId) => {
    if (!window.confirm('确定要删除这条记录吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/counter/records/${recordId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Message.success('记录删除成功');
        await fetchCounterData(); // 刷新数据
      } else {
        Message.error('删除失败');
      }
    } catch (error) {
      console.error('删除记录失败:', error);
      Message.error('网络错误');
    }
  };

  // 清空所有记录
  const clearAllRecords = async () => {
    if (!window.confirm('确定要清空所有记录吗？此操作不可撤销！')) {
      return;
    }

    try {
      const response = await fetch(`/api/counter/records?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Message.success('所有记录已清空');
        setRecords([]);
        setTotalAmount(0);
      } else {
        Message.error('清空失败');
      }
    } catch (error) {
      console.error('清空记录失败:', error);
      Message.error('网络错误');
    }
  };

  // 处理快捷按钮点击
  const handleQuickButton = (amount) => {
    addRecord(amount, '快捷添加', `快捷记录 ${amount}元`);
  };

  // 处理自定义金额提交
  const handleCustomAmount = (e) => {
    e.preventDefault();
    addRecord(newRecord.amount, newRecord.source || '自定义金额', newRecord.note);
  };

  useEffect(() => {
    if (user) {
      fetchCounterData();
    }
  }, [user]);

  // 格式化金额
  const formatAmount = (amount) => {
    return amount.toLocaleString('zh-CN');
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-4">
      {/* 顶部导航 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              icon={<ArrowLeftIcon />}
              onClick={() => window.history.back()}
            >
              返回
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <GiftIcon className="text-red-500 text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">红包计数器</h1>
                <p className="text-gray-600">实时记录您的红包收入</p>
              </div>
            </div>
          </div>
          
          <Button 
            theme="danger" 
            variant="outline" 
            icon={<DeleteIcon />}
            onClick={clearAllRecords}
            disabled={records.length === 0}
          >
            清空记录
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：金额统计和快捷按钮 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 总金额统计 */}
          <Card className="gold-gradient border-0 text-center">
            <Statistic
              title="当前计数器总金额"
              value={totalAmount}
              prefix="¥"
              valueStyle={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold',
                color: '#c53030'
              }}
            />
            <div className="mt-2 text-sm text-gray-600">
              共 {records.length} 个红包
            </div>
          </Card>

          {/* 快捷金额按钮 */}
          <Card title="快捷金额" className="h-96">
            <div className="grid grid-cols-2 gap-3">
              {amountButtons.map((amount) => (
                <Button
                  key={amount}
                  theme="primary"
                  size="large"
                  className="h-16 text-lg font-bold"
                  onClick={() => handleQuickButton(amount)}
                  disabled={loading}
                >
                  +¥{amount}
                </Button>
              ))}
            </div>
          </Card>

          {/* 自定义金额表单 */}
          <Card title="自定义金额">
            <form onSubmit={handleCustomAmount} className="space-y-3">
              <Input
                type="number"
                placeholder="输入金额"
                value={newRecord.amount}
                onChange={(value) => setNewRecord({...newRecord, amount: value})}
                prefix="¥"
                required
              />
              <Input
                placeholder="来源（如：爷爷、阿姨）"
                value={newRecord.source}
                onChange={(value) => setNewRecord({...newRecord, source: value})}
              />
              <Input
                placeholder="备注（可选）"
                value={newRecord.note}
                onChange={(value) => setNewRecord({...newRecord, note: value})}
              />
              <Button 
                type="submit" 
                theme="primary" 
                block
                loading={loading}
                icon={<PlusIcon />}
              >
                添加记录
              </Button>
            </form>
          </Card>
        </div>

        {/* 右侧：记录列表 */}
        <div className="lg:col-span-2">
          <Card 
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MoneyIcon />
                  <span>红包记录列表</span>
                </div>
                <span className="text-sm text-gray-500">
                  共 {records.length} 条记录
                </span>
              </div>
            }
            className="h-full"
          >
            {records.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <GiftIcon className="text-6xl mb-4" />
                <p className="text-xl font-medium">暂无红包记录</p>
                <p className="text-sm mt-2">点击上方按钮开始记录您的红包</p>
              </div>
            ) : (
              <div className="h-96 overflow-y-auto custom-scrollbar">
                <List
                  split
                  data={records}
                  render={({ item, index }) => (
                    <List.Item>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-red-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {item.source || '红包收入'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatTime(item.created_at)}
                            </div>
                            {item.note && (
                              <div className="text-xs text-gray-400 mt-1">
                                {item.note}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-xl font-bold text-red-500">
                              ¥{formatAmount(item.amount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              累计: ¥{formatAmount(
                                records.slice(0, index + 1).reduce((sum, r) => sum + r.amount, 0)
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            theme="danger"
                            size="small"
                            icon={<DeleteIcon />}
                            onClick={() => deleteRecord(item.id)}
                          />
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      <BackTop />
    </div>
  );
};

export default CounterPage;