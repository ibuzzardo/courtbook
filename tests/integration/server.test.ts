import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import cors from 'cors'
import courtsRouter from '../../server/src/routes/courts'
import bookingsRouter from '../../server/src/routes/bookings'
import { errorHandler } from '../../server/src/middleware/errorHandler'

// Create test app similar to main server
const createTestApp = () => {
  const app = express()
  
  app.use(cors())
  app.use(express.json())
  
  app.use('/api/courts', courtsRouter)
  app.use('/api/bookings', bookingsRouter)
  
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() })
  })
  
  app.use(errorHandler)
  
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `Route ${req.originalUrl} not found`,
    })
  })
  
  return app
}

describe('Server Integration Tests', () => {
  let app: express.Application
  
  beforeAll(() => {
    app = createTestApp()
  })
  
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
      
      expect(response.body.status).toBe('OK')
      expect(response.body.timestamp).toBeDefined()
    })
  })
  
  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Not Found')
      expect(response.body.message).toContain('/unknown-route')
    })
    
    it('should return 404 for unknown API routes', async () => {
      const response = await request(app)
        .get('/api/unknown')
        .expect(404)
      
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('/api/unknown')
    })
  })
  
  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
      
      expect(response.headers['access-control-allow-origin']).toBeDefined()
    })
    
    it('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/api/courts')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204)
      
      expect(response.headers['access-control-allow-origin']).toBeDefined()
    })
  })
  
  describe('JSON Parsing', () => {
    it('should parse valid JSON', async () => {
      const validBooking = {
        courtId: '1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00'
      }
      
      const response = await request(app)
        .post('/api/bookings')
        .send(validBooking)
        .expect(201)
      
      expect(response.body.success).toBe(true)
    })
    
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json')
        .expect(400)
    })
  })
  
  describe('End-to-End Booking Flow', () => {
    it('should complete full booking workflow', async () => {
      // 1. Get available courts
      const courtsResponse = await request(app)
        .get('/api/courts')
        .expect(200)
      
      expect(courtsResponse.body.success).toBe(true)
      expect(courtsResponse.body.data.length).toBeGreaterThan(0)
      
      const availableCourt = courtsResponse.body.data.find((court: any) => court.available)
      expect(availableCourt).toBeDefined()
      
      // 2. Create a booking for the available court
      const bookingData = {
        courtId: availableCourt.id,
        customerName: 'Integration Test User',
        customerEmail: 'test@example.com',
        date: '2024-01-15',
        startTime: '14:00',
        endTime: '15:00'
      }
      
      const bookingResponse = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201)
      
      expect(bookingResponse.body.success).toBe(true)
      expect(bookingResponse.body.data.courtId).toBe(availableCourt.id)
      expect(bookingResponse.body.data.totalCost).toBe(availableCourt.hourlyRate)
      
      // 3. Verify booking was created
      const allBookingsResponse = await request(app)
        .get('/api/bookings')
        .expect(200)
      
      expect(allBookingsResponse.body.success).toBe(true)
      expect(allBookingsResponse.body.data.length).toBeGreaterThan(0)
      
      const createdBooking = allBookingsResponse.body.data.find(
        (booking: any) => booking.id === bookingResponse.body.data.id
      )
      expect(createdBooking).toBeDefined()
    })
    
    it('should handle multiple bookings for different courts', async () => {
      const courtsResponse = await request(app)
        .get('/api/courts')
        .expect(200)
      
      const availableCourts = courtsResponse.body.data.filter((court: any) => court.available)
      
      if (availableCourts.length >= 2) {
        // Create bookings for multiple courts
        const booking1 = {
          courtId: availableCourts[0].id,
          customerName: 'User 1',
          customerEmail: 'user1@example.com',
          date: '2024-01-16',
          startTime: '09:00',
          endTime: '10:00'
        }
        
        const booking2 = {
          courtId: availableCourts[1].id,
          customerName: 'User 2',
          customerEmail: 'user2@example.com',
          date: '2024-01-16',
          startTime: '10:00',
          endTime: '11:00'
        }
        
        const response1 = await request(app)
          .post('/api/bookings')
          .send(booking1)
          .expect(201)
        
        const response2 = await request(app)
          .post('/api/bookings')
          .send(booking2)
          .expect(201)
        
        expect(response1.body.data.courtId).toBe(availableCourts[0].id)
        expect(response2.body.data.courtId).toBe(availableCourts[1].id)
      }
    })
  })
  
  describe('Error Handling Integration', () => {
    it('should handle validation errors consistently', async () => {
      const invalidBooking = {
        courtId: '',
        customerName: 'A',
        customerEmail: 'invalid-email',
        date: '',
        startTime: '',
        endTime: ''
      }
      
      const response = await request(app)
        .post('/api/bookings')
        .send(invalidBooking)
        .expect(400)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation Error')
      expect(response.body.message).toBeDefined()
    })
    
    it('should handle resource not found errors', async () => {
      const response = await request(app)
        .get('/api/courts/non-existent-id')
        .expect(404)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Not Found')
    })
  })
})