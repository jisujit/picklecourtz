import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CourtCard from '../components/CourtCard'
import type { Court } from '@shared/schema'

const mockCourt: Court = {
  id: 1,
  name: 'Test Court',
  description: 'A test court for testing',
  hourlyRate: '45.00',
  capacity: 4,
  amenities: ['Air Conditioning', 'Professional Lighting'],
  isActive: true,
  imageUrl: 'https://example.com/court.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('CourtCard', () => {
  it('renders court information correctly', () => {
    const mockOnBook = vi.fn()
    
    render(<CourtCard court={mockCourt} onBook={mockOnBook} />)
    
    expect(screen.getByText('Test Court')).toBeInTheDocument()
    expect(screen.getByText('A test court for testing')).toBeInTheDocument()
    expect(screen.getByText('$45.00/hour')).toBeInTheDocument()
    expect(screen.getByText('Capacity: 4 players')).toBeInTheDocument()
    expect(screen.getByText('Air Conditioning, Professional Lighting')).toBeInTheDocument()
  })

  it('calls onBook when Book Now button is clicked', () => {
    const mockOnBook = vi.fn()
    
    render(<CourtCard court={mockCourt} onBook={mockOnBook} />)
    
    const bookButton = screen.getByText('Book Now')
    fireEvent.click(bookButton)
    
    expect(mockOnBook).toHaveBeenCalledWith(mockCourt)
  })

  it('disables booking for inactive courts', () => {
    const inactiveCourt = { ...mockCourt, isActive: false }
    const mockOnBook = vi.fn()
    
    render(<CourtCard court={inactiveCourt} onBook={mockOnBook} />)
    
    const bookButton = screen.getByText('Currently Unavailable')
    expect(bookButton).toBeDisabled()
  })
})