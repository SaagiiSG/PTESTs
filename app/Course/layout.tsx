import React from 'react'
import Navbar from '../../components/navbar'

const layout = ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) => {
  return (
    <section className='flex flex-col items-center pt-8'>
      <div className='w-[87vw]'>
          <Navbar />

        {children}
      </div>
    </section>
  )
}

export default layout
