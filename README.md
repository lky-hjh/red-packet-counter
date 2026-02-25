# 过年红包计数器 🧧

一个本地运行的过年红包计数器网站，用于记录和管理红包收入。

## 功能特性

- ✅ **六个金额按钮**：1元、5元、10元、20元、50元、100元
- ✅ **实时汇总**：显示所有红包记录的总金额
- ✅ **精美UI**：现代化的响应式设计，适配各种设备
- ✅ **数据持久化**：使用SQLite数据库存储所有记录
- ✅ **记录管理**：查看历史记录，支持清空所有数据

## 技术栈

### 前端
- React 18
- Vite (构建工具)
- 响应式CSS设计

### 后端
- Node.js + Express
- SQLite数据库
- CORS支持

## 快速开始

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
npm run server

# 终端2：启动前端开发服务器 (端口3000)
npm run client
```

### 3. 访问应用

打开浏览器访问：http://localhost:3000

## 项目结构

```
过年红包计数器/
├── src/                 # 前端源代码
│   ├── App.jsx         # 主应用组件
│   ├── main.jsx        # 应用入口
│   └── index.css       # 样式文件
├── server/             # 后端服务器
│   └── server.js      # Express服务器
├── public/             # 静态资源
├── index.html          # HTML模板
├── vite.config.js      # Vite配置
└── package.json        # 项目配置
```

## API接口

### 获取所有记录
```
GET /api/records
```

### 添加红包记录
```
POST /api/records
Content-Type: application/json

{
  "amount": 100
}
```

### 获取总金额
```
GET /api/total
```

### 清空所有记录
```
DELETE /api/records
```

## 数据库

项目使用SQLite数据库，数据库文件位于 `server/red_packets.db`

表结构：
```sql
CREATE TABLE red_packets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 响应式设计

- **桌面端**：三列网格布局
- **平板端**：两列网格布局
- **手机端**：单列布局，优化触摸体验

## 开发说明

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 注意事项

1. 确保系统已安装Node.js (版本14+)
2. 首次运行会自动创建数据库文件
3. 清空记录操作不可撤销，请谨慎使用
4. 所有数据保存在本地，不会上传到任何服务器

## 许可证

MIT License