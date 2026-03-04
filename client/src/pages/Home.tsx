"use client"

import React, { useState, useEffect } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import CourtCard from '../components/CourtCard'
import { getCourts } from '../api/courts'
import type { Court } from '../types'

function Home(): JSX.Element {
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourts = async (): Promise<void> => {
      try {
        setLoading(true)
        setError(null)
        const data = await getCourts()
        setCourts(data)
      } catch (err) {
        console.error('Failed to fetch courts:', err)
        setError('Failed to load courts. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourts()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading courts...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Available Tennis Courts</h1>
        <p className="text-muted">Book your perfect court for your next game</p>
      </div>
      
      {courts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted text-lg">No courts available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court) => (
            <CourtCard key={court.id} court={court} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Home