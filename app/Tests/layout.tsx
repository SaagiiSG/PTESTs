import React from 'react'
import Navbar from '@/components/navbar';

interface ProfileLayoutProps {
    children: React.ReactNode;
  }

const layout = ({ children }: ProfileLayoutProps) => {
  return (
    <div className='w-full flex flex-col items-center justify-center pt-8'>
        <div className='w-[87vw]'>
            <Navbar />    
            {children}
        </div>
    </div>
  )
}

export default layout
