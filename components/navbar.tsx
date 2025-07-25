import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'
import logo from "@/public/PPNIM-logo-colered.svg" 
import { Home, BookOpen, GraduationCap, User } from 'lucide-react';

const navbar = () => {
  return (
    <div className='fixed bottom-0 left-0 w-full h-20 z-50 bg-[#fafafa]/95 backdrop-blur-[6px] flex justify-between items-center py-1 px-1 border-t border-gray-200 shadow-sm sm:sticky sm:top-0 sm:bottom-auto sm:py-3 sm:px-6 sm:rounded-3xl sm:border-t-0 sm:border-b sm:shadow-md'>
      <Link href={"/home"} className="hidden sm:block">
        <Image
          src={logo}
          alt="PPNIM Logo"
          width={80}
          height={40}
          className="cursor-pointer"
        /> 
      </Link>
      <div className='flex gap-1 w-full justify-evenly sm:justify-end'>
        <Button asChild variant={'ghost'} className='h-20 flex-1 sm:h-full sm:flex-initial p-1 sm:p-2'>
          <Link href={"/home"} className='h-full flex flex-col items-center justify-center gap-0.5 text-md'>
            <span className="text-5xl sm:text-2xl flex items-center justify-center"><Home className="w-14 h-14 sm:w-6 sm:h-6" /></span>
            <span className="hidden sm:inline text-xs">Home</span>
          </Link>
        </Button>
        <Button asChild variant={'ghost'} className='h-20 flex-1 sm:h-full sm:flex-initial p-1 sm:p-2'>
          <Link href={"/Tests"} className='h-full flex flex-col items-center justify-center gap-0.5 text-md'>
            <span className="text-5xl sm:text-2xl flex items-center justify-center"><BookOpen className="w-14 h-14 sm:w-6 sm:h-6" /></span>
            <span className="hidden sm:inline text-xs">Tests</span>
          </Link>
        </Button>
        <Button asChild variant={'ghost'} className='h-20 flex-1 sm:h-full sm:flex-initial p-1 sm:p-2'>
          <Link href={"/Course"} className='h-full flex flex-col items-center justify-center gap-0.5 text-md'>
            <span className="text-5xl sm:text-2xl flex items-center justify-center"><GraduationCap className="w-14 h-14 sm:w-6 sm:h-6" /></span>
            <span className="hidden sm:inline text-xs">Courses</span>
          </Link>
        </Button>
        <Button asChild variant={'ghost'} className='h-20 flex-1 sm:h-full sm:flex-initial p-1 sm:p-2'>
          <Link href={"/profile"} className='h-full flex flex-col items-center justify-center gap-0.5 text-md'>
            <span className="text-5xl sm:text-2xl flex items-center justify-center"><User className="w-14 h-14 sm:w-6 sm:h-6" /></span>
            <span className="hidden sm:inline text-xs">Profile</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default navbar
