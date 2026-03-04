import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import Navbar from '../../../client/src/components/Navbar'

const renderWithRouter = (component: React.ReactElement, initialEntries?: string[]) => {
  if (initialEntries) {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        {component}
      </MemoryRouter>
    )
  }
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Navbar Component', () => {
  it('should render logo and brand name', () => {
    renderWithRouter(<Navbar />)
    
    expect(screen.getByText('CourtBook')).toBeInTheDocument()
    // Calendar icon should be present (though we can't easily test the icon itself)
    const logoLink = screen.getByRole('link', { name: /courtbook/i })
    expect(logoLink).toHaveAttribute('href', '/')
  })
  
  it('should render navigation links', () => {
    renderWithRouter(<Navbar />)
    
    const courtsLink = screen.getByRole('link', { name: /courts/i })
    expect(courtsLink).toBeInTheDocument()
    expect(courtsLink).toHaveAttribute('href', '/')
  })
  
  it('should highlight active route', () => {
    renderWithRouter(<Navbar />, ['/'])
    
    const courtsLink = screen.getByRole('link', { name: /courts/i })
    expect(courtsLink).toHaveClass('bg-primary', 'text-white')
  })
  
  it('should not highlight inactive route', () => {
    renderWithRouter(<Navbar />, ['/book/1'])
    
    const courtsLink = screen.getByRole('link', { name: /courts/i })
    expect(courtsLink).not.toHaveClass('bg-primary', 'text-white')
    expect(courtsLink).toHaveClass('text-muted')
  })
  
  it('should have proper navigation structure', () => {
    renderWithRouter(<Navbar />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    
    // Should have container with proper flex layout
    const container = nav.querySelector('.container')
    expect(container).toBeInTheDocument()
    
    // Should have flex items with proper spacing
    const flexContainer = container?.querySelector('.flex.items-center.justify-between')
    expect(flexContainer).toBeInTheDocument()
  })
  
  it('should have proper accessibility attributes', () => {
    renderWithRouter(<Navbar />)
    
    const logoLink = screen.getByRole('link', { name: /courtbook/i })
    expect(logoLink).toBeInTheDocument()
    
    const courtsLink = screen.getByRole('link', { name: /courts/i })
    expect(courtsLink).toBeInTheDocument()
  })
  
  it('should apply hover styles correctly', () => {
    renderWithRouter(<Navbar />, ['/book/1'])
    
    const courtsLink = screen.getByRole('link', { name: /courts/i })
    expect(courtsLink).toHaveClass('hover:text-foreground', 'hover:bg-gray-100')
  })
})