import express from 'express'
import { z } from 'zod'
import type { Booking, ApiResponse, CreateBookingRequest } from '../types.js'
import { createBookingSchema } from '../types.js'
import { courts } from './courts.js'

const router = express.Router()

// In-memory storage for bookings
const bookings = new Map<string, Booking>()

// Helper function to generate unique ID
const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Helper function to calculate total cost
const calculateTotalCost = (startTime: string, endTime: string, hourlyRate: number): number => {
  const start = new Date(`2000-01-01T${startTime}`)
  const end = new Date(`2000-01-01T${endTime}`)
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  return Math.max(0, hours * hourlyRate)
}

// POST /api/bookings - Create a new booking
router.post('/', (req, res) => {
  try {
    // Validate request body
    const validationResult = createBookingSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Validation Error',
        message: validationResult.error.errors.map(e => e.message).join(', '),
      }
      return res.status(400).json(response)
    }
    
    const bookingData: CreateBookingRequest = validationResult.data
    
    // Check if court exists
    const court = courts.get(bookingData.courtId)
    if (!court) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Not Found',
        message: 'Court not found',
      }
      return res.status(404).json(response)
    }
    
    // Check if court is available
    if (!court.available) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Unavailable',
        message: 'Court is not available for booking',
      }
      return res.status(400).json(response)
    }
    
    // Validate time range
    const startTime = new Date(`2000-01-01T${bookingData.startTime}`)
    const endTime = new Date(`2000-01-01T${bookingData.endTime}`)
    
    if (endTime <= startTime) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Invalid Time Range',
        message: 'End time must be after start time',
      }
      return res.status(400).json(response)
    }
    
    // Calculate total cost
    const totalCost = calculateTotalCost(bookingData.startTime, bookingData.endTime, court.hourlyRate)
    
    // Create booking
    const booking: Booking = {
      id: generateId(),
      courtId: bookingData.courtId,
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      date: bookingData.date,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      totalCost,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    }
    
    // Store booking
    bookings.set(booking.id, booking)
    
    const response: ApiResponse<Booking> = {
      success: true,
      data: booking,
      message: 'Booking created successfully',
    }
    
    res.status(201).json(response)
  } catch (error) {
    console.error('Error creating booking:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to create booking',
    }
    res.status(500).json(response)
  }
})

// GET /api/bookings - Get all bookings
router.get('/', (req, res) => {
  try {
    const allBookings = Array.from(bookings.values())
    const response: ApiResponse<Booking[]> = {
      success: true,
      data: allBookings,
    }
    res.json(response)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch bookings',
    }
    res.status(500).json(response)
  }
})

// GET /api/bookings/:id - Get booking by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const booking = bookings.get(id)
    
    if (!booking) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Not Found',
        message: 'Booking not found',
      }
      return res.status(404).json(response)
    }
    
    const response: ApiResponse<Booking> = {
      success: true,
      data: booking,
    }
    res.json(response)
  } catch (error) {
    console.error('Error fetching booking:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch booking',
    }
    res.status(500).json(response)
  }
})

export default router