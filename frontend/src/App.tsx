import { useState, useEffect } from 'react'
import AuthScreen from './components/AuthScreen'
import Desktop from './components/Desktop'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function App() {
  // 临时跳过认证，直接进入主界面
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [user, setUser] = useState<{ id: string; email: string }>({ id: 'demo-user', email: 'demo@example.com' })
  const [loading, setLoading] = useState(true)

  // 初始化时获取 demo token
  useEffect(() => {
    const initDemoToken = async () => {
      // 清除所有旧数据，重新初始化
      localStorage.clear()

      try {
        console.log('Fetching demo token from:', `${API_URL}/auth/demo`)
        const response = await fetch(`${API_URL}/auth/demo`, {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        console.log('Demo token response:', data)

        if (data.success && data.data?.token) {
          localStorage.setItem('token', data.data.token)
          setUser(data.data.user)
          console.log('✅ Token saved, user:', data.data.user)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (error) {
        console.error('❌ Failed to get demo token:', error)
        // 即使失败也继续，让用户能看到界面
      } finally {
        setLoading(false)
      }
    }
    initDemoToken()
  }, [])

  const handleAuthSuccess = (userData: { user: { id: string; email: string }; token: string }) => {
    localStorage.setItem('token', userData.token)
    setIsAuthenticated(true)
    setUser(userData.user)
  }

  const handleSignOut = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser({ id: 'demo-user', email: 'demo@example.com' })
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">🎨</div>
        <div className="loading-text">Loading Q-Draw OS...</div>
      </div>
    )
  }

  return (
    <>
      {!isAuthenticated ? (
        <AuthScreen onSuccess={handleAuthSuccess} />
      ) : (
        <Desktop user={user} onSignOut={handleSignOut} />
      )}
    </>
  )
}

export default App
