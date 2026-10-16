import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { bildirimSesi } from '../mesajlasma'
import Avatar from './mesaj/Avatar'
import Ikon from './mesaj/Ikon'
import './mesaj/mesaj.css'

// Mesajlar sayfası dışındayken gelen mesajı sağ altta kısa bir kartla gösterir.
// Sessize alınmış konuşmalar ses ve kart üretmez.
function MesajBildirimi({ gelen, kullaniciId }) {
    const location = useLocation()
    const navigate = useNavigate()
    const [bildirim, setBildirim] = useState(null)
    const mesajSayfasinda = location.pathname.startsWith('/mesajlar')

    useEffect(() => {
        if (!gelen || !kullaniciId || mesajSayfasinda) return
        let iptal = false
        Promise.all([
            supabase.from('konusma_durumu').select('sessiz').eq('konusma_id', gelen.konusma_id).eq('kullanici_id', kullaniciId).maybeSingle(),
            supabase.from('profiller').select('id, ad_soyad, avatar_url').eq('id', gelen.gonderen_id).maybeSingle(),
        ]).then(([durum, profil]) => {
            if (iptal || durum.data?.sessiz) return
            bildirimSesi()
            setBildirim({ ...gelen, profil: profil.data })
        })
        return () => {
            iptal = true
        }
        // Yalnızca yeni mesaj gelince çalışır
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gelen])

    useEffect(() => {
        if (mesajSayfasinda) setBildirim(null)
    }, [mesajSayfasinda])

    useEffect(() => {
        if (!bildirim) return
        const t = setTimeout(() => setBildirim(null), 7000)
        return () => clearTimeout(t)
    }, [bildirim])

    if (!bildirim) return null

    const olay = bildirim.tur === 'sistem' ? bildirim.ek?.olay : null
    const metin = bildirim.tur === 'iletisim'
        ? 'İletişim bilgilerini paylaştı'
        : olay === 'kabul'
            ? 'Teklifini kabul etti. Konuşma açıldı.'
            : olay === 'ret'
                ? 'Teklifini reddetti.'
                : olay === 'teklif'
                    ? 'Teklif üzerinden konuşma başlattı.'
                    : bildirim.icerik

    return (
        <div className="fixed z-[70] bottom-5 left-4 right-4 sm:left-auto sm:right-5 sm:w-[360px]" role="status" aria-live="polite">
            <div className="msj-bildirim relative flex items-start gap-3 p-3.5 pr-11">
                <button
                    onClick={() => {
                        setBildirim(null)
                        navigate(`/mesajlar/${bildirim.konusma_id}`)
                    }}
                    className="absolute inset-0 rounded-[22px]"
                    aria-label={`${bildirim.profil?.ad_soyad || 'Yeni mesaj'}: konuşmayı aç`}
                />
                <Avatar profil={bildirim.profil} boyut={40} className="pointer-events-none" />
                <span className="min-w-0 flex-1 pointer-events-none">
                    <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13.5px] font-bold text-white">{bildirim.profil?.ad_soyad || 'Kalfahane üyesi'}</span>
                        {olay === 'kabul' && <Ikon ad="anlasma" className="w-4 h-4 text-[#86EFAC] shrink-0" />}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-[#D4D4D8] line-clamp-2">{metin}</span>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#C4B5FD]">
                        Yanıtla <Ikon ad="geri" className="w-3 h-3 rotate-180" kalinlik={2} />
                    </span>
                </span>
                <button
                    onClick={() => setBildirim(null)}
                    aria-label="Bildirimi kapat"
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                    <Ikon ad="kapat" className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

export default MesajBildirimi
