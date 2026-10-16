import { useState, useEffect } from 'react'

const DUYURU_ANAHTARI = "usta_duyuru_kapatildi_v1"

function DuyuruCubugu() {
    const [gorunur, setGorunur] = useState(false)

    useEffect(() => {
        const kapatildiMi = localStorage.getItem(DUYURU_ANAHTARI)
        if (!kapatildiMi) setGorunur(true)
    }, [])

    function kapat() {
        localStorage.setItem(DUYURU_ANAHTARI, "1")
        setGorunur(false)
    }

    if (!gorunur) return null

    return (
        <div className="duyuru relative bg-gradient-to-r from-[#8B5CF6]/15 via-[#8B5CF6]/[0.08] to-[#8B5CF6]/15 border-b border-[#8B5CF6]/20 px-6 py-2.5">
            <div className="max-w-5xl mx-auto flex items-center justify-center gap-3 text-center relative">
                <p className="text-[#FFFFFF] text-xs sm:text-sm">
                    <span className="text-[#C4B5FD] font-semibold">Erken Erişim</span> — Kalfahane şu anda aktif geliştirme aşamasında, geri bildirimlerin bizim için değerli.
                </p>
                <button
                    onClick={kapat}
                    className="absolute right-0 text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors duration-200 text-lg leading-none"
                    aria-label="Duyuruyu kapat"
                >
                    ×
                </button>
            </div>
        </div>
    )
}

export default DuyuruCubugu
