import React from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

const page = () => {
  return (
    <>
    <Sidebar/>
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <h1 className="text-xl md:text-2xl font-bold text-center">Welcome To Executive Dashboard</h1>
    </div>
    </>
  )
}

export default page