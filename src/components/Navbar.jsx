import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import AramaPaleti from './AramaPaleti'
import DuyuruCubugu from './DuyuruCubugu'


function Navbar() {
    const [menuAcik, setMenuAcik] = useState(false)
    const [hesapMenuAcik, setHesapMenuAcik] = useState(false)
    const [aramaAcik, setAramaAcik] = useState(false)
    const [kaydirildi, setKaydirildi] = useState(false)
    const hesapMenuRef = useRef(null)

    const linkler = [
        { ad: "Ustalar", hedef: "ustalar" },
        { ad: "Nasıl Çalışır", hedef: "surec" },
        { ad: "Neden Usta", hedef: "neden" },
    ]
    const { user } = useAuth()

    async function cikisYap() {
        await supabase.auth.signOut()
    }

    function bolumeGit(id) {
        setMenuAcik(false)
        const eleman = document.getElementById(id)
        if (eleman) {
            eleman.scrollIntoView({ behavior: "smooth" })
        }
    }

    useEffect(() => {
        function disariTiklandi(e) {
            if (hesapMenuRef.current && !hesapMenuRef.current.contains(e.target)) {
                setHesapMenuAcik(false)
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

    return (
        <>
            <DuyuruCubugu />
            <header
                className={`sticky top-0 z-50 backdrop-blur-2xl border-b transition-all duration-300 ${kaydirildi
                    ? "bg-[#0D2626]/90 border-white/[0.12] shadow-lg shadow-black/20"
                    : "bg-[#0D2626]/70 border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    }`}
            >
                <div
                    className={`max-w-5xl mx-auto px-6 flex items-center justify-between transition-all duration-300 ${kaydirildi ? "py-2.5" : "py-3.5"
                        }`}
                >

                    {/* Logo */}
                    <div className="text-[#F3ECE1] font-semibold text-lg tracking-tight">
                        USTA<span className="text-[#C97D3C]">.</span>
                    </div>

                    {/* Masaüstü menü */}
                    <nav className="hidden md:flex items-center gap-1">
                        {linkler.map((link) => (
                            <button
                                key={link.hedef}
                                onClick={() => bolumeGit(link.hedef)}
                                className="text-[#9FC2BC] text-sm px-4 py-2 rounded-full hover:text-[#F3ECE1] hover:bg-white/[0.06] transition-all duration-300"
                            >
                                {link.ad}
                            </button>
                        ))}
                        <button
                            onClick={() => setAramaAcik(true)}
                            className="flex items-center gap-2 text-[#9FC2BC] text-sm px-3.5 py-2 ml-1 rounded-full border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04] hover:text-[#F3ECE1] transition-all duration-300"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                            </svg>
                            Ara
                            <kbd className="text-[10px] font-mono border border-white/[0.15] rounded px-1 py-0.5 ml-0.5">⌘K</kbd>
                        </button>
                    </nav>

                    {user ? (
                        <div className="hidden md:block relative" ref={hesapMenuRef}>
                            <button
                                onClick={() => setHesapMenuAcik(!hesapMenuAcik)}
                                className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.06] transition-all duration-300"
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C97D3C] to-[#E3B776] flex items-center justify-center text-[#0D2626] text-xs font-semibold shrink-0">
                                    {user.email?.[0]?.toUpperCase()}
                                </div>
                                <span className="text-[#9FC2BC] text-xs max-w-[130px] truncate">
                                    {user.email}
                                </span>
                                <svg
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    className={`w-3.5 h-3.5 text-[#9FC2BC] transition-transform duration-300 ${hesapMenuAcik ? "rotate-180" : ""}`}
                                >
                                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            {hesapMenuAcik && (
                                <div className="absolute right-0 mt-2 w-56 bg-[#123434]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-white/[0.08]">
                                        <div className="text-[#F3ECE1] text-sm font-medium truncate">{user.email}</div>
                                    </div>
                                    <div className="py-1.5">
                                        <Link
                                            to="/profilim"
                                            onClick={() => setHesapMenuAcik(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-[#9FC2BC] text-sm hover:bg-white/[0.06] hover:text-[#F3ECE1] transition-colors duration-200"
                                        >
                                            Profilim
                                        </Link>
                                        <Link
                                            to="/admin"
                                            onClick={() => setHesapMenuAcik(false)}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-[#9FC2BC] text-sm hover:bg-white/[0.06] hover:text-[#F3ECE1] transition-colors duration-200"
                                        >
                                            Başvurular
                                        </Link>
                                    </div>
                                    <div className="border-t border-white/[0.08] py-1.5">
                                        <button
                                            onClick={() => { setHesapMenuAcik(false); cikisYap() }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[#9FC2BC] text-sm text-left hover:bg-red-400/[0.08] hover:text-red-300 transition-colors duration-200"
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
                            className="hidden md:block bg-white/[0.05] backdrop-blur-md border border-[#C97D3C]/50 text-[#E3B776] px-5 py-2 rounded-full text-sm font-medium hover:bg-[#C97D3C] hover:text-[#0D2626] hover:border-[#C97D3C] transition-all duration-300"
                        >
                            Giriş Yap
                        </Link>
                    )}

                    {/* Mobil sağ taraf: arama + hamburger */}
                    <div className="md:hidden flex items-center gap-1">
                        <button
                            onClick={() => setAramaAcik(true)}
                            className="w-9 h-9 flex items-center justify-center text-[#9FC2BC]"
                            aria-label="Ara"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                            </svg>
                        </button>
                        <button
                            className="relative w-9 h-9 flex items-center justify-center text-[#F3ECE1]"
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
                    <nav className="md:hidden flex flex-col gap-1 px-6 pb-6 pt-2 bg-[#0D2626]/95 backdrop-blur-2xl border-t border-white/[0.06]">
                        {linkler.map((link) => (
                            <button
                                key={link.hedef}
                                onClick={() => bolumeGit(link.hedef)}
                                className="text-[#9FC2BC] text-left px-4 py-3 rounded-xl hover:bg-white/[0.05] hover:text-[#F3ECE1] transition-all duration-300"
                            >
                                {link.ad}
                            </button>
                        ))}

                        <div className="h-px bg-white/[0.08] my-2" />

                        {user ? (
                            <>
                                <div className="flex items-center gap-3 px-4 py-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C97D3C] to-[#E3B776] flex items-center justify-center text-[#0D2626] text-sm font-semibold shrink-0">
                                        {user.email?.[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-[#9FC2BC] text-sm truncate">{user.email}</span>
                                </div>
                                <Link
                                    to="/profilim"
                                    onClick={() => setMenuAcik(false)}
                                    className="text-[#9FC2BC] px-4 py-3 rounded-xl text-sm text-left hover:bg-white/[0.05] hover:text-[#F3ECE1] transition-all duration-300"
                                >
                                    Profilim
                                </Link>
                                <Link
                                    to="/admin"
                                    onClick={() => setMenuAcik(false)}
                                    className="bg-white/[0.05] border border-white/[0.1] text-[#F3ECE1] px-4 py-3 rounded-xl text-sm font-medium text-center hover:bg-white/[0.1] transition-all duration-300"
                                >
                                    Başvurular
                                </Link>
                                <button
                                    onClick={() => { setMenuAcik(false); cikisYap() }}
                                    className="text-[#9FC2BC] px-4 py-3 rounded-xl text-sm text-left hover:text-red-300 hover:bg-red-400/[0.08] transition-all duration-300"
                                >
                                    Çıkış Yap
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/giris"
                                onClick={() => setMenuAcik(false)}
                                className="bg-[#C97D3C] text-[#0D2626] px-4 py-3 rounded-xl text-sm font-semibold text-center hover:bg-[#E3B776] transition-all duration-300"
                            >
                                Giriş Yap
                            </Link>
                        )}
                    </nav>
                )}
            </header>

            <AramaPaleti acik={aramaAcik} kapat={() => setAramaAcik(false)} />
        </>
    )
}

export default Navbar
