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
        <div className="relative bg-gradient-to-r from-[#C97D3C]/15 via-[#C97D3C]/[0.08] to-[#C97D3C]/15 border-b border-[#C97D3C]/20 px-6 py-2.5">
            <div className="max-w-5xl mx-auto flex items-center justify-center gap-3 text-center relative">
                <p className="text-[#F3ECE1] text-xs sm:text-sm">
                    <span className="text-[#E3B776] font-semibold">Erken Erişim</span> — Usta şu anda aktif geliştirme aşamasında, geri bildirimlerin bizim için değerli.
                </p>
                <button
                    onClick={kapat}
                    className="absolute right-0 text-[#9FC2BC] hover:text-[#F3ECE1] transition-colors duration-200 text-lg leading-none"
                    aria-label="Duyuruyu kapat"
                >
                    ×
                </button>
            </div>
        </div>
    )
}

export default DuyuruCubugu
