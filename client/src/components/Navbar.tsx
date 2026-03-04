import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Calendar, Home } from 'lucide-react'

function Navbar(): JSX.Element {
  const location = useLocation()

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">CourtBook</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-primary text-white'
                  : 'text-muted hover:text-foreground hover:bg-gray-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Courts</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar