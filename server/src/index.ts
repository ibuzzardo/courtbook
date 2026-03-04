import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import courtsRouter from './routes/courts.js'
import bookingsRouter from './routes/bookings.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.SERVER_PORT || 3001

// Middleware
app.use(cors())
app.use(morgan('combined'))
app.use(express.json())

// Routes
app.use('/api/courts', courtsRouter)
app.use('/api/bookings', bookingsRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})