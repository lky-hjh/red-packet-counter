# 多功能红包管理系统 🧧

一个基于TDesign组件库的多功能红包管理主页面系统，支持用户认证、红包计数、年份筛选、收入排行榜等功能。

## ✨ 核心功能

### ✅ 用户认证模块
- **用户注册与登录**：安全的用户认证系统
- **JWT令牌认证**：保护用户数据安全
- **密码加密存储**：使用bcryptjs加密

### ✅ 红包计数器功能
- **快捷金额按钮**：1元、5元、10元、20元、50元、100元、200元、500元
- **自定义金额输入**：支持任意金额输入
- **记录来源和备注**：详细记录红包来源和说明
- **实时统计**：实时显示总金额和红包数量

### ✅ 年份筛选功能
- **多年度查看**：支持查看不同年份的红包记录
- **自动年份分类**：系统自动按年份分类记录
- **数据对比**：便于进行年度收入对比

### ✅ 主页面汇总展示
- **个人统计面板**：显示总收入、红包数量、平均金额
- **记录列表**：按时间顺序展示红包记录
- **实时数据更新**：数据实时同步更新

### ✅ 收入排行榜
- **用户排名**：显示收入最高的用户排名
- **隐私保护**：仅显示公开设置的用户数据
- **激励功能**：鼓励用户参与红包记录

### ✅ 响应式设计
- **移动端适配**：完美适配各种屏幕尺寸
- **现代化UI**：基于TDesign组件库的优美界面
- **用户体验优化**：流畅的交互体验

## 🚀 技术栈

### 前端技术
- **React 18**：现代化前端框架
- **TDesign React**：腾讯企业级UI组件库
- **React Router**：单页面应用路由
- **Tailwind CSS**：实用优先的CSS框架
- **Vite**：快速构建工具

### 后端技术
- **Node.js + Express**：高性能后端服务
- **SQLite**：轻量级数据库
- **JWT**：JSON Web Token认证
- **bcryptjs**：密码加密库
- **CORS**：跨域资源共享

## 📁 项目结构

```
红包管理系统/
├── src/                         # 前端源代码
│   ├── components/              # React组件
│   │   ├── LoginPage.jsx       # 登录页面
│   │   ├── Dashboard.jsx        # 主控制面板
│   │   └── CounterPage.jsx     # 红包计数器页面
│   ├── contexts/                # React上下文
│   │   └── AuthContext.jsx     # 认证上下文
│   ├── App.jsx                 # 主应用组件
│   ├── main.jsx                # 应用入口
│   └── index.css               # 样式文件
├── server/                     # 后端服务器
│   └── server.js               # Express服务器
├── public/                     # 静态资源
├── index.html                  # HTML模板
├── vite.config.js              # Vite配置
├── tailwind.config.js          # Tailwind配置
├── postcss.config.js           # PostCSS配置
└── package.json                # 项目配置
```

## 🛠️ 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动应用

```bash
# 同时启动前端和后端服务
npm run dev
```

或者分别启动：

```bash
# 终端1：启动后端服务器 (端口3001)
npm run start-server

# 终端2：启动前端开发服务器 (端口3000)
npm run start-client
```

### 3. 访问应用

打开浏览器访问：http://localhost:3000

## 🔐 API接口文档

### 认证接口

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "用户名",
  "email": "邮箱地址",
  "password": "密码"
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "邮箱地址",
  "password": "密码"
}
```

### 红包记录接口

#### 获取红包记录
```
GET /api/records?year=2024
Authorization: Bearer <token>
```

#### 添加红包记录
```
POST /api/counter/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100,
  "source": "红包来源",
  "note": "备注信息"
}
```

#### 删除红包记录
```
DELETE /api/counter/records/:id
Authorization: Bearer <token>
```

### 统计接口

#### 获取总收入
```
GET /api/total?year=2024
Authorization: Bearer <token>
```

#### 获取排行榜
```
GET /api/leaderboard
```

## 🗄️ 数据库设计

### 用户表 (users)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  privacy_setting INTEGER DEFAULT 1
);
```

### 红包记录表 (red_packets)
```sql
CREATE TABLE red_packets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  source TEXT DEFAULT '',
  note TEXT DEFAULT '',
  year INTEGER DEFAULT (strftime('%Y', 'now')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

## 🎨 界面特色

### TDesign组件库应用
- **统一设计语言**：符合腾讯设计规范
- **丰富组件**：按钮、表单、卡片、统计等
- **图标系统**：内置丰富的图标资源
- **主题定制**：支持自定义主题配色

### 响应式设计
- **桌面端**：三列网格布局，信息展示完整
- **平板端**：自适应布局，优化操作体验
- **手机端**：单列布局，触控友好设计

### 用户体验
- **加载状态**：友好的加载提示
- **错误处理**：完善的错误提示机制
- **确认操作**：重要操作二次确认
- **数据验证**：前端后端双重验证

## 🔒 安全特性

### 数据安全
- **密码加密**：使用bcryptjs加密存储
- **JWT认证**：安全的令牌认证机制
- **SQL注入防护**：参数化查询防止注入
- **CORS配置**：安全的跨域资源共享

### 隐私保护
- **私有数据**：用户数据默认私有
- **公开设置**：用户可自主设置公开性
- **排行榜隐私**：仅显示公开用户数据
- **数据隔离**：用户数据严格隔离

## 📱 使用流程

1. **用户注册/登录**：创建账户或使用现有账户登录
2. **主面板概览**：查看个人统计数据和排行榜
3. **年份筛选**：选择不同年份查看历史记录
4. **红包记录**：使用快捷按钮或自定义金额添加记录
5. **数据管理**：查看、编辑、删除红包记录
6. **隐私设置**：根据需要调整数据可见性

## 🚀 部署说明

### 开发环境
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 生产预览
```bash
npm run preview
```

## 📋 注意事项

1. **Node.js版本**：要求Node.js 14.0或更高版本
2. **首次运行**：系统会自动创建数据库和表结构
3. **数据备份**：定期备份数据库文件以防数据丢失
4. **安全密钥**：生产环境请修改JWT密钥
5. **隐私设置**：用户可根据需要调整数据可见性

## 📄 许可证

MIT License

---

**开发团队**：AI助手  
**技术栈**：React + TDesign + Node.js + SQLite  
**版本**：v1.0.0  
**更新日期**：2026年2月