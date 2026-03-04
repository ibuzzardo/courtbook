import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock, DollarSign } from 'lucide-react'
import type { Court } from '../types'

interface CourtCardProps {
  court: Court
}

function CourtCard({ court }: CourtCardProps): JSX.Element {
  const getCourtTypeColor = (type: string): string => {
    switch (type) {
      case 'clay':
        return 'bg-orange-100 text-orange-800'
      case 'grass':
        return 'bg-green-100 text-green-800'
      case 'hard':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">{court.name}</h3>
          <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${getCourtTypeColor(court.type)}`}>
            {court.type.charAt(0).toUpperCase() + court.type.slice(1)} Court
          </span>
        </div>
        <div className={`px-2 py-1 rounded-md text-xs font-medium ${
          court.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {court.available ? 'Available' : 'Unavailable'}
        </div>
      </div>
      
      {court.description && (
        <p className="text-muted text-sm mb-3">{court.description}</p>
      )}
      
      <div className="flex items-center space-x-4 mb-4 text-sm text-muted">
        <div className="flex items-center space-x-1">
          <DollarSign className="h-4 w-4" />
          <span>${court.hourlyRate}/hour</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4" />
          <span>1-2 hour slots</span>
        </div>
      </div>
      
      <div className="flex justify-end">
        {court.available ? (
          <Link
            to={`/book/${court.id}`}
            className="btn"
          >
            Book Now
          </Link>
        ) : (
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
          >
            Unavailable
          </button>
        )}
      </div>
    </div>
  )
}

export default CourtCard