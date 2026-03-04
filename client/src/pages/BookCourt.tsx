"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User, Mail, DollarSign, CheckCircle } from 'lucide-react'
import { z } from 'zod'
import { getCourts, createBooking } from '../api/courts'
import type { Court, CreateBookingRequest } from '../types'

const bookingSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Please enter a valid email address'),
  date: z.string().min(1, 'Please select a date'),
  startTime: z.string().min(1, 'Please select a start time'),
  endTime: z.string().min(1, 'Please select an end time'),
})

type BookingFormData = z.infer<typeof bookingSchema>

function BookCourt(): JSX.Element {
  const { courtId } = useParams<{ courtId: string }>()
  const navigate = useNavigate()
  
  const [court, setCourt] = useState<Court | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [showSuccess, setShowSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: '',
    customerEmail: '',
    date: '',
    startTime: '',
    endTime: '',
  })
  const [formErrors, setFormErrors] = useState<Partial<BookingFormData>>({})

  useEffect(() => {
    const fetchCourt = async (): Promise<void> => {
      try {
        setLoading(true)
        const courts = await getCourts()
        const foundCourt = courts.find(c => c.id === courtId)
        if (!foundCourt) {
          setError('Court not found')
          return
        }
        setCourt(foundCourt)
      } catch (err) {
        console.error('Failed to fetch court:', err)
        setError('Failed to load court details')
      } finally {
        setLoading(false)
      }
    }

    if (courtId) {
      fetchCourt()
    }
  }, [courtId])

  const calculateTotalCost = (): number => {
    if (!court || !formData.startTime || !formData.endTime) return 0
    
    const start = new Date(`2000-01-01T${formData.startTime}`)
    const end = new Date(`2000-01-01T${formData.endTime}`)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    
    return Math.max(0, hours * court.hourlyRate)
  }

  const handleInputChange = (field: keyof BookingFormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    
    if (!court || !courtId) return

    try {
      setSubmitting(true)
      setError(null)
      setFormErrors({})
      
      const validatedData = bookingSchema.parse(formData)
      
      const bookingRequest: CreateBookingRequest = {
        courtId,
        ...validatedData,
      }
      
      await createBooking(bookingRequest)
      setShowSuccess(true)
      
      setTimeout(() => {
        navigate('/')
      }, 2000)
      
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Partial<BookingFormData> = {}
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0] as keyof BookingFormData] = error.message
          }
        })
        setFormErrors(errors)
      } else {
        console.error('Booking failed:', err)
        setError('Failed to create booking. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !court) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-destructive text-lg mb-4">{error || 'Court not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="btn"
          >
            Back to Courts
          </button>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
          <p className="text-muted mb-4">Your court has been successfully booked.</p>
          <p className="text-sm text-muted">Redirecting to home page...</p>
        </div>
      </div>
    )
  }

  const totalCost = calculateTotalCost()

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-muted hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Courts</span>
        </button>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Book {court.name}</h1>
        <p className="text-muted">Fill in the details below to book your court</p>
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold text-foreground mb-2">Court Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted">Type:</span>
            <span className="ml-2 font-medium">{court.type.charAt(0).toUpperCase() + court.type.slice(1)}</span>
          </div>
          <div>
            <span className="text-muted">Rate:</span>
            <span className="ml-2 font-medium">${court.hourlyRate}/hour</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className={`input w-full ${formErrors.customerName ? 'border-destructive' : ''}`}
              placeholder="Enter your full name"
            />
            {formErrors.customerName && (
              <p className="text-destructive text-sm mt-1">{formErrors.customerName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Mail className="h-4 w-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              className={`input w-full ${formErrors.customerEmail ? 'border-destructive' : ''}`}
              placeholder="Enter your email"
            />
            {formErrors.customerEmail && (
              <p className="text-destructive text-sm mt-1">{formErrors.customerEmail}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`input w-full ${formErrors.date ? 'border-destructive' : ''}`}
          />
          {formErrors.date && (
            <p className="text-destructive text-sm mt-1">{formErrors.date}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Start Time
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className={`input w-full ${formErrors.startTime ? 'border-destructive' : ''}`}
            />
            {formErrors.startTime && (
              <p className="text-destructive text-sm mt-1">{formErrors.startTime}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              End Time
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              className={`input w-full ${formErrors.endTime ? 'border-destructive' : ''}`}
            />
            {formErrors.endTime && (
              <p className="text-destructive text-sm mt-1">{formErrors.endTime}</p>
            )}
          </div>
        </div>

        {totalCost > 0 && (
          <div className="card bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="flex items-center text-foreground font-medium">
                <DollarSign className="h-4 w-4 mr-1" />
                Total Cost
              </span>
              <span className="text-xl font-bold text-primary">${totalCost.toFixed(2)}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 text-muted rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || totalCost <= 0}
            className="btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Booking...' : `Book Court - $${totalCost.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BookCourt