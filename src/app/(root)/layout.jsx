import { onBoardUser } from '@/modules/auth/actions'
import Navbar from '@/modules/home/components/navbar'
import React from 'react'

const Layout = async ({ children }) => {
  await onBoardUser()
  return (
   
    <main className="flex flex-col items-center justify-center min-h-screen relative overflow-x-hidden">
      <Navbar/>
      <div className="fixed inset-0 -z-10 h-full w-full bg-background 
      dark:bg-[radial-gradient(#393e4a,transparent_1px)]
      bg-[radial-gradient(#3dadde2_1px,transparent_1px)]
      [background-size:16px_16px]" />

      <div className="flex w-full justify-center">
        {children}
      </div>

    </main>
  )
}

export default Layout;