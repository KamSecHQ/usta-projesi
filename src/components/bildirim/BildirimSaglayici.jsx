import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { BildirimBaglami } from './bildirimBaglami'

const SURE = 3200
const EN_COK = 3

function TurIsareti({ tur }) {
    if (tur === 'hata') {
        return (
            <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-[#FCA5A5]" fill="none" aria-hidden>
                <path d="M8 4.5v4M8 11.2v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.4" />
            </svg>
        )
    }
    if (tur === 'basari') {
        return (
            <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-[#86EFAC]" fill="none" aria-hidden>
                <path d="m4 8.4 2.6 2.4L12 5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }
    return <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mor-acik shadow-[0_0_10px_rgba(167,139,250,0.9)]" aria-hidden />
}

export default function BildirimSaglayici({ children }) {
    const [bildirimler, setBildirimler] = useState([])
    const [istek, setIstek] = useState(null)
    const diyalog = useRef(null)
    const sayac = useRef(0)
    const baslikId = useId()
    const metinId = useId()

    const bildir = useCallback((metin, { tur = 'bilgi', sure = SURE } = {}) => {
        const id = ++sayac.current
        setBildirimler((liste) => [...liste.slice(-(EN_COK - 1)), { id, metin, tur }])
        setTimeout(() => setBildirimler((liste) => liste.filter((b) => b.id !== id)), sure)
    }, [])

    const onayla = useCallback(
        (secenekler) =>
            new Promise((coz) => {
                setIstek({ ...secenekler, coz })
            }),
        []
    )

    // Diyalog tarayıcının kendi kipli <dialog>'u: odak içeride kalır, Esc kapatır, arka plan erişilemez olur
    useEffect(() => {
        const d = diyalog.current
        if (istek && d && !d.open) d.showModal()
    }, [istek])

    function kapat(sonuc) {
        istek?.coz(sonuc)
        diyalog.current?.close()
        setIstek(null)
    }

    const deger = useMemo(() => ({ bildir, onayla }), [bildir, onayla])

    // Geliştirmede konsoldan denemek için: __bildirim.bildir('Merhaba') · await __bildirim.onayla({ baslik: '…' })
    useEffect(() => {
        if (import.meta.env.DEV) window.__bildirim = deger
    }, [deger])

    return (
        <BildirimBaglami.Provider value={deger}>
            {children}

            <div className="bildirim-alani" role="status" aria-live="polite">
                {bildirimler.map((b) => (
                    <p key={b.id} className={`bildirim bildirim-${b.tur}`}>
                        <TurIsareti tur={b.tur} />
                        {b.metin}
                    </p>
                ))}
            </div>

            <dialog
                ref={diyalog}
                className="onay-diyalog"
                aria-labelledby={baslikId}
                aria-describedby={istek?.metin ? metinId : undefined}
                onCancel={(e) => {
                    e.preventDefault()
                    kapat(false)
                }}
                onClick={(e) => e.target === diyalog.current && kapat(false)}
            >
                {istek && (
                    <div className="onay-govde">
                        <h2 id={baslikId} className="text-[19px] font-semibold tracking-[-0.015em] text-white">
                            {istek.baslik}
                        </h2>
                        {istek.metin && (
                            <p id={metinId} className="mt-2 text-[14.5px] leading-relaxed text-gri">
                                {istek.metin}
                            </p>
                        )}
                        <div className="mt-7 flex flex-wrap justify-end gap-2.5">
                            <button type="button" autoFocus onClick={() => kapat(false)} className="isik isik-cam rounded-full px-5 py-2.5 text-[14px] font-medium">
                                {istek.iptal || 'Vazgeç'}
                            </button>
                            <button
                                type="button"
                                onClick={() => kapat(true)}
                                className={`isik rounded-full px-5 py-2.5 text-[14px] font-semibold ${istek.tehlike ? 'isik-tehlike' : 'isik-birincil'}`}
                            >
                                {istek.onay || 'Onayla'}
                            </button>
                        </div>
                    </div>
                )}
            </dialog>
        </BildirimBaglami.Provider>
    )
}
