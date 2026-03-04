import type { Request, Response, NextFunction } from 'express'
import type { ApiResponse } from '../types.js'

export interface CustomError extends Error {
  statusCode?: number
  status?: string
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err)
  
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  
  const response: ApiResponse<never> = {
    success: false,
    error: err.name || 'Error',
    message,
  }
  
  res.status(statusCode).json(response)
}