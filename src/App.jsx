import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Anasayfa from './pages/Anasayfa'
import AdminPanel from './pages/AdminPanel'
import TumUstalar from './pages/TumUstalar'
import GirisYap from './pages/GirisYap'
import HesapOlustur from './pages/HesapOlustur'
import ProfilDuzenle from './pages/ProfilDuzenle'

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/giris" element={<GirisYap />} />
        <Route path="/hesap-olustur" element={<HesapOlustur />} />
        <Route path="/ustalar" element={<TumUstalar />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/profilim" element={<ProfilDuzenle />} />
        <Route path="/" element={<Anasayfa />} />
        <Route path="/kayit-ol" element={<Navigate to="/hesap-olustur?rol=yazilimci" replace />} />
        <Route path="/is-ver" element={<Navigate to="/hesap-olustur?rol=is-veren" replace />} />
      </Routes>
    </div>
  )
}

export default App
