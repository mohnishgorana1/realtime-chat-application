import React from 'react'
import { SignUp } from '@clerk/nextjs'

function SignUpPage() {
  return (
    <main className='w-full  h-[100vh] my-auto flex items-center justify-center'>
      <SignUp />
    </main>
  )
}

export default SignUpPage