import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { getCourts, createBooking } from '../../client/src/api/courts'
import type { Court, Booking, CreateBookingRequest } from '../../client/src/types'

vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('Courts API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAxios.create.mockReturnValue(mockedAxios)
  })
  
  describe('getCourts', () => {
    it('should fetch courts successfully', async () => {
      const mockCourts: Court[] = [
        {
          id: '1',
          name: 'Centre Court',
          type: 'grass',
          hourlyRate: 50,
          available: true,
          description: 'Premium grass court'
        }
      ]
      
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockCourts
        }
      })
      
      const result = await getCourts()
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/courts')
      expect(result).toEqual(mockCourts)
    })
    
    it('should handle empty courts response', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: null
        }
      })
      
      const result = await getCourts()
      
      expect(result).toEqual([])
    })
    
    it('should throw error when API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))
      
      await expect(getCourts()).rejects.toThrow('Failed to fetch courts')
    })
    
    it('should handle axios error response', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { message: 'Server error' }
        }
      }
      
      mockedAxios.get.mockRejectedValueOnce(axiosError)
      
      await expect(getCourts()).rejects.toThrow('Failed to fetch courts')
    })
  })
  
  describe('createBooking', () => {
    const mockBookingRequest: CreateBookingRequest = {
      courtId: '1',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '11:00'
    }
    
    const mockBookingResponse: Booking = {
      id: '1',
      ...mockBookingRequest,
      totalCost: 50,
      status: 'confirmed',
      createdAt: '2024-01-01T10:00:00Z'
    }
    
    it('should create booking successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockBookingResponse
        }
      })
      
      const result = await createBooking(mockBookingRequest)
      
      expect(mockedAxios.post).toHaveBeenCalledWith('/bookings', mockBookingRequest)
      expect(result).toEqual(mockBookingResponse)
    })
    
    it('should throw error when response data is missing', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: null
        }
      })
      
      await expect(createBooking(mockBookingRequest)).rejects.toThrow('Invalid response from server')
    })
    
    it('should handle axios error with custom message', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          data: { message: 'Court not available' }
        }
      }
      
      mockedAxios.isAxiosError.mockReturnValue(true)
      mockedAxios.post.mockRejectedValueOnce(axiosError)
      
      await expect(createBooking(mockBookingRequest)).rejects.toThrow('Court not available')
    })
    
    it('should throw generic error for non-axios errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'))
      mockedAxios.isAxiosError.mockReturnValue(false)
      
      await expect(createBooking(mockBookingRequest)).rejects.toThrow('Failed to create booking')
    })
  })
})