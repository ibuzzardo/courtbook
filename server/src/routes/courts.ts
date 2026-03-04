import express from 'express'
import type { Court, ApiResponse } from '../types.js'

const router = express.Router()

// In-memory storage for courts
const courts = new Map<string, Court>([
  [
    '1',
    {
      id: '1',
      name: 'Centre Court',
      type: 'grass',
      hourlyRate: 50,
      available: true,
      description: 'Premium grass court with excellent drainage and professional maintenance.',
    },
  ],
  [
    '2',
    {
      id: '2',
      name: 'Court 2',
      type: 'clay',
      hourlyRate: 40,
      available: true,
      description: 'Traditional clay court perfect for baseline players.',
    },
  ],
  [
    '3',
    {
      id: '3',
      name: 'Court 3',
      type: 'hard',
      hourlyRate: 35,
      available: true,
      description: 'Modern hard court with excellent bounce consistency.',
    },
  ],
  [
    '4',
    {
      id: '4',
      name: 'Practice Court',
      type: 'hard',
      hourlyRate: 25,
      available: false,
      description: 'Practice court currently under maintenance.',
    },
  ],
])

// GET /api/courts - Get all courts
router.get('/', (req, res) => {
  try {
    const allCourts = Array.from(courts.values())
    const response: ApiResponse<Court[]> = {
      success: true,
      data: allCourts,
    }
    res.json(response)
  } catch (error) {
    console.error('Error fetching courts:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch courts',
    }
    res.status(500).json(response)
  }
})

// GET /api/courts/:id - Get court by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const court = courts.get(id)
    
    if (!court) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Not Found',
        message: 'Court not found',
      }
      return res.status(404).json(response)
    }
    
    const response: ApiResponse<Court> = {
      success: true,
      data: court,
    }
    res.json(response)
  } catch (error) {
    console.error('Error fetching court:', error)
    const response: ApiResponse<never> = {
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch court',
    }
    res.status(500).json(response)
  }
})

export { courts }
export default router