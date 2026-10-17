import { useId, useState } from 'react'

const PUAN_ADLARI = ['', 'Kötü', 'Zayıf', 'İdare eder', 'İyi', 'Mükemmel']

function Yildiz({ dolu = 1, boyut }) {
    const id = useId()
    return (
        <svg viewBox="0 0 24 24" className={boyut} aria-hidden>
            <defs>
                <linearGradient id={id}>
                    <stop offset={`${dolu * 100}%`} stopColor="#A78BFA" />
                    <stop offset={`${dolu * 100}%`} stopColor="rgb(255 255 255 / 0.14)" />
                </linearGradient>
            </defs>
            <path
                d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"
                fill={`url(#${id})`}
                stroke={dolu > 0 ? '#A78BFA' : 'rgb(255 255 255 / 0.18)'}
                strokeWidth="1"
                strokeLinejoin="round"
            />
        </svg>
    )
}

// Puan gösterimi; ortalamalarda kesirli doluluk (4,5 → dört buçuk yıldız)
export function YildizGosterge({ puan, boyut = 'h-4 w-4' }) {
    return (
        <span className="inline-flex items-center gap-0.5" role="img" aria-label={`5 üzerinden ${puan.toLocaleString('tr-TR', { maximumFractionDigits: 1 })}`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Yildiz key={i} boyut={boyut} dolu={Math.max(0, Math.min(1, puan - (i - 1)))} />
            ))}
        </span>
    )
}

// Puan seçici: gerçek radyo düğmeleri; yön tuşlarıyla da seçilir, ekran okuyucu puanın adını okur
export function YildizSecici({ deger, degisti, etiket = 'Puanın' }) {
    const ad = useId()
    const [uzerinde, setUzerinde] = useState(0)
    const gorunen = uzerinde || deger
    return (
        <fieldset>
            <legend className="alan-etiket">{etiket}</legend>
            <div className="flex items-center gap-3">
                <div className="yildiz-secici flex" onMouseLeave={() => setUzerinde(0)}>
                    {[1, 2, 3, 4, 5].map((p) => (
                        <label key={p} className="cursor-pointer p-0.5" onMouseEnter={() => setUzerinde(p)}>
                            <input type="radio" name={ad} value={p} checked={deger === p} onChange={() => degisti(p)} className="sr-only" />
                            <span className="sr-only">
                                {p} yıldız, {PUAN_ADLARI[p]}
                            </span>
                            <Yildiz boyut="h-8 w-8 transition-transform duration-200 hover:scale-110" dolu={p <= gorunen ? 1 : 0} />
                        </label>
                    ))}
                </div>
                <span className="min-w-[80px] text-[14px] text-gri" aria-hidden>
                    {PUAN_ADLARI[gorunen]}
                </span>
            </div>
        </fieldset>
    )
}
