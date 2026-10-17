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
        <div className="duyuru px-4 py-2 sm:px-6">
            <div className="relative mx-auto flex max-w-5xl items-center justify-center gap-3 pr-8 text-center">
                <span className="duyuru-cip">Erken erişim</span>
                <p className="text-[12.5px] text-[#D4D4D8] sm:text-[13px]">
                    <span className="hidden sm:inline">Kalfahane yeni açıldı; çarşıyı ilk ustalar ve iş verenlerle birlikte kuruyoruz.</span>
                    <span className="sm:hidden">Çarşıyı birlikte kuruyoruz.</span>
                </p>
                <button type="button" onClick={kapat} className="duyuru-kapat absolute right-0" aria-label="Duyuruyu kapat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default DuyuruCubugu
