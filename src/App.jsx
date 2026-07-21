import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Anasayfa from './pages/Anasayfa'
import KayitOl from './pages/KayitOl'

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Anasayfa />} />
        <Route path="/kayit-ol" element={<KayitOl />} />
      </Routes>
    </div>
  )
}

export default App
