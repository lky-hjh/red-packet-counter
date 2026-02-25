import React, { useState, useEffect } from 'react';

const App = () => {
  const [records, setRecords] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 预定义的金额按钮
  const amountButtons = [1, 5, 10, 20, 50, 100];

  // 获取所有记录
  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/records');
      const data = await response.json();
      if (data.message === 'success') {
        setRecords(data.data || []);
      }
    } catch (error) {
      console.error('获取记录失败:', error);
    }
  };

  // 获取总金额
  const fetchTotalAmount = async () => {
    try {
      const response = await fetch('/api/total');
      const data = await response.json();
      if (data.message === 'success') {
        setTotalAmount(data.data.total || 0);
      }
    } catch (error) {
      console.error('获取总金额失败:', error);
    }
  };

  // 添加记录
  const addRecord = async (amount) => {
    setLoading(true);
    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });
      
      const data = await response.json();
      if (response.ok) {
        // 添加成功后刷新数据
        await Promise.all([fetchRecords(), fetchTotalAmount()]);
      } else {
        console.error('添加记录失败:', data.error);
      }
    } catch (error) {
      console.error('网络错误:', error);
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
      const response = await fetch('/api/records', {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (response.ok) {
        setRecords([]);
        setTotalAmount(0);
        alert('所有记录已清空！');
      } else {
        console.error('清空记录失败:', data.error);
      }
    } catch (error) {
      console.error('网络错误:', error);
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

  // 组件挂载时获取数据
  useEffect(() => {
    fetchRecords();
    fetchTotalAmount();
  }, []);

  return (
    <div className="app">
      {/* 头部 */}
      <div className="header">
        <h1>🧧 过年红包计数器</h1>
        <p>记录和管理您的红包收入</p>
      </div>

      {/* 总金额显示 */}
      <div className="amount-display">
        <div className="total-amount">¥{formatAmount(totalAmount)}</div>
        <div className="total-label">累计红包金额</div>
      </div>

      {/* 金额按钮 */}
      <div className="amount-buttons">
        {amountButtons.map((amount) => (
          <button
            key={amount}
            className={`amount-button ${amount >= 50 ? 'large' : ''}`}
            onClick={() => addRecord(amount)}
            disabled={loading}
          >
            +¥{amount}
          </button>
        ))}
      </div>

      {/* 控制按钮 */}
      <div className="control-buttons">
        <button 
          className="control-button clear-button"
          onClick={clearAllRecords}
          disabled={loading}
        >
          清空所有记录
        </button>
        <button 
          className="control-button refresh-button"
          onClick={() => Promise.all([fetchRecords(), fetchTotalAmount()])}
          disabled={loading}
        >
          刷新数据
        </button>
      </div>

      {/* 记录列表 */}
      <div className="records-section">
        <h3>📝 红包记录</h3>
        <div className="records-list">
          {records.length === 0 ? (
            <div className="no-records">暂无红包记录，点击上方按钮开始记录</div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="record-item">
                <span className="record-amount">¥{formatAmount(record.amount)}</span>
                <span className="record-time">{formatTime(record.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '10px',
            color: '#333'
          }}>
            处理中...
          </div>
        </div>
      )}
    </div>
  );
};

export default App;