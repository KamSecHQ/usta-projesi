import { useState } from 'react'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'


function Navbar() {
    const [menuAcik, setMenuAcik] = useState(false)

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

    return (
        <header className="sticky top-0 z-50 bg-[#0D2626]/70 backdrop-blur-2xl border-b border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">

            <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">

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
                </nav>

                {user ? (
                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-2.5 pl-1 pr-4 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#C97D3C] to-[#E3B776] flex items-center justify-center text-[#0D2626] text-xs font-semibold shrink-0">
                                {user.email?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-[#9FC2BC] text-xs max-w-[140px] truncate">
                                {user.email}
                            </span>
                        </div>
                        <Link
                            to="/admin"
                            className="bg-white/[0.05] backdrop-blur-md border border-white/[0.1] text-[#F3ECE1] px-4 py-2 rounded-full text-sm font-medium hover:bg-white/[0.1] hover:border-[#C97D3C]/40 transition-all duration-300"
                        >
                            Başvurular
                        </Link>
                        <button
                            onClick={cikisYap}
                            className="text-[#9FC2BC] text-sm px-3 py-2 rounded-full hover:text-red-300 hover:bg-red-400/[0.08] transition-all duration-300"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/giris"
                        className="hidden md:block bg-white/[0.05] backdrop-blur-md border border-[#C97D3C]/50 text-[#E3B776] px-5 py-2 rounded-full text-sm font-medium hover:bg-[#C97D3C] hover:text-[#0D2626] hover:border-[#C97D3C] transition-all duration-300"
                    >
                        Giriş Yap
                    </Link>
                )}

                {/* Mobil hamburger buton */}
                <button
                    className="md:hidden relative w-9 h-9 flex items-center justify-center text-[#F3ECE1]"
                    onClick={() => setMenuAcik(!menuAcik)}
                    aria-label="Menüyü aç/kapat"
                >
                    <span className={`absolute block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuAcik ? "rotate-45" : "-translate-y-1.5"}`} />
                    <span className={`absolute block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuAcik ? "opacity-0" : "opacity-100"}`} />
                    <span className={`absolute block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuAcik ? "-rotate-45" : "translate-y-1.5"}`} />
                </button>
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
    )
}

export default Navbar
