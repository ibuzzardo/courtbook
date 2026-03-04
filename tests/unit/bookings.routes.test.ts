import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import bookingsRouter from '../../server/src/routes/bookings'
import { courts } from '../../server/src/routes/courts'

const app = express()
app.use(express.json())
app.use('/api/bookings', bookingsRouter)

describe('Bookings Routes', () => {
  beforeEach(() => {
    // Setup test courts
    courts.clear()
    courts.set('1', {
      id: '1',
      name: 'Centre Court',
      type: 'grass',
      hourlyRate: 50,
      available: true
    })
    courts.set('2', {
      id: '2',
      name: 'Court 2',
      type: 'clay',
      hourlyRate: 40,
      available: false
    })
  })
  
  describe('POST /api/bookings', () => {
    const validBookingData = {
      courtId: '1',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '11:00'
    }
    
    it('should create booking successfully', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send(validBookingData)
        .expect(201)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject({
        courtId: '1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        totalCost: 50,
        status: 'confirmed'
      })
      expect(response.body.data.id).toBeDefined()
      expect(response.body.data.createdAt).toBeDefined()
    })
    
    it('should calculate total cost correctly for 2-hour booking', async () => {
      const bookingData = {
        ...validBookingData,
        startTime: '10:00',
        endTime: '12:00'
      }
      
      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201)
      
      expect(response.body.data.totalCost).toBe(100) // 2 hours * $50
    })
    
    it('should reject booking with invalid email', async () => {
      const invalidData = {
        ...validBookingData,
        customerEmail: 'invalid-email'
      }
      
      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData)
        .expect(400)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation Error')
      expect(response.body.message).toContain('valid email')
    })
    
    it('should reject booking with short customer name', async () => {
      const invalidData = {
        ...validBookingData,
        customerName: 'J'
      }
      
      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData)
        .expect(400)
      
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('at least 2 characters')
    })
    
    it('should reject booking for non-existent court', async () => {
      const invalidData = {
        ...validBookingData,
        courtId: '999'
      }
      
      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData)
        .expect(404)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Not Found')
      expect(response.body.message).toBe('Court not found')
    })
    
    it('should reject booking for unavailable court', async () => {
      const invalidData = {
        ...validBookingData,
        courtId: '2' // Court 2 is unavailable
      }
      
      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData)
        .expect(400)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Unavailable')
      expect(response.body.message).toBe('Court is not available for booking')
    })
    
    it('should reject booking with invalid time range', async () => {
      const invalidData = {
        ...validBookingData,
        startTime: '11:00',
        endTime: '10:00' // End before start
      }
      
      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData)
        .expect(400)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid Time Range')
      expect(response.body.message).toBe('End time must be after start time')
    })
    
    it('should reject booking with same start and end time', async () => {
      const invalidData = {
        ...validBookingData,
        startTime: '10:00',
        endTime: '10:00'
      }
      
      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData)
        .expect(400)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid Time Range')
    })
    
    it('should reject booking with missing required fields', async () => {
      const invalidData = {
        courtId: '',
        customerName: '',
        customerEmail: '',
        date: '',
        startTime: '',
        endTime: ''
      }
      
      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData)
        .expect(400)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation Error')
    })
    
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400)
    })
  })
  
  describe('GET /api/bookings', () => {
    it('should return empty array when no bookings exist', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .expect(200)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(0)
    })
    
    it('should return all bookings after creating some', async () => {
      // Create a booking first
      await request(app)
        .post('/api/bookings')
        .send({
          courtId: '1',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          date: '2024-01-15',
          startTime: '10:00',
          endTime: '11:00'
        })
      
      const response = await request(app)
        .get('/api/bookings')
        .expect(200)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(1)
    })
  })
  
  describe('GET /api/bookings/:id', () => {
    it('should return 404 for non-existent booking', async () => {
      const response = await request(app)
        .get('/api/bookings/999')
        .expect(404)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Not Found')
      expect(response.body.message).toBe('Booking not found')
    })
  })
})