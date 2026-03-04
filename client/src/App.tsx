import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import BookCourt from './pages/BookCourt'

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book/:courtId" element={<BookCourt />} />
        </Routes>
      </main>
    </div>
  )
}

export default App