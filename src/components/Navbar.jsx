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
        <header className="sticky top-0 z-50 bg-[#0D2626]/90 backdrop-blur border-b border-[#21504E]">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="text-[#F3ECE1] font-bold text-xl">
                    USTA<span className="text-[#C97D3C]">.</span>
                </div>

                {/* Masaüstü menü */}
                <nav className="hidden md:flex gap-8">
                    {linkler.map((link) => (
                        <button
                            key={link.hedef}
                            onClick={() => bolumeGit(link.hedef)}
                            className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition"
                        >
                            {link.ad}
                        </button>
                    ))}
                </nav>
                {user ? (
                    <div className="hidden md:flex items-center gap-3">
                        <Link to="/admin" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1]">
                            {user.email}
                        </Link>
                        <button onClick={cikisYap} className="border border-[#21504E] text-[#F3ECE1] px-4 py-2 rounded text-sm">
                            Çıkış Yap
                        </button>
                    </div>
                ) : (
                    <Link to="/giris" className="hidden md:block border border-[#C97D3C] text-[#C97D3C] px-4 py-2 rounded text-sm hover:bg-[#C97D3C] hover:text-[#0D2626] transition">
                        Giriş Yap
                    </Link>
                )}


                {/* Mobil hamburger buton */}
                <button
                    className="md:hidden text-[#F3ECE1] text-2xl"
                    onClick={() => setMenuAcik(!menuAcik)}
                    aria-label="Menüyü aç/kapat"
                >
                    {menuAcik ? "✕" : "☰"}
                </button>
            </div>

            {/* Mobil açılır menü */}
            {menuAcik && (
                <nav className="md:hidden flex flex-col gap-4 px-6 pb-6">
                    {linkler.map((link) => (
                        <button
                            key={link.hedef}
                            onClick={() => bolumeGit(link.hedef)}
                            className="text-[#9FC2BC] text-left"
                        >
                            {link.ad}
                        </button>
                    ))}
                    <button className="border border-[#C97D3C] text-[#C97D3C] px-4 py-2 rounded text-sm">
                        Giriş Yap
                    </button>
                </nav>
            )}
        </header>
    )
}

export default Navbar
