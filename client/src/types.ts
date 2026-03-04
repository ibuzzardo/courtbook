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

export interface CreateBookingRequest {
  courtId: string
  customerName: string
  customerEmail: string
  date: string
  startTime: string
  endTime: string
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}