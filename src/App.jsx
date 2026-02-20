import React, { Suspense } from 'react'
import Footer from './components/Footer/Footer'
import Navbar from './components/Header/Navbar'
import { Outlet, useLocation } from 'react-router-dom'

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-slate-500">Loading...</div>
        </div>
      }>
        <Outlet />
      </Suspense>
      {!isAdminRoute && <Footer />}
    </>
  )
}

export default App
