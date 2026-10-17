import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { View } from '@react-three/drei'
import '@fontsource-variable/plus-jakarta-sans'
import './videoHero.css'
import './gezinme.css'
import { useAuth } from '../AuthContext'
import { useProfilRolu, uyeEylemleri } from '../profilRolu'
import DunyaKuresi from './atolye/DunyaKuresi'
import Isitici from './atolye/Isitici'
import kurePoster from '../assets/kure-poster.webp'
import { rayOlaylari } from './navVurgu'

// Hero'nun arka planı canlı WebGL küre (atolye/DunyaKuresi.jsx). Eski 38 MB'lık video ve onun
// dış kaynaklı posteri kalktı; tuval hazır olana kadar küre sahnesinin kendi kaydı olan poster
// görünür. Dosya adı tarihsel: bileşen artık video oynatmıyor.
// Poster: ?kure=poster modunda alınan 1920×1200 kare (cwebp -q 82). Küre değişirse yeniden üretilir.
const POSTER = kurePoster

// Yalnızca geliştirmede: ?kure=poster ile zaman donar, arayüz gizlenir (poster kaydı için)
const POSTER_KAYDI = import.meta.env.DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('kure') === 'poster'

const LINKLER = [
    { ad: 'Ustalar', to: '/ustalar' },
    { ad: 'İş ilanları', to: '/is-ilanlari' },
    { ad: 'Nasıl çalışır', to: '/#surec', bolum: 'surec' },
    { ad: 'Neden Kalfahane', to: '/#neden', bolum: 'neden' },
    { ad: 'Blog', to: '/blog' },
]

function Ok() {
    return (
        <svg className="arw" viewBox="0 0 12 10" fill="none" aria-hidden="true">
            <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function hareketAzaltilsinMi() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function NavLink({ link, onClick, className }) {
    // Sayfa içi bölümlere yumuşak kaydırma; diğerleri normal yönlendirme
    if (link.bolum) {
        return (
            <a
                href={link.to}
                className={className}
                onClick={(e) => {
                    e.preventDefault()
                    onClick?.()
                    document.getElementById(link.bolum)?.scrollIntoView({ behavior: 'smooth' })
                }}
            >
                {link.ad}
            </a>
        )
    }
    return (
        <Link to={link.to} onClick={onClick} className={className}>
            {link.ad}
        </Link>
    )
}

// Ziyaretçiye kayıt daveti; üyeye rolüne göre sıradaki adım (profilRolu.js)
const ZIYARETCI_EYLEMLERI = [
    { ad: 'Yazılımcı olarak katıl', to: '/hesap-olustur?rol=yazilimci' },
    { ad: 'İş vermek istiyorum', to: '/hesap-olustur?rol=is-veren' },
]

export default function VideoHero({ onHazir }) {
    const { user } = useAuth()
    const { girisli, rol, hazir: rolHazir } = useProfilRolu()
    const [birincilEylem, ikincilEylem] = girisli ? uyeEylemleri(rol) : ZIYARETCI_EYLEMLERI
    const [azalt] = useState(hareketAzaltilsinMi)
    // Giriş sahnesi: .anim oyuncuları sahne dışında tutar, .go sahneyi başlatır, bitince ikisi de kalkar
    const [anim, setAnim] = useState(!azalt)
    const [go, setGo] = useState(false)
    const [menuAcik, setMenuAcik] = useState(false)
    const kok = useRef(null)
    const burger = useRef(null)
    const menu = useRef(null)
    const hazirBildirildi = useRef(false)
    // Poster yüklenemezse (ya da hiç yoksa) CSS yedeğine düşülür; canlı küre çizilince poster söner
    const [posterYok, setPosterYok] = useState(!POSTER)
    const [kureCizildi, setKureCizildi] = useState(false)

    function hazir() {
        if (hazirBildirildi.current) return
        hazirBildirildi.current = true
        onHazir?.()
    }

    function posterHatasi() {
        setPosterYok(true)
        hazir()
    }

    function kureIlkKare() {
        setKureCizildi(true)
        hazir()
    }

    // ---- A) Giriş sahnesi: yükleme perdesi kalkınca ve yazı tipleri hazırken başlar ----
    useEffect(() => {
        if (azalt) return
        let basladi = false
        let tavan
        let emniyet
        const baslat = () => {
            if (basladi) return
            basladi = true
            clearTimeout(tavan)
            setGo(true)
            emniyet = setTimeout(temizle, 2600)
        }
        const temizle = () => {
            clearTimeout(emniyet)
            setAnim(false)
            setGo(false)
        }
        const perdeSonrasi = () => {
            tavan = setTimeout(baslat, 900)
            if (document.fonts?.ready) document.fonts.ready.then(baslat, baslat)
            else baslat()
        }
        if (window.__perdeKalkti) perdeSonrasi()
        else window.addEventListener('perde-kalkti', perdeSonrasi, { once: true })
        return () => {
            window.removeEventListener('perde-kalkti', perdeSonrasi)
            clearTimeout(tavan)
            clearTimeout(emniyet)
        }
    }, [azalt])

    // Zaman çizelgesinin son oyuncusu ikincil CTA; onun animasyonu bitince sahne kendini söker
    function animasyonBitti(e) {
        if (e.animationName === 'vh-pillIn' && e.target.classList.contains('btn-ghost')) {
            setAnim(false)
            setGo(false)
        }
    }

    // ---- B) Mobil menü ----
    useEffect(() => {
        if (!menuAcik) return
        const disari = (e) => {
            if (!menu.current?.contains(e.target) && !burger.current?.contains(e.target)) setMenuAcik(false)
        }
        const esc = (e) => {
            if (e.key === 'Escape') {
                setMenuAcik(false)
                burger.current?.focus()
            }
        }
        document.addEventListener('click', disari)
        document.addEventListener('keydown', esc)
        return () => {
            document.removeEventListener('click', disari)
            document.removeEventListener('keydown', esc)
        }
    }, [menuAcik])

    // ---- C) Hero ekrandan çıkınca düğmedeki yörünge ışığı durur ----
    useEffect(() => {
        const el = kok.current
        if (!el) return
        const g = new IntersectionObserver(([e]) => el.classList.toggle('isik-durdu', !e.isIntersecting))
        g.observe(el)
        return () => g.disconnect()
    }, [])

    const menuKapat = () => setMenuAcik(false)

    return (
        <main ref={kok} className={`vhero ${anim ? 'anim' : ''} ${go ? 'go' : ''} ${POSTER_KAYDI ? 'kure-kaydi' : ''}`} onAnimationEnd={animasyonBitti} id="giris">
            <div
                className={`bg ${posterYok ? 'poster-yok' : ''}`}
                role="img"
                aria-label="Yıldızlı bir gökyüzünde, kıtaları mor noktalarla çizilmiş, yavaşça dönen Dünya küresi; İstanbul'dan dünyaya ışık çizgileri uzanıyor"
            >
                {POSTER && !posterYok && (
                    <img
                        className={`bg-video bg-poster ${kureCizildi ? 'soldu' : ''}`}
                        src={POSTER}
                        alt=""
                        aria-hidden="true"
                        decoding="async"
                        fetchPriority="high"
                        onLoad={hazir}
                        onError={posterHatasi}
                    />
                )}
            </div>

            {/* Canlı küre: paylaşılan 3D tuvaline bu kutunun yerine çizilir */}
            <div data-3d className="bg-kure" aria-hidden="true">
                <View className="absolute inset-0">
                    <DunyaKuresi azalt={azalt} donuk={POSTER_KAYDI} onIlkKare={kureIlkKare} />
                    <Isitici />
                </View>
            </div>

            <header className="nav">
                <Link to="/" className="logo">
                    Kalfahane
                </Link>
                <nav className="nav-links nav-ray" aria-label="Ana menü" {...rayOlaylari}>
                    {LINKLER.map((l) => (
                        <NavLink key={l.ad} link={l} className="nav-hap" />
                    ))}
                    <span className="nav-ray-vurgu" aria-hidden="true" />
                </nav>
                <div className="nav-actions">
                    {user ? (
                        <>
                            <Link to="/profilim" className="btn btn-login isik-hap">
                                Profilim
                            </Link>
                            <Link to="/panel" className="btn btn-nav-start isik-hap isik-hap-birincil">
                                Panelim <Ok />
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/giris" className="btn btn-login isik-hap">
                                Giriş yap
                            </Link>
                            <Link to="/hesap-olustur" className="btn btn-nav-start isik-hap isik-hap-birincil">
                                Hesap oluştur <Ok />
                            </Link>
                        </>
                    )}
                </div>
                <button
                    ref={burger}
                    className="burger"
                    aria-label={menuAcik ? 'Menüyü kapat' : 'Menüyü aç'}
                    aria-expanded={menuAcik}
                    aria-controls="vhero-menu"
                    onClick={(e) => {
                        e.stopPropagation()
                        setMenuAcik((a) => !a)
                    }}
                >
                    <span />
                </button>
            </header>

            <nav ref={menu} className={`menu ${menuAcik ? 'open' : ''}`} id="vhero-menu" aria-label="Mobil menü">
                {LINKLER.map((l) => (
                    <NavLink key={l.ad} link={l} onClick={menuKapat} />
                ))}
                <div className="divider" />
                {user ? (
                    <>
                        <Link to="/profilim" onClick={menuKapat}>
                            Profilim
                        </Link>
                        <Link to="/panel" className="m-start" onClick={menuKapat}>
                            Panelim <Ok />
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/giris" onClick={menuKapat}>
                            Giriş yap
                        </Link>
                        <Link to="/hesap-olustur" className="m-start" onClick={menuKapat}>
                            Hesap oluştur <Ok />
                        </Link>
                    </>
                )}
            </nav>

            <div className="hero-inner">
                <h1>
                    <span className="ln">
                        <span className="ln-i">İşini emin ellere</span>
                    </span>
                    <span className="ln">
                        <span className="ln-i">teslim et.</span>
                    </span>
                </h1>
                <p className="sub">
                    Doğrulanmış Türk yazılımcılarla işletmeleri buluşturan çarşı.{' '}
                    <br />
                    Portföyleri incele, teklif topla, işini doğru ustaya ver;{' '}
                    <br />
                    kıdem burada satın alınmaz, tamamlanan her işle kazanılır.
                </p>
                {/* Rol gelene kadar yer tutulur ama görünmez: ziyaretçi daveti üyeye bir an bile görünmez */}
                <div className="ctas" style={rolHazir ? undefined : { visibility: 'hidden' }}>
                    <Link to={birincilEylem.to} className="btn btn-lg btn-primary isik-hap isik-hap-birincil isik-hap-yorunge">
                        <span className="isik-yorunge" aria-hidden="true" />
                        {birincilEylem.ad} <Ok />
                    </Link>
                    <Link to={ikincilEylem.to} className="btn btn-lg btn-ghost isik-hap">
                        {ikincilEylem.ad} <Ok />
                    </Link>
                </div>
            </div>
        </main>
    )
}
