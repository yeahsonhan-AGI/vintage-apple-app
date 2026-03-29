import { useState, useEffect } from 'react'
import AuthScreen from './components/AuthScreen'
import Desktop from './components/Desktop'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        setIsAuthenticated(true)
      } catch (e) {
        console.error('Failed to parse saved user:', e)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const handleAuthSuccess = (userData: { user: { id: string; email: string }; token: string }) => {
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify(userData.user))
    setIsAuthenticated(true)
    setUser(userData.user)
  }

  const handleSignOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
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
