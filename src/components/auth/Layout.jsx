import React from 'react'
import { Outlet } from 'react-router-dom'
import { Button } from '../ui/button';

const AuthLayout = () => {
  return (
    <div className='flex w-full min-h-screen '>
      <div className='hidden lg:flex items-center justify-center bg-black w-1/2 px-12'>
      <div className='max-w-md text-center text-primary-foreground space-y-6'>
        <h1 className='text-4xl font-extrobold tracking-tight'>Welcome to E-commerce Shopping</h1>
        {/* <Button variant='secondary'>button</Button> */}
      </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12  sm:px-6 lg:px-8">
        <Outlet/>
      </div>
    </div>
  )
}

export default AuthLayout;
