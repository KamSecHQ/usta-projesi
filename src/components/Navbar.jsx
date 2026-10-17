import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AramaPaleti from './AramaPaleti'
import DuyuruCubugu from './DuyuruCubugu'
import Ikon from './gezinmeIkonlari'
import { rayOlaylari } from './navVurgu'
import { kidemRozetiHesapla, tamamlananIsSayisiGetir } from '../ustaYardimcilari'
import { useOkunmamis } from '../mesajlasma'
import MesajBildirimi from './MesajBildirimi'
import './gezinme.css'

// Anasayfanın bölümleri: Keşfet menüsü ve mobil menü buradan kaydırır
const KESFET_LINKLERI = [
    { ad: "Nasıl çalışır", aciklama: "Tarif et, teklif al, teslim al", hedef: "surec", ikon: "surec" },
    { ad: "Kıdem cetveli", aciklama: "Rozetler yalnızca tamamlanan işlerden", hedef: "kidem", ikon: "kidem" },
    { ad: "Neden Kalfahane", aciklama: "Yerel, açık ve doğrulanabilir", hedef: "neden", ikon: "kalkan" },
    { ad: "Sık sorulanlar", aciklama: "Çarşıya girmeden önce", hedef: "sss", ikon: "soru" },
]

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad.split(" ").filter(Boolean).slice(0, 2).map((k) => k[0].toLocaleUpperCase("tr")).join("")
}

function OkIsareti() {
    return (
        <svg viewBox="0 0 12 10" fill="none" aria-hidden="true" className="h-[10px] w-[12px] shrink-0">
            <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function Avatar({ isim, kidem, boyut }) {
    return (
        <span
            className={`${boyut} shrink-0 rounded-full p-[1.5px]`}
            style={{ background: kidem ? `linear-gradient(135deg, ${kidem.renk}, transparent)` : "linear-gradient(135deg, rgba(255,255,255,0.35), transparent)" }}
        >
            <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] text-[0.8em] font-bold text-[#050505]">
                {baslangicHarfleri(isim)}
            </span>
        </span>
    )
}

function Rozetler({ adminMi, kidem }) {
    if (!adminMi && !kidem) return null
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {adminMi && (
                <span className="rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-2 py-0.5 text-[10.5px] font-medium text-[#C4B5FD]">
                    Yönetici
                </span>
            )}
            {kidem && (
                <span
                    className="rounded-full border px-2 py-0.5 text-[10.5px] font-medium"
                    style={{ color: kidem.renk, borderColor: `${kidem.renk}50`, backgroundColor: `${kidem.renk}12` }}
                >
                    {kidem.etiket}
                </span>
            )}
        </div>
    )
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

    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const { toplam: okunmamisMesaj, gelen: gelenMesaj } = useOkunmamis(user?.id)
    const mesajRozeti = okunmamisMesaj > 9 ? "9+" : okunmamisMesaj
    const yol = location.pathname

    // Bulunulan bölüm: üst düzey sayfa ve altındaki ayrıntı sayfaları
    const etkinMi = (kok) => yol === kok || yol.startsWith(`${kok}/`)
    const kesfetEtkin = etkinMi("/blog") || etkinMi("/ornek")
    // Yönetim paneli yalnızca kendi sayfasında yanar; blog yönetimi onun alt yolu
    const linkEtkinMi = (to) => (to === "/admin" ? yol === to : etkinMi(to))

    async function cikisYap() {
        await supabase.auth.signOut()
    }

    function menuleriKapat() {
        setMenuAcik(false)
        setKesfetMenuAcik(false)
        setOlusturMenuAcik(false)
        setHesapMenuAcik(false)
    }

    function bolumeGit(id) {
        menuleriKapat()
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

    // Açık menüler Escape ile kapanır
    useEffect(() => {
        function escDinle(e) {
            if (e.key === "Escape") menuleriKapat()
        }
        document.addEventListener("keydown", escDinle)
        return () => document.removeEventListener("keydown", escDinle)
    }, [])

    useEffect(() => {
        function kaydirmaKontrol() {
            setKaydirildi(window.scrollY > 12)
        }
        window.addEventListener("scroll", kaydirmaKontrol, { passive: true })
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

    // Hesap menüsü ve mobil menü aynı listeyi kullanır
    const hesapLinkleri = user
        ? [
            { ad: "Panelim", to: "/panel", ikon: "panel" },
            { ad: "Mesajlar", to: "/mesajlar", ikon: "mesaj", sayac: okunmamisMesaj },
            { ad: "Profilim", to: "/profilim", ikon: "kisi" },
            { ad: "Favorilerim", to: "/favorilerim", ikon: "kalp" },
            rol === 'is-veren' && { ad: "İlanlarım", to: "/ilanlarim", ikon: "klasor" },
            rol === 'yazilimci' && { ad: "Tekliflerim", to: "/tekliflerim", ikon: "teklif" },
            adminMi && { ad: "Yönetim paneli", to: "/admin", ikon: "kalkan", sayac: bekleyenSayisi },
            adminMi && { ad: "Blog yönetimi", to: "/admin/blog", ikon: "kalem" },
            { ad: "Ayarlar", to: "/ayarlar", ikon: "ayarlar" },
        ].filter(Boolean)
        : []

    // "+" menüsü role göre: yazılımcı vitrinini büyütür, iş veren ilan açar
    const olusturLinkleri = [
        rol === 'yazilimci' && { ad: "Portföye proje ekle", aciklama: "Tamamladığın bir işi göster", to: "/profilim", ikon: "klasorArti" },
        rol === 'yazilimci' && user && { ad: "Herkese açık profilim", aciklama: "Ziyaretçilerin gördüğü hâli", to: `/ustalar/${user.id}`, ikon: "vitrin" },
        rol === 'is-veren' && { ad: "İlan ver", aciklama: "Ücretsiz, birkaç dakikada", to: "/ilan-ver", ikon: "arti" },
        { ad: "Usta bul", aciklama: "Onaylı profilleri incele", to: "/ustalar", ikon: "ustalar" },
    ].filter(Boolean)

    return (
        <>
            <DuyuruCubugu />
            <header className={`ust-cubuk sticky top-0 z-50 ${kaydirildi ? "kaydirildi" : ""}`}>
                <div
                    className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[padding] duration-300 sm:px-6 ${kaydirildi ? "py-2" : "py-3"}`}
                >

                    {/* Logo */}
                    <Link to="/" className="text-[1.3rem] font-extrabold tracking-[0.01em] text-[#FFFFFF]" onClick={menuleriKapat}>
                        Kalfahane<span className="text-[#A78BFA]">.</span>
                    </Link>

                    {/* Masaüstü: ışık rayı + arama */}
                    <div className="hidden items-center gap-2 md:flex">
                        <nav className="nav-ray" aria-label="Ana menü" {...rayOlaylari}>
                            <Link
                                to="/ustalar"
                                className={`nav-hap ${etkinMi("/ustalar") ? "etkin" : ""}`}
                                aria-current={yol === "/ustalar" ? "page" : undefined}
                            >
                                Ustalar
                            </Link>
                            <Link
                                to="/is-ilanlari"
                                className={`nav-hap ${etkinMi("/is-ilanlari") ? "etkin" : ""}`}
                                aria-current={yol === "/is-ilanlari" ? "page" : undefined}
                            >
                                İş ilanları
                            </Link>
                            <div className="relative" ref={kesfetMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setKesfetMenuAcik(!kesfetMenuAcik)}
                                    className={`nav-hap ${kesfetEtkin ? "etkin" : ""}`}
                                    aria-expanded={kesfetMenuAcik}
                                    aria-haspopup="true"
                                >
                                    Keşfet
                                    <Ikon ad="asagi" className="ok-asagi" />
                                </button>
                                {kesfetMenuAcik && (
                                    <div className="menu-panel left-1/2 ml-[-160px] w-[320px]">
                                        {KESFET_LINKLERI.map((link) => (
                                            <button key={link.hedef} type="button" onClick={() => bolumeGit(link.hedef)} className="menu-satir">
                                                <span className="menu-ikon"><Ikon ad={link.ikon} /></span>
                                                <span className="menu-metin">
                                                    <span>{link.ad}</span>
                                                    <span className="menu-aciklama">{link.aciklama}</span>
                                                </span>
                                            </button>
                                        ))}
                                        <div className="menu-ayrac" />
                                        <Link to="/ornek" onClick={() => setKesfetMenuAcik(false)} className={`menu-satir ${etkinMi("/ornek") ? "etkin" : ""}`}>
                                            <span className="menu-ikon"><Ikon ad="vitrin" /></span>
                                            <span className="menu-metin">
                                                <span>Örnek vitrin</span>
                                                <span className="menu-aciklama">Bir işin baştan sona akışı</span>
                                            </span>
                                        </Link>
                                        <Link to="/blog" onClick={() => setKesfetMenuAcik(false)} className={`menu-satir ${etkinMi("/blog") ? "etkin" : ""}`}>
                                            <span className="menu-ikon"><Ikon ad="blog" /></span>
                                            <span className="menu-metin">
                                                <span>Blog</span>
                                                <span className="menu-aciklama">Çarşıdan yazılar ve rehberler</span>
                                            </span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <span className="nav-ray-vurgu" aria-hidden="true" />
                        </nav>

                        <button type="button" onClick={() => setAramaAcik(true)} className="nav-ara isik-hap" aria-label="Ara (⌘K)">
                            <Ikon ad="ara" className="h-4 w-4" />
                            Ara
                            <kbd>⌘K</kbd>
                        </button>
                    </div>

                    {/* Masaüstü sağ taraf */}
                    <div className="hidden items-center gap-2 md:flex">
                        {user ? (
                            <>
                                <div className="relative" ref={olusturMenuRef}>
                                    <button
                                        type="button"
                                        onClick={() => setOlusturMenuAcik(!olusturMenuAcik)}
                                        className="nav-ikon isik-hap"
                                        aria-label="Hızlı oluştur"
                                        aria-expanded={olusturMenuAcik}
                                        aria-haspopup="true"
                                    >
                                        <Ikon ad="arti" />
                                    </button>
                                    {olusturMenuAcik && (
                                        <div className="menu-panel right-0 w-72">
                                            {olusturLinkleri.map((l) => (
                                                <Link key={l.to} to={l.to} onClick={() => setOlusturMenuAcik(false)} className="menu-satir">
                                                    <span className="menu-ikon"><Ikon ad={l.ikon} /></span>
                                                    <span className="menu-metin">
                                                        <span>{l.ad}</span>
                                                        <span className="menu-aciklama">{l.aciklama}</span>
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Mesajlar — okunmamış sayısıyla */}
                                <Link
                                    to="/mesajlar"
                                    className={`nav-ikon isik-hap ${etkinMi("/mesajlar") ? "etkin" : ""}`}
                                    aria-label={okunmamisMesaj ? `Mesajlar, ${okunmamisMesaj} okunmamış` : "Mesajlar"}
                                    title="Mesajlar"
                                >
                                    <Ikon ad="mesaj" />
                                    {okunmamisMesaj > 0 && (
                                        <span className="msj-nav-rozet absolute -right-1 -top-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-[#FFFFFF]">
                                            {mesajRozeti}
                                        </span>
                                    )}
                                </Link>

                                {/* Bildirim zili — sadece adminler için, gerçek onay bekleyen sayısı */}
                                {adminMi && (
                                    <Link to="/admin" className={`nav-ikon isik-hap ${etkinMi("/admin") ? "etkin" : ""}`} aria-label="Onay bekleyen profiller" title="Onay bekleyen profiller">
                                        <Ikon ad="zil" />
                                        {bekleyenSayisi > 0 && (
                                            <span className="absolute -right-0.5 -top-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-[#FDFDFD] text-[10px] font-bold text-[#050505]">
                                                {bekleyenSayisi > 9 ? "9+" : bekleyenSayisi}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                <div className="relative" ref={hesapMenuRef}>
                                    <button
                                        type="button"
                                        onClick={() => setHesapMenuAcik(!hesapMenuAcik)}
                                        className="nav-hesap isik-hap"
                                        aria-expanded={hesapMenuAcik}
                                        aria-haspopup="true"
                                    >
                                        <Avatar isim={gorunenIsim} kidem={kidem} boyut="h-[34px] w-[34px] text-[12px]" />
                                        <span className="max-w-[130px] truncate text-[13px] font-medium text-[#FFFFFF]">{gorunenIsim}</span>
                                        <Ikon ad="asagi" className={`h-3.5 w-3.5 text-[#A1A1AA] transition-transform duration-300 ${hesapMenuAcik ? "rotate-180" : ""}`} />
                                    </button>

                                    {hesapMenuAcik && (
                                        <div className="menu-panel right-0 w-72">
                                            <div className="flex items-center gap-3 px-2.5 pb-3 pt-2">
                                                <Avatar isim={gorunenIsim} kidem={kidem} boyut="h-11 w-11 text-[15px]" />
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold text-[#FFFFFF]">{gorunenIsim}</div>
                                                    <div className="truncate text-xs text-[#8A8A94]">{user.email}</div>
                                                    <div className="mt-1.5"><Rozetler adminMi={adminMi} kidem={kidem} /></div>
                                                </div>
                                            </div>
                                            <div className="menu-ayrac" />
                                            {hesapLinkleri.map((l) => (
                                                <Link
                                                    key={l.to}
                                                    to={l.to}
                                                    onClick={() => setHesapMenuAcik(false)}
                                                    className={`menu-satir menu-satir-sade ${linkEtkinMi(l.to) ? "etkin" : ""}`}
                                                >
                                                    <Ikon ad={l.ikon} />
                                                    {l.ad}
                                                    {l.sayac > 0 && <span className="menu-sayac">{l.sayac}</span>}
                                                </Link>
                                            ))}
                                            <div className="menu-ayrac" />
                                            <button
                                                type="button"
                                                onClick={() => { setHesapMenuAcik(false); cikisYap() }}
                                                className="menu-satir menu-satir-sade menu-satir-tehlike"
                                            >
                                                <Ikon ad="cikis" />
                                                Çıkış yap
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/giris" className="isik-hap inline-flex h-[38px] items-center rounded-full px-4 text-[13.5px] font-medium">
                                    Giriş yap
                                </Link>
                                <Link to="/hesap-olustur" className="isik-hap isik-hap-birincil inline-flex h-[38px] items-center gap-2 rounded-full pl-4 pr-3.5 text-[13.5px] font-semibold">
                                    Hesap oluştur <OkIsareti />
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobil sağ taraf: mesajlar + arama + menü */}
                    <div className="flex items-center gap-1.5 md:hidden">
                        {adminMi && bekleyenSayisi > 0 && (
                            <Link to="/admin" className="nav-ikon isik-hap" aria-label="Onay bekleyen profiller">
                                <Ikon ad="zil" />
                                <span className="absolute -right-0.5 -top-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-[#FDFDFD] text-[9px] font-bold text-[#050505]">
                                    {bekleyenSayisi > 9 ? "9+" : bekleyenSayisi}
                                </span>
                            </Link>
                        )}
                        {user && (
                            <Link
                                to="/mesajlar"
                                className={`nav-ikon isik-hap ${etkinMi("/mesajlar") ? "etkin" : ""}`}
                                aria-label={okunmamisMesaj ? `Mesajlar, ${okunmamisMesaj} okunmamış` : "Mesajlar"}
                            >
                                <Ikon ad="mesaj" />
                                {okunmamisMesaj > 0 && (
                                    <span className="msj-nav-rozet absolute -right-1 -top-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-[#FFFFFF]">
                                        {mesajRozeti}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button type="button" onClick={() => setAramaAcik(true)} className="nav-ikon isik-hap" aria-label="Ara">
                            <Ikon ad="ara" />
                        </button>
                        <button
                            type="button"
                            className="nav-ikon isik-hap"
                            onClick={() => setMenuAcik(!menuAcik)}
                            aria-label={menuAcik ? "Menüyü kapat" : "Menüyü aç"}
                            aria-expanded={menuAcik}
                            aria-controls="mobil-menu"
                        >
                            <span className={`absolute block h-[1.5px] w-[18px] bg-current transition-all duration-300 ${menuAcik ? "rotate-45" : "-translate-y-[5px]"}`} />
                            <span className={`absolute block h-[1.5px] w-[18px] bg-current transition-all duration-300 ${menuAcik ? "-rotate-45" : "translate-y-[5px]"}`} />
                        </button>
                    </div>
                </div>

                {/* Mobil açılır menü */}
                {menuAcik && (
                    <nav id="mobil-menu" className="mobil-menu md:hidden" aria-label="Mobil menü">
                        <Link to="/ustalar" onClick={menuleriKapat} className={`mobil-satir ${etkinMi("/ustalar") ? "etkin" : ""}`}>
                            <span className="menu-ikon"><Ikon ad="ustalar" /></span>
                            Ustalar
                            <Ikon ad="sag" className="mobil-ok" />
                        </Link>
                        <Link to="/is-ilanlari" onClick={menuleriKapat} className={`mobil-satir ${etkinMi("/is-ilanlari") ? "etkin" : ""}`}>
                            <span className="menu-ikon"><Ikon ad="ilanlar" /></span>
                            İş ilanları
                            <Ikon ad="sag" className="mobil-ok" />
                        </Link>
                        <Link to="/ornek" onClick={menuleriKapat} className={`mobil-satir ${etkinMi("/ornek") ? "etkin" : ""}`}>
                            <span className="menu-ikon"><Ikon ad="vitrin" /></span>
                            Örnek vitrin
                            <Ikon ad="sag" className="mobil-ok" />
                        </Link>
                        <Link to="/blog" onClick={menuleriKapat} className={`mobil-satir ${etkinMi("/blog") ? "etkin" : ""}`}>
                            <span className="menu-ikon"><Ikon ad="blog" /></span>
                            Blog
                            <Ikon ad="sag" className="mobil-ok" />
                        </Link>

                        <div className="mobil-baslik">Keşfet</div>
                        {KESFET_LINKLERI.map((link) => (
                            <button key={link.hedef} type="button" onClick={() => bolumeGit(link.hedef)} className="mobil-satir">
                                <span className="menu-ikon"><Ikon ad={link.ikon} /></span>
                                {link.ad}
                                <Ikon ad="sag" className="mobil-ok" />
                            </button>
                        ))}

                        {user ? (
                            <>
                                <div className="mobil-baslik">Hesabın</div>
                                <div className="mb-1 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                                    <Avatar isim={gorunenIsim} kidem={kidem} boyut="h-10 w-10 text-[14px]" />
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-medium text-[#FFFFFF]">{gorunenIsim}</div>
                                        <div className="truncate text-xs text-[#8A8A94]">{user.email}</div>
                                        <div className="mt-1.5"><Rozetler adminMi={adminMi} kidem={kidem} /></div>
                                    </div>
                                </div>
                                {hesapLinkleri.map((l) => (
                                    <Link key={l.to} to={l.to} onClick={menuleriKapat} className={`mobil-satir ${linkEtkinMi(l.to) ? "etkin" : ""}`}>
                                        <span className="menu-ikon"><Ikon ad={l.ikon} /></span>
                                        {l.ad}
                                        {l.sayac > 0 ? <span className="menu-sayac">{l.sayac}</span> : <Ikon ad="sag" className="mobil-ok" />}
                                    </Link>
                                ))}
                                <button type="button" onClick={() => { menuleriKapat(); cikisYap() }} className="mobil-satir mt-1 text-[#A1A1AA] hover:text-red-300">
                                    <span className="menu-ikon"><Ikon ad="cikis" /></span>
                                    Çıkış yap
                                </button>
                            </>
                        ) : (
                            <div className="mt-5 grid gap-2.5">
                                <Link to="/hesap-olustur" onClick={menuleriKapat} className="isik-hap isik-hap-birincil flex h-12 items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold">
                                    Hesap oluştur <OkIsareti />
                                </Link>
                                <Link to="/giris" onClick={menuleriKapat} className="isik-hap flex h-12 items-center justify-center rounded-full text-[15px] font-medium">
                                    Giriş yap
                                </Link>
                            </div>
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
