import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { createBookingSchema } from '../../server/src/types.js'
import type { Court, Booking, ApiResponse, CreateBookingRequest } from '../../server/src/types.js'

describe('Types and Schemas', () => {
  describe('createBookingSchema', () => {
    it('should validate valid booking data', () => {
      const validBooking = {
        courtId: '1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00'
      }
      
      const result = createBookingSchema.safeParse(validBooking)
      expect(result.success).toBe(true)
    })
    
    it('should reject booking with invalid email', () => {
      const invalidBooking = {
        courtId: '1',
        customerName: 'John Doe',
        customerEmail: 'invalid-email',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00'
      }
      
      const result = createBookingSchema.safeParse(invalidBooking)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0].message).toContain('valid email')
    })
    
    it('should reject booking with short customer name', () => {
      const invalidBooking = {
        courtId: '1',
        customerName: 'J',
        customerEmail: 'john@example.com',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00'
      }
      
      const result = createBookingSchema.safeParse(invalidBooking)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0].message).toContain('at least 2 characters')
    })
    
    it('should reject booking with missing required fields', () => {
      const invalidBooking = {
        courtId: '',
        customerName: '',
        customerEmail: '',
        date: '',
        startTime: '',
        endTime: ''
      }
      
      const result = createBookingSchema.safeParse(invalidBooking)
      expect(result.success).toBe(false)
      expect(result.error?.errors.length).toBeGreaterThan(0)
    })
  })
  
  describe('Type Interfaces', () => {
    it('should define Court interface correctly', () => {
      const court: Court = {
        id: '1',
        name: 'Test Court',
        type: 'clay',
        hourlyRate: 50,
        available: true,
        description: 'Test description'
      }
      
      expect(court.id).toBe('1')
      expect(court.type).toBe('clay')
      expect(court.hourlyRate).toBe(50)
      expect(court.available).toBe(true)
    })
    
    it('should define Booking interface correctly', () => {
      const booking: Booking = {
        id: '1',
        courtId: '1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '11:00',
        totalCost: 50,
        status: 'confirmed',
        createdAt: '2024-01-01T10:00:00Z'
      }
      
      expect(booking.status).toBe('confirmed')
      expect(booking.totalCost).toBe(50)
    })
    
    it('should define ApiResponse interface correctly', () => {
      const successResponse: ApiResponse<string> = {
        success: true,
        data: 'test data'
      }
      
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'Test Error',
        message: 'Test message'
      }
      
      expect(successResponse.success).toBe(true)
      expect(successResponse.data).toBe('test data')
      expect(errorResponse.success).toBe(false)
      expect(errorResponse.error).toBe('Test Error')
    })
  })
})