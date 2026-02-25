import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const JWT_SECRET = 'red-packet-manager-secret-key';

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

// 创建用户表
const createTables = () => {
  // 用户表
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    privacy_setting INTEGER DEFAULT 1 -- 1: 私有, 2: 公开
  )`);

  // 红包记录表（支持多用户）
  db.run(`CREATE TABLE IF NOT EXISTS red_packets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    source TEXT DEFAULT '',
    note TEXT DEFAULT '',
    year INTEGER DEFAULT (strftime('%Y', 'now')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // 创建索引
  db.run('CREATE INDEX IF NOT EXISTS idx_user_id ON red_packets(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_year ON red_packets(year)');
  db.run('CREATE INDEX IF NOT EXISTS idx_created_at ON red_packets(created_at)');
};

createTables();

// 认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '令牌无效' });
    }
    req.user = user;
    next();
  });
};

// 认证路由

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: '请填写完整信息' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度至少6位' });
  }

  try {
    // 检查用户是否已存在
    db.get('SELECT id FROM users WHERE email = ? OR username = ?', [email, username], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: '数据库错误' });
      }
      
      if (row) {
        return res.status(400).json({ error: '用户名或邮箱已存在' });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
        [username, email, hashedPassword], function(err) {
          if (err) {
            return res.status(500).json({ error: '创建用户失败' });
          }
          
          res.json({
            message: '注册成功',
            data: { userId: this.lastID }
          });
        });
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 用户登录
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '请填写邮箱和密码' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }

    if (!user) {
      return res.status(400).json({ error: '用户不存在' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: '密码错误' });
      }

      // 生成JWT令牌
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        }
      });
    } catch (error) {
      res.status(500).json({ error: '服务器错误' });
    }
  });
});

// 红包记录相关路由

// 获取用户红包记录（支持年份筛选）
app.get('/api/records', authenticateToken, (req, res) => {
  const { year } = req.query;
  const userId = req.user.id;

  let sql = 'SELECT * FROM red_packets WHERE user_id = ?';
  let params = [userId];

  if (year) {
    sql += ' AND year = ?';
    params.push(year);
  }

  sql += ' ORDER BY created_at DESC';

  db.all(sql, params, (err, rows) => {
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

// 获取计数器红包记录
app.get('/api/counter/records', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = 'SELECT * FROM red_packets WHERE user_id = ? ORDER BY created_at DESC';
  
  db.all(sql, [userId], (err, rows) => {
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
app.post('/api/counter/records', authenticateToken, (req, res) => {
  const { amount, source, note } = req.body;
  const userId = req.user.id;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: '金额参数无效' });
  }

  const currentYear = new Date().getFullYear();
  const sql = 'INSERT INTO red_packets (user_id, amount, source, note, year) VALUES (?, ?, ?, ?, ?)';
  
  db.run(sql, [userId, amount, source || '', note || '', currentYear], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: '记录添加成功',
      data: {
        id: this.lastID,
        user_id: userId,
        amount: amount,
        source: source || '',
        note: note || '',
        year: currentYear,
        created_at: new Date().toISOString()
      }
    });
  });
});

// 删除单个记录
app.delete('/api/counter/records/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const sql = 'DELETE FROM red_packets WHERE id = ? AND user_id = ?';
  
  db.run(sql, [id, userId], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: '记录不存在或无权限' });
    }
    res.json({
      message: '记录删除成功',
      data: { deleted: this.changes }
    });
  });
});

// 清空用户所有记录
app.delete('/api/counter/records', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const sql = 'DELETE FROM red_packets WHERE user_id = ?';
  
  db.run(sql, [userId], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: '所有记录已清空',
      data: { deleted: this.changes }
    });
  });
});

// 获取总金额
app.get('/api/total', authenticateToken, (req, res) => {
  const { year } = req.query;
  const userId = req.user.id;

  let sql = 'SELECT SUM(amount) as total_amount FROM red_packets WHERE user_id = ?';
  let params = [userId];

  if (year) {
    sql += ' AND year = ?';
    params.push(year);
  }

  db.get(sql, params, (err, row) => {
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

// 收入排行榜
app.get('/api/leaderboard', (req, res) => {
  const currentYear = new Date().getFullYear();
  
  const sql = `
    SELECT 
      u.id, 
      u.username,
      SUM(r.amount) as total_amount,
      COUNT(r.id) as packet_count
    FROM users u
    JOIN red_packets r ON u.id = r.user_id
    WHERE u.privacy_setting = 2  -- 只显示公开用户的记录
      AND r.year = ?
    GROUP BY u.id, u.username
    ORDER BY total_amount DESC
    LIMIT 10
  `;
  
  db.all(sql, [currentYear], (err, rows) => {
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

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});