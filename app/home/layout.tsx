import React from 'react'
import Navbar from '../../components/navbar'

const layout = ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) => {
  return (
    <section className='flex flex-col items-center pt-4 sm:pt-8'>
      <div className='w-[95vw] sm:w-[87vw]'>
          <Navbar />

        {children}
      </div>
    </section>
  )
}

export default layout
