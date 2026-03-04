import { z } from 'zod'

export interface Court {
  id: string
  name: string
  type: 'clay' | 'grass' | 'hard'
  hourlyRate: number
  available: boolean
  description?: string
}

export interface Booking {
  id: string
  courtId: string
  customerName: string
  customerEmail: string
  date: string
  startTime: string
  endTime: string
  totalCost: number
  status: 'confirmed' | 'pending' | 'cancelled'
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

// Zod schemas for validation
export const createBookingSchema = z.object({
  courtId: z.string().min(1, 'Court ID is required'),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  customerEmail: z.string().email('Please provide a valid email address'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
})

export type CreateBookingRequest = z.infer<typeof createBookingSchema>