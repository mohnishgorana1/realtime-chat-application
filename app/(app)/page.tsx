import HomeClient from '@/components/HomeClient';
import connectDB from '@/lib/config/db'
import React from 'react'

async function HomePage() {
    await connectDB();
  return (
    <main className="min-h-screen bg-background text-foreground">
      <HomeClient />
    </main>
    
  )
}

export default HomePage