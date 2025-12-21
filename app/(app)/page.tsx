import connectDB from '@/lib/config/db'
import React from 'react'

async function HomePage() {
    await connectDB();
  return (
    <div className=''>HomePage</div>
  )
}

export default HomePage