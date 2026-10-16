import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '@fontsource-variable/plus-jakarta-sans'
import './videoHero.css'
import { useAuth } from '../AuthContext'

const VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_104036_bd6924f6-3c8e-417e-8465-6d03c8c2e9e6.mp4'
const POSTER = 'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/82e7eb75-c65f-490a-99b5-f3d1cad54200.webp'
const GECIS = 0.9 // döngü noktasındaki çapraz geçiş süresi (sn)

const LINKLER = [
    { ad: 'Ustalar', to: '/ustalar' },
    { ad: 'İş İlanları', to: '/is-ilanlari' },
    { ad: 'Nasıl Çalışır', to: '/#surec', bolum: 'surec' },
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

function NavLink({ link, onClick }) {
    // Sayfa içi bölümlere yumuşak kaydırma; diğerleri normal yönlendirme
    if (link.bolum) {
        return (
            <a
                href={link.to}
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
        <Link to={link.to} onClick={onClick}>
            {link.ad}
        </Link>
    )
}

export default function VideoHero({ onHazir }) {
    const { user } = useAuth()
    const [azalt] = useState(hareketAzaltilsinMi)
    // Giriş sahnesi: .anim oyuncuları sahne dışında tutar, .go sahneyi başlatır, bitince ikisi de kalkar
    const [anim, setAnim] = useState(!azalt)
    const [go, setGo] = useState(false)
    const [menuAcik, setMenuAcik] = useState(false)
    const videoA = useRef(null)
    const videoB = useRef(null)
    const burger = useRef(null)
    const menu = useRef(null)
    const hazirBildirildi = useRef(false)

    function hazir() {
        if (hazirBildirildi.current) return
        hazirBildirildi.current = true
        onHazir?.()
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

    // ---- C) Arka plan videosu: iki kopya döngü noktasında çapraz geçer, kıta atlaması görünmez ----
    useEffect(() => {
        const A = videoA.current
        const B = videoB.current
        if (!A || !B) return

        if (azalt) {
            A.removeAttribute('autoplay')
            A.pause()
            B.pause()
            try {
                A.currentTime = 0
            } catch {
                // bazı tarayıcılar meta veri gelmeden konum ayarına izin vermez
            }
            return
        }

        const oynat = (v) => {
            const p = v.play()
            if (p && p.catch) p.catch(() => {})
        }
        let simdiki = A
        let sonraki = B
        let geciste = false
        let zamanlayici
        oynat(A)

        const tik = () => {
            if (geciste || !simdiki.duration) return
            if (simdiki.duration - simdiki.currentTime > GECIS) return
            geciste = true
            const cikan = simdiki
            sonraki.currentTime = 0
            oynat(sonraki)
            sonraki.classList.add('is-active')
            cikan.classList.remove('is-active')
            simdiki = sonraki
            sonraki = cikan
            zamanlayici = setTimeout(() => {
                cikan.pause()
                cikan.currentTime = 0
                geciste = false
            }, GECIS * 1000 + 100)
        }
        A.addEventListener('timeupdate', tik)
        B.addEventListener('timeupdate', tik)

        // Hero ekrandan çıkınca video duraklar: 1080p çözümleme arka planda boşuna çalışmaz
        const kok = A.closest('.vhero')
        const g = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) oynat(simdiki)
            else {
                A.pause()
                B.pause()
            }
        })
        if (kok) g.observe(kok)

        return () => {
            A.removeEventListener('timeupdate', tik)
            B.removeEventListener('timeupdate', tik)
            clearTimeout(zamanlayici)
            g.disconnect()
        }
    }, [azalt])

    const menuKapat = () => setMenuAcik(false)

    return (
        <main className={`vhero ${anim ? 'anim' : ''} ${go ? 'go' : ''}`} onAnimationEnd={animasyonBitti} id="giris">
            <div
                className="bg"
                role="img"
                aria-label="Yıldızlı bir gökyüzünde, mor nokta matrisiyle çizilmiş, yavaşça dönen Dünya küresi"
            >
                <video
                    ref={videoA}
                    className="bg-video is-active"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    disablePictureInPicture
                    aria-hidden="true"
                    poster={POSTER}
                    onLoadedData={hazir}
                    onError={hazir}
                >
                    <source src={VIDEO} type="video/mp4" />
                </video>
                {/* İkinci kopya yalnızca döngü noktasında gerekir; o ana kadar ilki dosyayı önbelleğe almış olur */}
                <video
                    ref={videoB}
                    className="bg-video"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    disablePictureInPicture
                    aria-hidden="true"
                    poster={POSTER}
                >
                    <source src={VIDEO} type="video/mp4" />
                </video>
            </div>

            <header className="nav">
                <Link to="/" className="logo">
                    Kalfahane
                </Link>
                <nav className="nav-links" aria-label="Ana menü">
                    {LINKLER.map((l) => (
                        <NavLink key={l.ad} link={l} />
                    ))}
                </nav>
                <div className="nav-actions">
                    {user ? (
                        <>
                            <Link to="/profilim" className="btn btn-login">
                                Profilim
                            </Link>
                            <Link to="/panel" className="btn btn-nav-start">
                                Panelim <Ok />
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/giris" className="btn btn-login">
                                Giriş Yap
                            </Link>
                            <Link to="/hesap-olustur" className="btn btn-nav-start">
                                Hesap Oluştur <Ok />
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
                            Giriş Yap
                        </Link>
                        <Link to="/hesap-olustur" className="m-start" onClick={menuKapat}>
                            Hesap Oluştur <Ok />
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
                <div className="ctas">
                    <Link to="/hesap-olustur?rol=yazilimci" className="btn btn-lg btn-primary">
                        Yazılımcı olarak katıl <Ok />
                    </Link>
                    <Link to="/hesap-olustur?rol=is-veren" className="btn btn-lg btn-ghost">
                        İş vermek istiyorum <Ok />
                    </Link>
                </div>
            </div>
        </main>
    )
}
