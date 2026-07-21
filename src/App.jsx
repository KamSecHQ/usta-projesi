import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Anasayfa from './pages/Anasayfa'
import KayitOl from './pages/KayitOl'
import IsVer from './pages/IsVer'
import AdminPanel from './pages/AdminPanel'
// ...



function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/" element={<Anasayfa />} />
        <Route path="/kayit-ol" element={<KayitOl />} />
        <Route path="/is-ver" element={<IsVer />} />
      </Routes>
    </div>
  )
}

export default App
