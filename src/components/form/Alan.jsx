import { useId, useState } from 'react'
import '../uzay/uzay.css'

// Form alanı: etiket, ipucu ve hata alana otomatik bağlanır (htmlFor, aria-describedby,
// aria-invalid). Ekran okuyucu alanın adını, ipucunu ve hatayı okur; etikete tıklamak alanı seçer.
//   <Alan etiket="E-posta" hata={h}>{(p) => <input {...p} type="email" className="alan" />}</Alan>
export function Alan({ etiket, ipucu, hata, istege, children }) {
    const id = useId()
    const ipucuId = `${id}-ipucu`
    const hataId = `${id}-hata`
    const tanim = [hata ? hataId : null, ipucu ? ipucuId : null].filter(Boolean).join(' ') || undefined
    return (
        <div>
            <label htmlFor={id} className="alan-etiket">
                {etiket}
                {istege && <span className="ml-1.5 font-normal text-gri-koyu">(isteğe bağlı)</span>}
            </label>
            {children({ id, 'aria-invalid': hata ? true : undefined, 'aria-describedby': tanim })}
            {hata && (
                <p id={hataId} className="alan-hata" role="alert">
                    {hata}
                </p>
            )}
            {ipucu && (
                <p id={ipucuId} className="alan-ipucu">
                    {ipucu}
                </p>
            )}
        </div>
    )
}

// Şifre alanı: göster/gizle düğmesiyle; otomatik doldurma türü dışarıdan verilir
export function SifreAlani({ etiket = 'Şifre', deger, degisti, otomatik = 'current-password', hata, ipucu, enAz }) {
    const [goster, setGoster] = useState(false)
    return (
        <Alan etiket={etiket} hata={hata} ipucu={ipucu}>
            {(p) => (
                <div className="relative">
                    <input
                        {...p}
                        type={goster ? 'text' : 'password'}
                        className="alan pr-24"
                        value={deger}
                        onChange={(e) => degisti(e.target.value)}
                        autoComplete={otomatik}
                        minLength={enAz}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setGoster(!goster)}
                        aria-pressed={goster}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-[12.5px] font-medium text-mor-soluk hover:bg-white/[0.06] hover:text-white"
                    >
                        {goster ? 'Gizle' : 'Göster'}
                        <span className="sr-only"> şifreyi</span>
                    </button>
                </div>
            )}
        </Alan>
    )
}
