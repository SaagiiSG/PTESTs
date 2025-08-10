import React from 'react'
import Navbar from '../../components/navbar'

const layout = ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) => {
  return (
    <section className='flex flex-col items-center pt-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='w-[100vw] flex flex-col items-center justify-center md:w-[87vw]'>
          <Navbar />
          <div className='w-[96%] md:w-[100%] flex flex-col items-center justify-center'>

        {children}
        </div>
      </div>
    </section>
  )
}

export default layout
