import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CourtCard from '../../../client/src/components/CourtCard'
import type { Court } from '../../../client/src/types'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('CourtCard Component', () => {
  const mockCourt: Court = {
    id: '1',
    name: 'Centre Court',
    type: 'grass',
    hourlyRate: 50,
    available: true,
    description: 'Premium grass court with excellent drainage'
  }
  
  it('should render court information correctly', () => {
    renderWithRouter(<CourtCard court={mockCourt} />)
    
    expect(screen.getByText('Centre Court')).toBeInTheDocument()
    expect(screen.getByText('Grass Court')).toBeInTheDocument()
    expect(screen.getByText('$50/hour')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('Premium grass court with excellent drainage')).toBeInTheDocument()
  })
  
  it('should render Book Now button for available court', () => {
    renderWithRouter(<CourtCard court={mockCourt} />)
    
    const bookButton = screen.getByRole('link', { name: /book now/i })
    expect(bookButton).toBeInTheDocument()
    expect(bookButton).toHaveAttribute('href', '/book/1')
  })
  
  it('should render unavailable button for unavailable court', () => {
    const unavailableCourt: Court = {
      ...mockCourt,
      available: false
    }
    
    renderWithRouter(<CourtCard court={unavailableCourt} />)
    
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
    const unavailableButton = screen.getByRole('button', { name: /unavailable/i })
    expect(unavailableButton).toBeDisabled()
    expect(screen.queryByRole('link', { name: /book now/i })).not.toBeInTheDocument()
  })
  
  it('should apply correct styling for different court types', () => {
    const clayCourt: Court = { ...mockCourt, type: 'clay' }
    const { rerender } = renderWithRouter(<CourtCard court={clayCourt} />)
    
    expect(screen.getByText('Clay Court')).toHaveClass('bg-orange-100', 'text-orange-800')
    
    const hardCourt: Court = { ...mockCourt, type: 'hard' }
    rerender(
      <BrowserRouter>
        <CourtCard court={hardCourt} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Hard Court')).toHaveClass('bg-blue-100', 'text-blue-800')
  })
  
  it('should handle court without description', () => {
    const courtWithoutDescription: Court = {
      ...mockCourt,
      description: undefined
    }
    
    renderWithRouter(<CourtCard court={courtWithoutDescription} />)
    
    expect(screen.getByText('Centre Court')).toBeInTheDocument()
    expect(screen.queryByText('Premium grass court')).not.toBeInTheDocument()
  })
  
  it('should display correct availability status styling', () => {
    renderWithRouter(<CourtCard court={mockCourt} />)
    
    const availableStatus = screen.getByText('Available')
    expect(availableStatus).toHaveClass('bg-green-100', 'text-green-800')
    
    const unavailableCourt: Court = { ...mockCourt, available: false }
    const { rerender } = renderWithRouter(<CourtCard court={unavailableCourt} />)
    
    rerender(
      <BrowserRouter>
        <CourtCard court={unavailableCourt} />
      </BrowserRouter>
    )
    
    const unavailableStatus = screen.getByText('Unavailable')
    expect(unavailableStatus).toHaveClass('bg-red-100', 'text-red-800')
  })
  
  it('should render all required icons', () => {
    renderWithRouter(<CourtCard court={mockCourt} />)
    
    // Check for dollar sign icon (in hourly rate)
    expect(screen.getByText('$50/hour')).toBeInTheDocument()
    
    // Check for clock icon (in time slots)
    expect(screen.getByText('1-2 hour slots')).toBeInTheDocument()
  })
  
  it('should handle edge case court types', () => {
    const unknownTypeCourt: Court = {
      ...mockCourt,
      type: 'unknown' as any
    }
    
    renderWithRouter(<CourtCard court={unknownTypeCourt} />)
    
    expect(screen.getByText('Unknown Court')).toBeInTheDocument()
  })
})