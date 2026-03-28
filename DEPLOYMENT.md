# 🚀 Q-Draw OS 部署指南

## 📋 前置要求

1. GitHub账号（用于部署）
2. Supabase账号（免费）
3. Vercel账号（免费，用于前端）
4. Render/Railway账号（免费，用于后端）

## 步骤 1: 设置 Supabase 数据库

### 1.1 创建项目

1. 访问 https://supabase.com
2. 点击 "New Project"
3. 输入项目名称: `qdraw-os`
4. 选择区域: 选择离你最近的区域
5. 等待项目创建完成

### 1.2 执行数据库Schema

1. 进入项目 → SQL Editor
2. 复制 `supabase/schema.sql` 的内容
3. 粘贴到SQL Editor
4. 点击 "Run" 执行

### 1.3 获取API凭证

1. 进入项目 → Settings → API
2. 复制以下信息:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public**: `eyJ...` (anon key)
   - **service_role**: `eyJ...` (service role key)

## 步骤 2: 部署后端到 Render

### 2.1 准备代码

```bash
# 确保代码已提交到GitHub
git add .
git commit -m "Add backend code"
git push
```

### 2.2 部署到 Render

1. 访问 https://render.com
2. 点击 "New +" → "Web Service"
3. 连接GitHub仓库
4. 选择 `VintageAppleApp` 仓库
5. 配置服务:
   - **Name**: `qdraw-os-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
6. 配置环境变量:
   ```
   NODE_ENV=production
   PORT=3000
   SUPABASE_URL=你的Supabase URL
   SUPABASE_ANON_KEY=你的anon key
   SUPABASE_SERVICE_ROLE_KEY=你的service_role key
   JWT_SECRET=生成的密钥
   ```
7. 点击 "Create Web Service"
8. 等待部署完成（约3-5分钟）

### 2.3 获取后端URL

部署完成后，Render会提供一个URL，例如:
```
https://qdraw-os-backend.onrender.com
```

**复制这个URL，后面会用到！**

## 步骤 3: 部署前端到 Vercel

### 3.1 安装Vercel CLI

```bash
npm install -g vercel
```

### 3.2 部署前端

1. 进入前端目录:
```bash
cd frontend
```

2. 创建 `.env.production`:
```bash
# 使用你的Render后端URL
VITE_API_URL=https://qdraw-os-backend.onrender.com/api
```

3. 部署:
```bash
vercel
```

4. 按照提示:
   - 登录Vercel账号
   - 设置项目名称: `qdraw-os-frontend`
   - 选择框架: Vite
   - 确认部署

### 3.3 更新环境变量

如果需要更新API地址:

```bash
vercel env add VITE_API_URL https://your-backend-url/api
vercel env rm VITE_API_URL preview
```

重新部署:
```bash
vercel --prod
```

## 步骤 4: 验证部署

### 4.1 测试后端

```bash
# 测试健康检查
curl https://qdraw-os-backend.onrender.com/api/health

# 应该返回:
# {"status":"ok","message":"Q-Draw OS API is running"}
```

### 4.2 测试前端

1. 访问你的Vercel URL: `https://qdraw-os-frontend.vercel.app`
2. 尝试注册/登录
3. 创建笔记、待办事项、食物记录
4. 验证数据正确保存

## 🔧 本地开发

### 后端开发

```bash
cd backend
npm run dev
# 后端运行在 http://localhost:3000
```

### 前端开发

```bash
cd frontend
npm run dev
# 前端运行在 http://localhost:5173
```

### 一键启动

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

## 📊 监控

### Render后端监控

- 访问 Render Dashboard
- 查看日志、性能、错误率
- 设置自动部署

### Vercel前端监控

- 访问 Vercel Dashboard
- 查看部署历史
- 分析性能
- 查看错误日志

## 🔄 更新部署

### 后端更新

```bash
# 修改代码后
git add .
git commit -m "Update backend"
git push

# Render会自动部署
```

### 前端更新

```bash
# 修改代码后
git add .
git commit -m "Update frontend"
git push

# Vercel会自动部署
```

## 🐛 常见问题

### Q: CORS错误
A: 在后端 `src/index.ts` 确保已配置 CORS:
```typescript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:5173'],
  credentials: true
}))
```

### Q: 认证失败
A: 检查:
1. JWT_SECRET 是否设置
2. token 是否正确传递
3. 查看后端日志

### Q: 数据库连接失败
A: 检查:
1. Supabase凭证是否正确
2. RLS策略是否正确设置
3. 查看Supabase日志

## 📞 支持

遇到问题？
- 查看日志: Render Dashboard / Vercel Dashboard
- 检查环境变量配置
- 查看Supabase项目状态
