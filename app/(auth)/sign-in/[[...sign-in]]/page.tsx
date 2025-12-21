import { SignIn } from '@clerk/nextjs'
import React from 'react'

function SignInPage() {
  return (
    <main className='w-full h-[100vh] flex items-center justify-center my-auto'>
      <SignIn />
    </main>
  )
}

export default SignInPage