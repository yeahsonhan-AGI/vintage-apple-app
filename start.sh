#!/bin/bash

# Q-Draw OS 启动脚本

echo "🚀 启动 Q-Draw OS..."

# 启动后端
echo "📡 启动后端服务..."
cd backend
npm run dev &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
echo "🎨 启动前端服务..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Q-Draw OS 已启动!"
echo ""
echo "📱 前端: http://localhost:5173"
echo "🔧 后端: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 捕获退出信号
trap "echo ''; echo '🛑 停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM

# 保持脚本运行
wait
