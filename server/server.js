import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 数据库初始化
const dbPath = path.join(__dirname, 'red_packets.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接错误:', err.message);
  } else {
    console.log('成功连接到SQLite数据库');
  }
});

// 创建红包记录表
db.run(`CREATE TABLE IF NOT EXISTS red_packets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// API路由

// 获取所有红包记录
app.get('/api/records', (req, res) => {
  const sql = 'SELECT * FROM red_packets ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

// 添加红包记录
app.post('/api/records', (req, res) => {
  const { amount } = req.body;
  
  if (!amount || typeof amount !== 'number') {
    res.status(400).json({ error: '金额参数无效' });
    return;
  }

  const sql = 'INSERT INTO red_packets (amount) VALUES (?)';
  db.run(sql, [amount], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: '记录添加成功',
      data: {
        id: this.lastID,
        amount: amount,
        created_at: new Date().toISOString()
      }
    });
  });
});

// 获取总金额
app.get('/api/total', (req, res) => {
  const sql = 'SELECT SUM(amount) as total_amount FROM red_packets';
  db.get(sql, [], (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: {
        total: row.total_amount || 0
      }
    });
  });
});

// 删除所有记录
app.delete('/api/records', (req, res) => {
  const sql = 'DELETE FROM red_packets';
  db.run(sql, [], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: '所有记录已清空',
      data: {
        deleted: this.changes
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});