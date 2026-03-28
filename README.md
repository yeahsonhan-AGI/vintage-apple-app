# Q-Draw OS - Full Stack Architecture

React + Vite (前端) + Node.js Express (后端) + Supabase (数据库)

## 📁 项目结构

```
VintageAppleApp/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/      # 页面组件
│   │   ├── components/ # UI组件
│   │   ├── lib/        # API客户端
│   │   └── types/      # TypeScript类型
│   ├── public/
│   │   └── photos/     # 图片资源
│   └── package.json
│
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/     # API路由
│   │   ├── middleware/ # 中间件
│   │   └── config/     # 配置
│   └── package.json
│
└── supabase/          # 数据库Schema
    └── schema.sql
```

## 🚀 快速开始

### 1. 设置 Supabase

1. 访问 https://supabase.com
2. 创建新项目
3. 在 SQL Editor 中执行 `supabase/schema.sql`
4. 获取 API credentials:
   - Project URL
   - anon/public key
   - service_role key

### 2. 配置后端

```bash
cd backend

# 复制环境变量
cp .env.example .env

# 编辑 .env，填入你的Supabase凭证
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# JWT_SECRET=generate_with_openssl_rand_base64_32

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

### 3. 配置前端

```bash
cd frontend

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 📦 部署

### 前端部署到 Vercel

```bash
cd frontend

# 安装Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 后端部署到 Render/Railway

**Render:**
1. 连接GitHub仓库
2. 选择 `backend` 目录
3. 配置环境变量
4. 部署

**Railway:**
1. 新建项目
2. 连接GitHub
3. 选择 `backend` 目录
4. 添加环境变量
5. 部署

### 更新前端API地址

部署后，更新前端 `.env`:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

重新构建并部署前端。

## 🔐 API 端点

### 认证
- `POST /api/auth/signup` - 注册
- `POST /api/auth/signin` - 登录
- `GET  /api/auth/me` - 获取当前用户
- `POST /api/auth/signout` - 登出

### Notes (需要认证)
- `GET    /api/notes` - 获取所有笔记
- `POST   /api/notes` - 创建笔记
- `PUT    /api/notes/:id` - 更新笔记
- `DELETE /api/notes/:id` - 删除笔记

### Calendar (需要认证)
- `GET    /api/calendar/todos` - 获取待办事项
- `POST   /api/calendar/todos` - 创建待办
- `PUT    /api/calendar/todos/:id` - 更新待办
- `DELETE /api/calendar/todos/:id` - 删除待办

### Food (需要认证)
- `GET    /api/food/logs` - 获取食物记录
- `POST   /api/food/logs` - 添加食物记录
- `DELETE /api/food/logs/:id` - 删除食物记录
- `GET    /api/food/summary/:dateKey` - 获取每日汇总

## 🛠️ 技术栈

**前端:**
- React 18
- TypeScript
- Vite
- TailwindCSS

**后端:**
- Node.js
- Express
- TypeScript
- JWT认证

**数据库:**
- Supabase (PostgreSQL)
- Row Level Security (RLS)

## 📝 开发说明

### 添加新的API端点

1. 在 `backend/src/routes/` 创建路由文件
2. 在 `backend/src/index.ts` 中注册路由
3. 在 `frontend/src/lib/api.ts` 添加客户端方法
