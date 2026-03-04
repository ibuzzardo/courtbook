import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { errorHandler, type CustomError } from '../../server/src/middleware/errorHandler'

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let jsonSpy: ReturnType<typeof vi.fn>
  let statusSpy: ReturnType<typeof vi.fn>
  
  beforeEach(() => {
    jsonSpy = vi.fn()
    statusSpy = vi.fn().mockReturnValue({ json: jsonSpy })
    
    mockRequest = {}
    mockResponse = {
      status: statusSpy,
      json: jsonSpy
    }
    mockNext = vi.fn()
    
    // Mock console.error to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })
  
  it('should handle custom error with status code', () => {
    const customError: CustomError = new Error('Custom error message')
    customError.statusCode = 400
    customError.name = 'ValidationError'
    
    errorHandler(
      customError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    )
    
    expect(statusSpy).toHaveBeenCalledWith(400)
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      error: 'ValidationError',
      message: 'Custom error message'
    })
  })
  
  it('should handle error without status code (defaults to 500)', () => {
    const error = new Error('Generic error')
    
    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    )
    
    expect(statusSpy).toHaveBeenCalledWith(500)
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      error: 'Error',
      message: 'Generic error'
    })
  })
  
  it('should handle error without message (defaults to Internal Server Error)', () => {
    const error = new Error()
    error.message = ''
    
    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    )
    
    expect(statusSpy).toHaveBeenCalledWith(500)
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      error: 'Error',
      message: 'Internal Server Error'
    })
  })
  
  it('should handle error without name (defaults to Error)', () => {
    const error = new Error('Test message')
    delete error.name
    
    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    )
    
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      error: 'Error',
      message: 'Test message'
    })
  })
  
  it('should log error to console', () => {
    const error = new Error('Test error')
    const consoleSpy = vi.spyOn(console, 'error')
    
    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    )
    
    expect(consoleSpy).toHaveBeenCalledWith('Error:', error)
  })
  
  it('should handle error with custom status property', () => {
    const customError: CustomError = new Error('Custom error')
    customError.status = 'fail'
    customError.statusCode = 422
    
    errorHandler(
      customError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    )
    
    expect(statusSpy).toHaveBeenCalledWith(422)
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      error: 'Error',
      message: 'Custom error'
    })
  })
})