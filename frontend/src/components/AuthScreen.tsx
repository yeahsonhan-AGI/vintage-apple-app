import { useState, type FormEvent } from 'react'
import { api } from '../lib/api'

interface AuthScreenProps {
  onSuccess: (userData: { user: { id: string; email: string }; token: string }) => void
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = isSignUp
        ? await api.signUp(email, password)
        : await api.signIn(email, password)

      if (response.success && response.data) {
        const data = response.data as { user: { id: string; email: string }; token: string }
        onSuccess(data)
      } else {
        setError(response.error || 'Authentication failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎨</div>
          <h1 className="auth-title">Q-Draw OS</h1>
          <p className="auth-subtitle">Your Creative Studio</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${!isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(false)}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${isSignUp ? 'active' : ''}`}
            onClick={() => setIsSignUp(true)}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="auth-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span>Loading...</span>
            ) : (
              <span>{isSignUp ? 'Create Account ✨' : 'Welcome Back 🎉'}</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            className="auth-link-btn"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  )
}
