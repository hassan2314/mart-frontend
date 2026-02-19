import Footer from './components/Footer/Footer'
import Navbar from './components/Header/Navbar'
import { Outlet, useLocation } from 'react-router-dom'

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <Outlet />
      {!isAdminRoute && <Footer />}
    </>
  )
}

export default App
