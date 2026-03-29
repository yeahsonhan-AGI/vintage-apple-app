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
    const checkAuth = () => {
      console.log('App: checkAuth called')
      console.log('App: localStorage before check:', { ...localStorage })

      // Check URL params for email confirmation token
      const urlParams = new URLSearchParams(window.location.search)
      const confirmToken = urlParams.get('token')
      const error = urlParams.get('error')

      if (confirmToken) {
        console.log('App: Found confirmation token in URL')
        // User just confirmed email, save token and clear URL
        localStorage.setItem('token', confirmToken)
        // Get user info with the token
        fetchUserInfo(confirmToken)
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname)
        return
      }

      if (error) {
        console.error('Email confirmation error:', error)
        setLoading(false)
        return
      }

      // Check for existing session
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')

      console.log('App: token from localStorage:', token ? 'exists' : 'none')
      console.log('App: user from localStorage:', savedUser ? 'exists' : 'none')

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser))
          setIsAuthenticated(true)
          console.log('App: User authenticated from localStorage')
        } catch (e) {
          console.error('Failed to parse saved user:', e)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user))
          setUser(data.data.user)
          setIsAuthenticated(true)
        }
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = (userData: { user: { id: string; email: string }; token: string }) => {
    console.log('Auth success!', userData)

    // Clear any existing auth data first
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Then save new data
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify(userData.user))
    setIsAuthenticated(true)
    setUser(userData.user)

    console.log('Token saved:', localStorage.getItem('token') ? 'YES' : 'NO')
    console.log('User saved:', localStorage.getItem('user'))

    // Verify token was saved correctly
    const verifyToken = localStorage.getItem('token')
    if (verifyToken !== userData.token) {
      console.error('Token mismatch! Expected:', userData.token.substring(0, 20), 'Got:', verifyToken?.substring(0, 20))
    }
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
