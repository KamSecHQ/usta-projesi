import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Anasayfa from './pages/Anasayfa'
import AdminPanel from './pages/AdminPanel'
import TumUstalar from './pages/TumUstalar'
import GirisYap from './pages/GirisYap'
import HesapOlustur from './pages/HesapOlustur'
import ProfilDuzenle from './pages/ProfilDuzenle'
import UstaProfili from './pages/UstaProfili'
import GizlilikPolitikasi from './pages/GizlilikPolitikasi'
import SayfaBulunamadi from './pages/SayfaBulunamadi'
import Ayarlar from './pages/Ayarlar'
import Favorilerim from './pages/Favorilerim'

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/giris" element={<GirisYap />} />
        <Route path="/hesap-olustur" element={<HesapOlustur />} />
        <Route path="/ustalar" element={<TumUstalar />} />
        <Route path="/ustalar/:id" element={<UstaProfili />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/profilim" element={<ProfilDuzenle />} />
        <Route path="/gizlilik" element={<GizlilikPolitikasi />} />
        <Route path="/ayarlar" element={<Ayarlar />} />
        <Route path="/favorilerim" element={<Favorilerim />} />
        <Route path="/" element={<Anasayfa />} />
        <Route path="/kayit-ol" element={<Navigate to="/hesap-olustur?rol=yazilimci" replace />} />
        <Route path="/is-ver" element={<Navigate to="/hesap-olustur?rol=is-veren" replace />} />
        <Route path="*" element={<SayfaBulunamadi />} />
      </Routes>
    </div>
  )
}

export default App
