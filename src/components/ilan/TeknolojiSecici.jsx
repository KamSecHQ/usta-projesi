import { useId, useState } from 'react'
import { aramaIcinKatla } from '../../ustaYardimcilari'


// Teknoloji çipleri: yazıp Enter (ya da virgül) ile eklenir, × ile çıkarılır; öneriler tek tıkla eklenir.
// Aynı teknolojinin farklı yazımı ("react", "React") ikinci kez eklenmez.
export default function TeknolojiSecici({ deger, degisti, oneriler = [], etiket = 'Teknolojiler', ipucu, enCok = 8 }) {
    const [metin, setMetin] = useState('')
    const id = useId()
    const ipucuId = useId()
    const secili = new Set(deger.map(aramaIcinKatla))
    const dolu = deger.length >= enCok

    function ekle(ham) {
        const ad = ham.trim().replace(/,$/, '')
        if (!ad || dolu || secili.has(aramaIcinKatla(ad))) return
        degisti([...deger, ad])
    }

    function tus(e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            ekle(metin)
            setMetin('')
        } else if (e.key === 'Backspace' && !metin && deger.length) {
            degisti(deger.slice(0, -1))
        }
    }

    const kalanOneriler = oneriler.filter((o) => !secili.has(aramaIcinKatla(o)))

    return (
        <div>
            <label htmlFor={id} className="alan-etiket">
                {etiket}
            </label>
            <div className="alan flex min-h-[52px] flex-wrap items-center gap-1.5 py-2" onClick={() => document.getElementById(id)?.focus()}>
                {deger.map((t) => (
                    <span key={t} className="uz-etiket h-7 gap-1 bg-mor/20 pr-1 font-kod text-[12px] text-white">
                        {t}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                degisti(deger.filter((x) => x !== t))
                            }}
                            className="flex h-5 w-5 items-center justify-center rounded-full text-mor-soluk hover:bg-white/10 hover:text-white"
                            aria-label={`${t} teknolojisini çıkar`}
                        >
                            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden>
                                <path d="M3 3l6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        </button>
                    </span>
                ))}
                <input
                    id={id}
                    value={metin}
                    onChange={(e) => setMetin(e.target.value)}
                    onKeyDown={tus}
                    onBlur={() => {
                        ekle(metin)
                        setMetin('')
                    }}
                    disabled={dolu}
                    placeholder={dolu ? `En çok ${enCok} teknoloji` : deger.length ? 'Bir tane daha…' : 'Yaz ve Enter’a bas'}
                    aria-describedby={ipucuId}
                    className="min-w-[120px] flex-1 bg-transparent py-1 text-[15px] text-white outline-none placeholder:text-[#80808C]"
                />
            </div>
            <p id={ipucuId} className="alan-ipucu">
                {ipucu || 'Virgül ya da Enter ile ekle; silmek için × ya da boşken geri tuşu.'}
            </p>
            {kalanOneriler.length > 0 && !dolu && (
                <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Öneriler">
                    {kalanOneriler.map((o) => (
                        <button key={o} type="button" onClick={() => ekle(o)} className="liste-cip h-8 font-kod text-[12px]">
                            <span aria-hidden>+</span> {o}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
