import React from 'react'
import { Outlet } from 'react-router-dom';
import ShoppingHeader from './header';

const ShoppingLayout = () => {
  return (
    <div className='flex flex-col bg-white over-flow-hidden'>
      <ShoppingHeader/>
      <main>
        <Outlet/>
      </main>
    </div>
  )
}

export default ShoppingLayout;
