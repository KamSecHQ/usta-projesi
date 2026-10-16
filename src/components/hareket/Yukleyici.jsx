import { useEffect, useRef, useState } from 'react'

// 000'dan 100'e sayan yükleme perdesi. Sayaç gerçek hazırlık sinyallerini izler:
// yazı tipleri, anasayfa kodu ve 3D sahnenin ilk kareleri. Hepsi bitince perde kalkar.
// Değer modül düzeyinde tutulur; Suspense yedeğinden anasayfaya geçerken sayaç sıfırlanmaz.

let sonDeger = 0
let kapandi = false

function hareketAzaltilsinMi() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function Yukleyici({ hedef = 100, bitti = false }) {
    const [deger, setDeger] = useState(sonDeger)
    const [cikis, setCikis] = useState(false)
    const [gizli, setGizli] = useState(kapandi)
    const hedefRef = useRef(hedef)
    hedefRef.current = bitti ? 100 : hedef

    useEffect(() => {
        if (kapandi) return
        if (hareketAzaltilsinMi() && bitti) {
            kapandi = true
            setGizli(true)
            window.__perdeKalkti = true
            window.dispatchEvent(new Event('perde-kalkti'))
            return
        }
        let kare
        function adim() {
            // Hedefe doğru yaylanarak yaklaşır; asla geri saymaz
            const h = hedefRef.current
            sonDeger = Math.min(h, sonDeger + Math.max(0.35, (h - sonDeger) * 0.08))
            setDeger(Math.floor(sonDeger))
            if (sonDeger >= 100) {
                kapandi = true
                setTimeout(() => {
                    setCikis(true)
                    window.__perdeKalkti = true
                    window.dispatchEvent(new Event('perde-kalkti'))
                }, 180)
                setTimeout(() => setGizli(true), 1250)
                return
            }
            kare = requestAnimationFrame(adim)
        }
        kare = requestAnimationFrame(adim)
        return () => cancelAnimationFrame(kare)
    }, [bitti])

    if (gizli) return null

    return (
        <div
            role="status"
            aria-live="polite"
            aria-label="Sayfa yükleniyor"
            className="fixed inset-0 z-[100] flex items-end bg-black font-pjs text-white"
            style={{
                clipPath: cikis ? 'inset(0 0 100% 0)' : 'inset(0 0 0% 0)',
                transition: 'clip-path 1000ms cubic-bezier(0.65, 0, 0.35, 1)',
            }}
        >
            <div className="flex w-full items-end justify-between px-4 pb-6 sm:px-8 sm:pb-8">
                <span className="text-[clamp(1.3rem,2.2vw,1.8rem)] font-extrabold tracking-[0.01em]">Kalfahane</span>
                <span className="rakam text-[clamp(5rem,16vw,14rem)] font-medium leading-[0.8] tracking-[-0.04em]">
                    {String(deger).padStart(3, '0')}
                </span>
            </div>
            <div className="absolute inset-x-0 top-0 h-[2px] origin-left bg-mor-acik shadow-[0_0_14px_rgba(167,139,250,0.9)]" style={{ transform: `scaleX(${deger / 100})` }} />
        </div>
    )
}
