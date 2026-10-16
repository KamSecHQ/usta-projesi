import { useEffect, useRef, useState } from 'react'
import Ikon from './Ikon'
import { epostaGecerli, guvenliUrl } from '../../mesajlasma'

// Yazma alanının üstünde açılan iletişim kartı formu. Kart yalnızca bu
// konuşmada görünür; mesaj silinerek geri alınabilir.
function IletisimPaylas({ varsayilan, onGonder, onKapat }) {
    const [telefon, setTelefon] = useState(varsayilan?.telefon || '')
    const [eposta, setEposta] = useState(varsayilan?.eposta || '')
    const [baglanti, setBaglanti] = useState('')
    const [not, setNot] = useState('')
    const [hata, setHata] = useState('')
    const kokRef = useRef(null)
    const ilkAlanRef = useRef(null)

    useEffect(() => {
        ilkAlanRef.current?.focus()
        function disari(e) {
            if (kokRef.current && !kokRef.current.contains(e.target)) onKapat()
        }
        function tus(e) {
            if (e.key === 'Escape') onKapat()
        }
        document.addEventListener('mousedown', disari)
        document.addEventListener('keydown', tus)
        return () => {
            document.removeEventListener('mousedown', disari)
            document.removeEventListener('keydown', tus)
        }
    }, [onKapat])

    function gonder(e) {
        e.preventDefault()
        const t = telefon.trim()
        const ep = eposta.trim()
        const bg = baglanti.trim()
        if (!t && !ep && !bg) {
            setHata('Paylaşmak için en az bir bilgi gir: telefon, e-posta ya da bağlantı.')
            return
        }
        if (ep && !epostaGecerli(ep)) {
            setHata('E-posta adresi eksik görünüyor. Örnek: ad@alanadi.com')
            return
        }
        if (t && t.replace(/[^\d]/g, '').length < 7) {
            setHata('Telefon numarası çok kısa. Alan koduyla birlikte yaz.')
            return
        }
        const url = bg ? guvenliUrl(bg) : ''
        if (bg && !url) {
            setHata('Bağlantı geçersiz. https:// ile başlayan bir adres yaz.')
            return
        }
        const ek = {}
        if (t) ek.telefon = t
        if (ep) ek.eposta = ep
        if (url) ek.baglanti = url
        if (not.trim()) ek.not = not.trim().slice(0, 300)
        onGonder(ek)
    }

    const alan = 'msj-alan w-full rounded-xl px-3 h-10 text-[13.5px] text-white placeholder:text-[#8E8E99] outline-none'

    return (
        <div ref={kokRef} className="msj-acilir absolute bottom-full left-0 right-0 sm:right-auto sm:w-[380px] mb-2 rounded-3xl p-4 z-30" role="dialog" aria-label="İletişim bilgisi paylaş">
            <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#8B5CF6]/15 text-[#C4B5FD] shrink-0">
                    <Ikon ad="kart" className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold">İletişim kartı paylaş</p>
                    <p className="text-[12px] leading-relaxed text-[#A1A1AA] mt-0.5">Yalnızca bu konuşmadaki kişi görür. Kartı sonradan silebilirsin.</p>
                </div>
                <button onClick={onKapat} aria-label="Kapat" className="w-8 h-8 -mt-1 -mr-1 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-colors">
                    <Ikon ad="kapat" className="w-4 h-4" />
                </button>
            </div>

            <form onSubmit={gonder} className="mt-4 flex flex-col gap-2.5" noValidate>
                <label className="flex flex-col gap-1">
                    <span className="text-[11.5px] text-[#A1A1AA]">Telefon</span>
                    <input ref={ilkAlanRef} type="tel" inputMode="tel" autoComplete="tel" value={telefon} onChange={(e) => { setTelefon(e.target.value); setHata('') }} placeholder="0 5xx xxx xx xx" className={alan} />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-[11.5px] text-[#A1A1AA]">E-posta</span>
                    <input type="email" autoComplete="email" value={eposta} onChange={(e) => { setEposta(e.target.value); setHata('') }} placeholder="ad@alanadi.com" className={alan} />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-[11.5px] text-[#A1A1AA]">Bağlantı <span className="text-[#8E8E99]">(LinkedIn, GitHub, web sitesi)</span></span>
                    <input type="url" inputMode="url" value={baglanti} onChange={(e) => { setBaglanti(e.target.value); setHata('') }} placeholder="https://" className={alan} />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-[11.5px] text-[#A1A1AA]">Not</span>
                    <input value={not} onChange={(e) => setNot(e.target.value)} maxLength={300} placeholder="Hafta içi 10.00–18.00 arası ulaşabilirsin" className={alan} />
                </label>

                {hata && <p className="text-[12px] text-[#FCA5A5]" role="alert">{hata}</p>}

                <div className="mt-1 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-[#A1A1AA]">
                        <Ikon ad="kalkan" className="w-3.5 h-3.5 text-[#86EFAC]" /> Şifre ve banka kartı bilgisi paylaşma
                    </span>
                    <button type="submit" className="isik isik-birincil h-9 px-4 rounded-full text-[13px] font-semibold shrink-0">Kartı gönder</button>
                </div>
            </form>
        </div>
    )
}

export default IletisimPaylas
