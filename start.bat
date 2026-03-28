@echo off
echo 🚀 启动 Q-Draw OS...

echo 📡 启动后端服务...
cd backend
start "Backend" npm run dev

echo 🎨 启动前端服务...
cd ..\frontend
start "Frontend" npm run dev

echo.
echo ✅ Q-Draw OS 已启动!
echo.
echo 📱 前端: http://localhost:5173
echo 🔧 后端: http://localhost:3000
echo.
echo 按任意键关闭此窗口...
pause
