import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AramaPaleti from './AramaPaleti'
import DuyuruCubugu from './DuyuruCubugu'
import { kidemRozetiHesapla, tamamlananIsSayisiGetir } from '../ustaYardimcilari'
import { useOkunmamis } from '../mesajlasma'
import MesajBildirimi from './MesajBildirimi'


function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad.split(" ").filter(Boolean).slice(0, 2).map((k) => k[0].toUpperCase()).join("")
}

function Navbar() {
    const [menuAcik, setMenuAcik] = useState(false)
    const [hesapMenuAcik, setHesapMenuAcik] = useState(false)
    const [kesfetMenuAcik, setKesfetMenuAcik] = useState(false)
    const [olusturMenuAcik, setOlusturMenuAcik] = useState(false)
    const [aramaAcik, setAramaAcik] = useState(false)
    const [kaydirildi, setKaydirildi] = useState(false)
    const [adminMi, setAdminMi] = useState(false)
    const [rol, setRol] = useState(null)
    const [adSoyad, setAdSoyad] = useState("")
    const [kidem, setKidem] = useState(null)
    const [bekleyenSayisi, setBekleyenSayisi] = useState(0)
    const hesapMenuRef = useRef(null)
    const kesfetMenuRef = useRef(null)
    const olusturMenuRef = useRef(null)
    const bekleyenHedef = useRef(null)

    const kesfetLinkleri = [
        { ad: "Nasıl Çalışır", hedef: "surec" },
        { ad: "Neden Kalfahane", hedef: "neden" },
    ]
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const { toplam: okunmamisMesaj, gelen: gelenMesaj } = useOkunmamis(user?.id)
    const mesajRozeti = okunmamisMesaj > 9 ? "9+" : okunmamisMesaj

    async function cikisYap() {
        await supabase.auth.signOut()
    }

    function bolumeGit(id) {
        setMenuAcik(false)
        setKesfetMenuAcik(false)
        if (location.pathname !== "/") {
            bekleyenHedef.current = id
            navigate("/")
            return
        }
        const eleman = document.getElementById(id)
        if (eleman) eleman.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (location.pathname === "/" && bekleyenHedef.current) {
            const hedef = bekleyenHedef.current
            bekleyenHedef.current = null
            setTimeout(() => {
                const eleman = document.getElementById(hedef)
                if (eleman) eleman.scrollIntoView({ behavior: "smooth" })
            }, 80)
        }
    }, [location.pathname])

    // Kullanıcı profil bilgisi: admin mi, rolü ne, adı ne, ve kaç
    // tamamlanmış iş birliğiyle hangi kıdem rozetini hak ediyor.
    // Hepsi gerçek veri — sahte sayı ya da rozet yok.
    useEffect(() => {
        async function profilBilgisiGetir() {
            if (!user) {
                setAdminMi(false)
                setBekleyenSayisi(0)
                setRol(null)
                setAdSoyad("")
                setKidem(null)
                return
            }
            const { data: profil } = await supabase
                .from('profiller')
                .select('admin, rol, ad_soyad')
                .eq('id', user.id)
                .single()

            setRol(profil?.rol || null)
            setAdSoyad(profil?.ad_soyad || "")
            const gercekAdmin = !!profil?.admin
            setAdminMi(gercekAdmin)

            if (profil?.rol) {
                const sayi = await tamamlananIsSayisiGetir(supabase, user.id)
                setKidem(kidemRozetiHesapla(profil.rol, sayi))
            }

            if (gercekAdmin) {
                const { count } = await supabase
                    .from('profiller')
                    .select('*', { count: 'exact', head: true })
                    .eq('rol', 'yazilimci')
                    .eq('onayli', false)
                    .not('unvan', 'is', null)
                setBekleyenSayisi(count || 0)
            }
        }
        profilBilgisiGetir()
    }, [user, location.pathname])

    useEffect(() => {
        function disariTiklandi(e) {
            if (hesapMenuRef.current && !hesapMenuRef.current.contains(e.target)) {
                setHesapMenuAcik(false)
            }
            if (kesfetMenuRef.current && !kesfetMenuRef.current.contains(e.target)) {
                setKesfetMenuAcik(false)
            }
            if (olusturMenuRef.current && !olusturMenuRef.current.contains(e.target)) {
                setOlusturMenuAcik(false)
            }
        }
        document.addEventListener("mousedown", disariTiklandi)
        return () => document.removeEventListener("mousedown", disariTiklandi)
    }, [])

    useEffect(() => {
        function kaydirmaKontrol() {
            setKaydirildi(window.scrollY > 12)
        }
        window.addEventListener("scroll", kaydirmaKontrol)
        return () => window.removeEventListener("scroll", kaydirmaKontrol)
    }, [])

    useEffect(() => {
        function kisayolDinle(e) {
            const kIsMi = e.key.toLowerCase() === "k"
            if ((e.metaKey || e.ctrlKey) && kIsMi) {
                e.preventDefault()
                setAramaAcik(true)
            }
        }
        document.addEventListener("keydown", kisayolDinle)
        return () => document.removeEventListener("keydown", kisayolDinle)
    }, [])

    const gorunenIsim = adSoyad || user?.email || ""

    return (
        <>
            <DuyuruCubugu />
            <header
                className={`ust-cubuk sticky top-0 z-50 border-b transition-all duration-300 ${kaydirildi
                    ? "bg-[#000000]/[0.97] border-white/[0.12] shadow-lg shadow-black/20"
                    : "bg-[#000000]/[0.94] border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    }`}
            >
                <div
                    className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-300 ${kaydirildi ? "py-2.5" : "py-3.5"
                        }`}
                >

                    {/* Logo */}
                    <Link to="/" className="text-[1.3rem] font-extrabold tracking-[0.01em] text-[#FFFFFF]">
                        Kalfahane<span className="text-[#A78BFA]">.</span>
                    </Link>

                    {/* Masaüstü menü */}
                    <nav className="hidden md:flex items-center gap-1">
                        <Link
                            to="/ustalar"
                            className="text-[#A1A1AA] text-sm px-4 py-2 rounded-full hover:text-[#FFFFFF] hover:bg-white/[0.06] transition-all duration-300"
                        >
                            Ustalar
                        </Link>

                        <Link
                            to="/is-ilanlari"
                            className="text-[#A1A1AA] text-sm px-4 py-2 rounded-full hover:text-[#FFFFFF] hover:bg-white/[0.06] transition-all duration-300"
                        >
                            İş İlanları
                        </Link>

                        <div className="relative" ref={kesfetMenuRef}>
                            <button
                                onClick={() => setKesfetMenuAcik(!kesfetMenuAcik)}
                                className="flex items-center gap-1.5 text-[#A1A1AA] text-sm px-4 py-2 rounded-full hover:text-[#FFFFFF] hover:bg-white/[0.06] transition-all duration-300"
                            >
                                Keşfet
                                <svg
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    className={`w-3 h-3 transition-transform duration-300 ${kesfetMenuAcik ? "rotate-180" : ""}`}
                                >
                                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            {kesfetMenuAcik && (
                                <div className="absolute left-0 mt-2 w-48 acilir bg-[#0D0D13]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden py-1.5">
                                    {kesfetLinkleri.map((link) => (
                                        <button
                                            key={link.hedef}
                                            onClick={() => bolumeGit(link.hedef)}
                                            className="w-full flex items-center px-4 py-2.5 text-[#A1A1AA] text-sm text-left hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                        >
                                            {link.ad}
                                        </button>
                                    ))}
                                    <Link
                                        to="/blog"
                                        onClick={() => setKesfetMenuAcik(false)}
                                        className="flex items-center px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                    >
                                        Blog
                                    </Link>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setAramaAcik(true)}
                            className="isik isik-cam flex items-center gap-2 text-[#A1A1AA] text-sm px-3.5 py-2 ml-1 rounded-full border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04] hover:text-[#FFFFFF] transition-all duration-300"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                            </svg>
                            Ara
                            <kbd className="text-[10px] font-mono border border-white/[0.15] rounded px-1 py-0.5 ml-0.5">⌘K</kbd>
                        </button>
                    </nav>

                    {/* Sağ taraf: hızlı oluştur + bildirim + hesap */}
                    <div className="hidden md:flex items-center gap-2">

                        {/* "+" Hızlı Oluştur menüsü */}
                        <div className="relative" ref={olusturMenuRef}>
                            <button
                                onClick={() => setOlusturMenuAcik(!olusturMenuAcik)}
                                className="w-8 h-8 flex items-center justify-center text-[#A1A1AA] rounded-full hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-all duration-300"
                                aria-label="Hızlı oluştur"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4.5 h-4.5">
                                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                                </svg>
                            </button>
                            {olusturMenuAcik && (
                                <div className="absolute right-0 mt-2 w-56 acilir bg-[#0D0D13]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden py-1.5">
                                    {user ? (
                                        <>
                                            <Link
                                                to="/profilim"
                                                onClick={() => setOlusturMenuAcik(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0">
                                                    <path d="M4 4h6l2 2h8v12a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Yeni Proje Ekle
                                            </Link>
                                            <Link
                                                to={`/ustalar/${user.id}`}
                                                onClick={() => setOlusturMenuAcik(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0">
                                                    <circle cx="12" cy="8" r="4" />
                                                    <path d="M4 21v-1a8 8 0 0116 0v1" strokeLinecap="round" />
                                                </svg>
                                                Portföyümü Görüntüle
                                            </Link>
                                            <div className="h-px bg-white/[0.08] my-1.5" />
                                            {rol === 'is-veren' && (
                                                <Link
                                                    to="/ilan-ver"
                                                    onClick={() => setOlusturMenuAcik(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0">
                                                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                                                    </svg>
                                                    Yeni İlan Ver
                                                </Link>
                                            )}
                                            <Link
                                                to="/ustalar"
                                                onClick={() => setOlusturMenuAcik(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0">
                                                    <circle cx="11" cy="11" r="7" />
                                                    <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                                                </svg>
                                                Yazılımcı Bul
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                to="/hesap-olustur?rol=yazilimci"
                                                onClick={() => setOlusturMenuAcik(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                            >
                                                Yazılımcı Olarak Katıl
                                            </Link>
                                            <Link
                                                to="/hesap-olustur?rol=is-veren"
                                                onClick={() => setOlusturMenuAcik(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                            >
                                                İş Vermek İstiyorum
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mesajlar — okunmamış sayısıyla */}
                        {user && (
                            <Link
                                to="/mesajlar"
                                className={`relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-all duration-300 ${location.pathname.startsWith('/mesajlar') ? 'text-[#FFFFFF] bg-white/[0.06]' : 'text-[#A1A1AA]'}`}
                                aria-label={okunmamisMesaj ? `Mesajlar, ${okunmamisMesaj} okunmamış` : "Mesajlar"}
                                title="Mesajlar"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4.5 h-4.5">
                                    <path d="M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1h-9l-5 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {okunmamisMesaj > 0 && (
                                    <span className="msj-nav-rozet absolute -top-1 -right-1 text-[#FFFFFF] text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                                        {mesajRozeti}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Bildirim zili — sadece adminler için, gerçek onay bekleyen sayısı */}
                        {adminMi && (
                            <Link
                                to="/admin"
                                className="relative w-8 h-8 flex items-center justify-center text-[#A1A1AA] rounded-full hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-all duration-300"
                                aria-label="Onay bekleyen profiller"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4.5 h-4.5">
                                    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {bekleyenSayisi > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-[#FDFDFD] text-[#050505] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {bekleyenSayisi > 9 ? "9+" : bekleyenSayisi}
                                    </span>
                                )}
                            </Link>
                        )}

                        {user ? (
                            <div className="relative" ref={hesapMenuRef}>
                                <button
                                    onClick={() => setHesapMenuAcik(!hesapMenuAcik)}
                                    className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.06] transition-all duration-300"
                                >
                                    <div
                                        className="w-8 h-8 rounded-full p-[1.5px] shrink-0"
                                        style={{ background: kidem ? `linear-gradient(135deg, ${kidem.renk}, transparent)` : 'transparent' }}
                                    >
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] flex items-center justify-center text-[#050505] text-xs font-bold">
                                            {baslangicHarfleri(gorunenIsim)}
                                        </div>
                                    </div>
                                    <span className="text-[#FFFFFF] text-xs font-medium max-w-[130px] truncate">
                                        {gorunenIsim}
                                    </span>
                                    <svg
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                        className={`w-3.5 h-3.5 text-[#A1A1AA] transition-transform duration-300 ${hesapMenuAcik ? "rotate-180" : ""}`}
                                    >
                                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                {hesapMenuAcik && (
                                    <div className="absolute right-0 mt-2 w-64 acilir bg-[#0D0D13]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                                        <div className="px-4 py-4 border-b border-white/[0.08] flex items-center gap-3">
                                            <div
                                                className="w-11 h-11 rounded-full p-[1.5px] shrink-0"
                                                style={{ background: kidem ? `linear-gradient(135deg, ${kidem.renk}, transparent)` : 'transparent' }}
                                            >
                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] flex items-center justify-center text-[#050505] font-bold">
                                                    {baslangicHarfleri(gorunenIsim)}
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[#FFFFFF] text-sm font-semibold truncate">{gorunenIsim}</div>
                                                <div className="text-[#A1A1AA]/70 text-xs truncate">{user.email}</div>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2.5 flex items-center gap-1.5 flex-wrap border-b border-white/[0.08]">
                                            {adminMi && (
                                                <span className="text-[#A78BFA] text-[10px] font-mono border border-[#8B5CF6]/30 rounded-full px-2 py-0.5">
                                                    YÖNETİCİ
                                                </span>
                                            )}
                                            {kidem && (
                                                <span
                                                    className="text-[10px] font-mono rounded-full px-2 py-0.5 border"
                                                    style={{ color: kidem.renk, borderColor: `${kidem.renk}50`, backgroundColor: `${kidem.renk}12` }}
                                                >
                                                    {kidem.etiket}
                                                </span>
                                            )}
                                        </div>
                                        <div className="py-1.5">
                                            <Link
                                                to="/panel"
                                                onClick={() => setHesapMenuAcik(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                            >
                                                Panelim
                                            </Link>
                                            <Link
                                                to="/mesajlar"
                                                onClick={() => setHesapMenuAcik(false)}
                                                className="flex items-center justify-between gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                            >
                                                Mesajlar
                                                {okunmamisMesaj > 0 && (
                                                    <span className="bg-[#8B5CF6]/20 text-[#C4B5FD] text-[10px] font-semibold tabular-nums rounded-full px-1.5 py-0.5">
                                                        {okunmamisMesaj}
                                                    </span>
                                                )}
                                            </Link>
                                            <Link
                                                to="/profilim"
                                                onClick={() => setHesapMenuAcik(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                            >
                                                Profilim
                                            </Link>
                                            <Link
                                                to="/favorilerim"
                                                onClick={() => setHesapMenuAcik(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                            >
                                                Favorilerim
                                            </Link>
                                            {rol === 'is-veren' && (
                                                <Link
                                                    to="/ilanlarim"
                                                    onClick={() => setHesapMenuAcik(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                                >
                                                    İlanlarım
                                                </Link>
                                            )}
                                            {rol === 'yazilimci' && (
                                                <Link
                                                    to="/tekliflerim"
                                                    onClick={() => setHesapMenuAcik(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                                >
                                                    Tekliflerim
                                                </Link>
                                            )}
                                            {adminMi && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setHesapMenuAcik(false)}
                                                    className="flex items-center justify-between gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                                >
                                                    Yönetim Paneli
                                                    {bekleyenSayisi > 0 && (
                                                        <span className="bg-[#8B5CF6]/15 text-[#A78BFA] text-[10px] font-mono rounded-full px-1.5 py-0.5">
                                                            {bekleyenSayisi}
                                                        </span>
                                                    )}
                                                </Link>
                                            )}
                                            {adminMi && (
                                                <Link
                                                    to="/admin/blog"
                                                    onClick={() => setHesapMenuAcik(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                                >
                                                    Blog Yönetimi
                                                </Link>
                                            )}
                                            <Link
                                                to="/ayarlar"
                                                onClick={() => setHesapMenuAcik(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm hover:bg-white/[0.06] hover:text-[#FFFFFF] transition-colors duration-200"
                                            >
                                                Ayarlar
                                            </Link>
                                        </div>
                                        <div className="border-t border-white/[0.08] py-1.5">
                                            <button
                                                onClick={() => { setHesapMenuAcik(false); cikisYap() }}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[#A1A1AA] text-sm text-left hover:bg-red-400/[0.08] hover:text-red-300 transition-colors duration-200"
                                            >
                                                Çıkış Yap
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/giris"
                                className="isik isik-birincil giris-dugme inline-flex h-9 items-center rounded-full bg-[#FDFDFD] px-5 text-sm font-medium text-[#050505] transition-colors duration-200 hover:bg-white"
                            >
                                Giriş Yap
                            </Link>
                        )}
                    </div>

                    {/* Mobil sağ taraf: arama + hamburger */}
                    <div className="md:hidden flex items-center gap-1">
                        {adminMi && bekleyenSayisi > 0 && (
                            <Link
                                to="/admin"
                                className="relative w-9 h-9 flex items-center justify-center text-[#A1A1AA]"
                                aria-label="Onay bekleyen profiller"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                                    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="absolute top-0.5 right-0.5 bg-[#FDFDFD] text-[#050505] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {bekleyenSayisi > 9 ? "9+" : bekleyenSayisi}
                                </span>
                            </Link>
                        )}
                        {user && (
                            <Link
                                to="/mesajlar"
                                className="relative w-9 h-9 flex items-center justify-center text-[#A1A1AA]"
                                aria-label={okunmamisMesaj ? `Mesajlar, ${okunmamisMesaj} okunmamış` : "Mesajlar"}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
                                    <path d="M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1h-9l-5 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {okunmamisMesaj > 0 && (
                                    <span className="msj-nav-rozet absolute top-0 right-0 text-[#FFFFFF] text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                                        {mesajRozeti}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button
                            onClick={() => setAramaAcik(true)}
                            className="w-9 h-9 flex items-center justify-center text-[#A1A1AA]"
                            aria-label="Ara"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                            </svg>
                        </button>
                        <button
                            className="relative w-9 h-9 flex items-center justify-center text-[#FFFFFF]"
                            onClick={() => setMenuAcik(!menuAcik)}
                            aria-label="Menüyü aç/kapat"
                        >
                            <span className={`absolute block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuAcik ? "rotate-45" : "-translate-y-1.5"}`} />
                            <span className={`absolute block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuAcik ? "opacity-0" : "opacity-100"}`} />
                            <span className={`absolute block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuAcik ? "-rotate-45" : "translate-y-1.5"}`} />
                        </button>
                    </div>
                </div>

                {/* Mobil açılır menü */}
                {menuAcik && (
                    <nav className="acilir md:hidden flex flex-col gap-1 px-6 pb-6 pt-2 bg-[#000000]/95 backdrop-blur-2xl border-t border-white/[0.06]">
                        <Link
                            to="/ustalar"
                            onClick={() => setMenuAcik(false)}
                            className="text-[#A1A1AA] text-left px-4 py-3 rounded-xl hover:bg-white/[0.05] hover:text-[#FFFFFF] transition-all duration-300"
                        >
                            Ustalar
                        </Link>
                        <Link
                            to="/is-ilanlari"
                            onClick={() => setMenuAcik(false)}
                            className="text-[#A1A1AA] text-left px-4 py-3 rounded-xl hover:bg-white/[0.05] hover:text-[#FFFFFF] transition-all duration-300"
                        >
                            İş İlanları
                        </Link>
                        {kesfetLinkleri.map((link) => (
                            <button
                                key={link.hedef}
                                onClick={() => bolumeGit(link.hedef)}
                                className="text-[#A1A1AA] text-left px-4 py-3 rounded-xl hover:bg-white/[0.05] hover:text-[#FFFFFF] transition-all duration-300"
                            >
                                {link.ad}
                            </button>
                        ))}
                        <Link
                            to="/blog"
                            onClick={() => setMenuAcik(false)}
                            className="text-[#A1A1AA] text-left px-4 py-3 rounded-xl hover:bg-white/[0.05] hover:text-[#FFFFFF] transition-all duration-300"
                        >
                            Blog
                        </Link>

                        <div className="h-px bg-white/[0.08] my-2" />

                        {user ? (
                            <>
                                <div className="flex items-center gap-3 px-4 py-2">
                                    <div
                                        className="w-9 h-9 rounded-full p-[1.5px] shrink-0"
                                        style={{ background: kidem ? `linear-gradient(135deg, ${kidem.renk}, transparent)` : 'transparent' }}
                                    >
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] flex items-center justify-center text-[#050505] text-sm font-bold">
                                            {baslangicHarfleri(gorunenIsim)}
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[#FFFFFF] text-sm font-medium truncate">{gorunenIsim}</div>
                                        <div className="text-[#A1A1AA]/60 text-xs truncate">{user.email}</div>
                                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                            {adminMi && (
                                                <span className="text-[#A78BFA] text-[10px] font-mono border border-[#8B5CF6]/30 rounded-full px-2 py-0.5">
                                                    YÖNETİCİ
                                                </span>
                                            )}
                                            {kidem && (
                                                <span
                                                    className="text-[10px] font-mono rounded-full px-2 py-0.5 border"
                                                    style={{ color: kidem.renk, borderColor: `${kidem.renk}50`, backgroundColor: `${kidem.renk}12` }}
                                                >
                                                    {kidem.etiket}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    to="/panel"
                                    onClick={() => setMenuAcik(false)}
                                    className="text-[#A1A1AA] px-4 py-3 rounded-xl text-sm text-left hover:bg-white/[0.05] hover:text-[#FFFFFF] transition-all duration-300"
                                >
                                    Panelim
                                </Link>
                                <Link
                                    to="/mesajlar"
                                    onClick={() => setMenuAcik(false)}
                                    className="flex items-center justify-between text-[#A1A1AA] px-4 py-3 rounded-xl text-sm text-left hover:bg-white/[0.05] hover:text-[#FFFFFF] transition-all duration-300"
                                >
                                    Mesajlar
                                    {okunmamisMesaj > 0 && (
                                        <span className="bg-[#8B5CF6]/20 text-[#C4B5FD] text-[11px] font-semibold tabular-nums rounded-full px-2 py-0.5">{okunmamisMesaj}</span>
                                    )}
                                </Link>
                                <Link
                                    to="/profilim"
                                    onClick={() => setMenuAcik(false)}
                                    className="text-[#A1A1AA] px-4 py-3 rounded-xl text-sm text-left hover:bg-white/[0.05] hover:text-[#FFFFFF] transition-all duration-300"
                                >
                                    Profilim
                                </Link>
                                <Link
                                    to="/favorilerim"
                                    onClick={() => setMenuAcik(false)}
                                    className="text-[#A1A1AA] px-4 py-3 rounded-xl text-sm text-left hover:bg-white/[0.05] hover:text-[#FFFFFF] transition-all duration-300"
                                >
                                    Favorilerim
                                </Link>
                                {rol === 'is-veren' && (
                                    <Link
                                        to="/ilanlarim"
                                        onClick={() => setMenuAcik(false)}
                                        className="text-[#A1A1AA] px-4 py-3 rounded-xl text-sm text-left hover:bg-white/[0.05] hover:text-[#FFFFFF] transition-all duration-300"
                                    >
                                        İlanlarım
                                    </Link>
                                )}
                                {rol === 'yazilimci' && (
                                    <Link
                                        to="/tekliflerim"
                                        onClick={() => setMenuAcik(false)}
                                        className="text-[#A1A1AA] px-4 py-3 rounded-xl text-sm text-left hover:bg-white/[0.05] hover:text-[#FFFFFF] transition-all duration-300"
                                    >
                                        Tekliflerim
                                    </Link>
                                )}
                                {adminMi && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setMenuAcik(false)}
                                        className="isik isik-cam bg-white/[0.05] border border-white/[0.1] text-[#FFFFFF] px-4 py-3 rounded-xl text-sm font-medium text-center hover:bg-white/[0.1] transition-all duration-300"
                                    >
                                        Yönetim Paneli {bekleyenSayisi > 0 && `(${bekleyenSayisi})`}
                                    </Link>
                                )}
                                {adminMi && (
                                    <Link
                                        to="/admin/blog"
                                        onClick={() => setMenuAcik(false)}
                                        className="text-[#A1A1AA] px-4 py-3 rounded-xl text-sm text-left hover:bg-white/[0.05] hover:text-[#FFFFFF] transition-all duration-300"
                                    >
                                        Blog Yönetimi
                                    </Link>
                                )}
                                <Link
                                    to="/ayarlar"
                                    onClick={() => setMenuAcik(false)}
                                    className="text-[#A1A1AA] px-4 py-3 rounded-xl text-sm text-left hover:bg-white/[0.05] hover:text-[#FFFFFF] transition-all duration-300"
                                >
                                    Ayarlar
                                </Link>
                                <button
                                    onClick={() => { setMenuAcik(false); cikisYap() }}
                                    className="text-[#A1A1AA] px-4 py-3 rounded-xl text-sm text-left hover:text-red-300 hover:bg-red-400/[0.08] transition-all duration-300"
                                >
                                    Çıkış Yap
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/giris"
                                onClick={() => setMenuAcik(false)}
                                className="isik isik-birincil bg-[#FDFDFD] text-[#050505] px-4 py-3 rounded-xl text-sm font-semibold text-center hover:bg-[#FFFFFF] transition-all duration-300"
                            >
                                Giriş Yap
                            </Link>
                        )}
                    </nav>
                )}
            </header>

            <AramaPaleti acik={aramaAcik} kapat={() => setAramaAcik(false)} />
            <MesajBildirimi gelen={gelenMesaj} kullaniciId={user?.id} />
        </>
    )
}

export default Navbar
