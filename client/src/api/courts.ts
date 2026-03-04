import axios from 'axios'
import type { Court, Booking, CreateBookingRequest, ApiResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getCourts = async (): Promise<Court[]> => {
  try {
    const response = await api.get<ApiResponse<Court[]>>('/courts')
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching courts:', error)
    throw new Error('Failed to fetch courts')
  }
}

export const createBooking = async (booking: CreateBookingRequest): Promise<Booking> => {
  try {
    const response = await api.post<ApiResponse<Booking>>('/bookings', booking)
    if (!response.data.data) {
      throw new Error('Invalid response from server')
    }
    return response.data.data
  } catch (error) {
    console.error('Error creating booking:', error)
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error('Failed to create booking')
  }
}