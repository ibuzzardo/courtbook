import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import courtsRouter, { courts } from '../../server/src/routes/courts'

const app = express()
app.use(express.json())
app.use('/api/courts', courtsRouter)

describe('Courts Routes', () => {
  beforeEach(() => {
    // Reset courts to initial state
    courts.clear()
    courts.set('1', {
      id: '1',
      name: 'Centre Court',
      type: 'grass',
      hourlyRate: 50,
      available: true,
      description: 'Premium grass court'
    })
    courts.set('2', {
      id: '2',
      name: 'Court 2',
      type: 'clay',
      hourlyRate: 40,
      available: false
    })
  })
  
  describe('GET /api/courts', () => {
    it('should return all courts', async () => {
      const response = await request(app)
        .get('/api/courts')
        .expect(200)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.data[0]).toMatchObject({
        id: '1',
        name: 'Centre Court',
        type: 'grass',
        hourlyRate: 50,
        available: true
      })
    })
    
    it('should return empty array when no courts exist', async () => {
      courts.clear()
      
      const response = await request(app)
        .get('/api/courts')
        .expect(200)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(0)
    })
  })
  
  describe('GET /api/courts/:id', () => {
    it('should return specific court by ID', async () => {
      const response = await request(app)
        .get('/api/courts/1')
        .expect(200)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject({
        id: '1',
        name: 'Centre Court',
        type: 'grass',
        hourlyRate: 50,
        available: true
      })
    })
    
    it('should return 404 for non-existent court', async () => {
      const response = await request(app)
        .get('/api/courts/999')
        .expect(404)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Not Found')
      expect(response.body.message).toBe('Court not found')
    })
    
    it('should handle empty court ID', async () => {
      const response = await request(app)
        .get('/api/courts/')
        .expect(404)
    })
  })
  
  describe('Error Handling', () => {
    it('should handle invalid routes', async () => {
      const response = await request(app)
        .post('/api/courts')
        .expect(404)
    })
  })
})