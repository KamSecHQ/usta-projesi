import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Yukleyici from './components/hareket/Yukleyici'
import BasaDon from './components/BasaDon'
import UygulamaHatasi from './components/UygulamaHatasi'

// Her sayfa kendi parçasında: ilk açılışta yalnızca girilen sayfanın kodu iner.
// Anasayfa 3D atölyeyi (three.js) taşır; diğer sayfalar bu yükü hiç indirmez.
const Anasayfa = lazy(() => import('./pages/Anasayfa'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))
const TumUstalar = lazy(() => import('./pages/TumUstalar'))
const GirisYap = lazy(() => import('./pages/GirisYap'))
const HesapOlustur = lazy(() => import('./pages/HesapOlustur'))
const SifreYenile = lazy(() => import('./pages/SifreYenile'))
const ProfilDuzenle = lazy(() => import('./pages/ProfilDuzenle'))
const UstaProfili = lazy(() => import('./pages/UstaProfili'))
const GizlilikPolitikasi = lazy(() => import('./pages/GizlilikPolitikasi'))
const SayfaBulunamadi = lazy(() => import('./pages/SayfaBulunamadi'))
const Ayarlar = lazy(() => import('./pages/Ayarlar'))
const Favorilerim = lazy(() => import('./pages/Favorilerim'))
const ProjeDetay = lazy(() => import('./pages/ProjeDetay'))
const IsIlanlari = lazy(() => import('./pages/IsIlanlari'))
const IlanVer = lazy(() => import('./pages/IlanVer'))
const IlanDetay = lazy(() => import('./pages/IlanDetay'))
const Ilanlarim = lazy(() => import('./pages/Ilanlarim'))
const Tekliflerim = lazy(() => import('./pages/Tekliflerim'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AjansYonetimi = lazy(() => import('./pages/AjansYonetimi'))
const BlogListesi = lazy(() => import('./pages/BlogListesi'))
const BlogYazisi = lazy(() => import('./pages/BlogYazisi'))
const AdminBlog = lazy(() => import('./pages/AdminBlog'))
const Mesajlar = lazy(() => import('./pages/Mesajlar'))

// İç sayfa yüklenirken: sayfa siyah kalır, üstte ince bir mor ışık akar
function SayfaYukleniyor() {
    return (
        <div className="min-h-screen bg-black" role="status" aria-label="Sayfa yükleniyor">
            <div className="sayfa-yukleniyor fixed inset-x-0 top-0 z-[60] h-[2px] overflow-hidden" aria-hidden>
                <span />
            </div>
        </div>
    )
}

function App() {
    const { pathname } = useLocation()
    return (
        <div>
            <a href="#icerik" className="icerige-gec">
                İçeriğe geç
            </a>
            <BasaDon />
            <Navbar />
            <div id="icerik" tabIndex={-1} className="outline-none">
                <UygulamaHatasi konum={pathname}>
                    <Suspense fallback={<SayfaYukleniyor />}>
                        <Routes>
                            <Route path="/giris" element={<GirisYap />} />
                            <Route path="/hesap-olustur" element={<HesapOlustur />} />
                            <Route path="/sifre-yenile" element={<SifreYenile />} />
                            <Route path="/ustalar" element={<TumUstalar />} />
                            <Route path="/ustalar/:id" element={<UstaProfili />} />
                            <Route path="/admin" element={<AdminPanel />} />
                            <Route path="/admin/blog" element={<AdminBlog />} />
                            <Route path="/profilim" element={<ProfilDuzenle />} />
                            <Route path="/gizlilik" element={<GizlilikPolitikasi />} />
                            <Route path="/ayarlar" element={<Ayarlar />} />
                            <Route path="/favorilerim" element={<Favorilerim />} />
                            <Route path="/proje/:id" element={<ProjeDetay />} />
                            <Route path="/is-ilanlari" element={<IsIlanlari />} />
                            <Route path="/is-ilanlari/:id" element={<IlanDetay />} />
                            <Route path="/ilan-ver" element={<IlanVer />} />
                            <Route path="/ilanlarim" element={<Ilanlarim />} />
                            <Route path="/tekliflerim" element={<Tekliflerim />} />
                            <Route path="/panel" element={<Dashboard />} />
                            <Route path="/mesajlar/:id?" element={<Mesajlar />} />
                            <Route path="/ajansim" element={<AjansYonetimi />} />
                            <Route path="/blog" element={<BlogListesi />} />
                            <Route path="/blog/:slug" element={<BlogYazisi />} />
                            <Route path="/" element={<Suspense fallback={<Yukleyici hedef={55} />}><Anasayfa /></Suspense>} />
                            <Route path="/kayit-ol" element={<Navigate to="/hesap-olustur?rol=yazilimci" replace />} />
                            <Route path="/is-ver" element={<Navigate to="/hesap-olustur?rol=is-veren" replace />} />
                            <Route path="*" element={<SayfaBulunamadi />} />
                        </Routes>
                    </Suspense>
                </UygulamaHatasi>
            </div>
        </div>
    )
}

export default App
