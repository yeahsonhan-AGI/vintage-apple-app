import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import notesRoutes from './routes/notes'
import calendarRoutes from './routes/calendar'
import foodRoutes from './routes/food'
import fitnessRoutes from './routes/fitness'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
// Increase payload size limit for food images (up to 10MB)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging middleware
app.use((req, res, next) => {
  const logData = {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body?.image ? { image: 'base64 image data (length omitted)' } : req.body
  }
  console.log(`${req.method} ${req.path}`, JSON.stringify(logData))
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/calendar', calendarRoutes)
app.use('/api/food', foodRoutes)
app.use('/api/fitness', fitnessRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Q-Draw OS API is running' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📚 API: http://localhost:${PORT}/api`)
})
