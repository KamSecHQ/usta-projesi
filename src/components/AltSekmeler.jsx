import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { useProfilRolu } from '../profilRolu'
import Ikon from './gezinmeIkonlari'

// Mobilde giriş yapmış kullanıcının alt sekme çubuğu (faz 48). Sekmeler role göre:
// yazılımcı ilanlara ve tekliflerine, iş veren ustalara ve ilanlarına hızlı ulaşır.
// Açık bir konuşmada gizlenir (yazma alanına yer kalsın). Görünürken <html> "alt-sekmeli"
// sınıfını alır; --alt-sekme yüksekliğiyle sayfa altı, bildirimler ve mesajlar düzeni yukarı kayar
// (gezinme.css). Okunmamış sayısı Navbar'dan gelir: aynı canlı kanal iki kez açılmaz.
function sekmeler(rol, kullaniciId) {
    const panel = { ad: 'Panel', to: '/panel', ikon: 'panel' }
    const mesajlar = { ad: 'Mesajlar', to: '/mesajlar', ikon: 'mesaj', mesaj: true }
    const profil = { ad: 'Profil', to: '/profilim', ikon: 'kisi', ekYol: `/ustalar/${kullaniciId}` }
    if (rol === 'yazilimci') {
        return [panel, { ad: 'İlanlar', to: '/is-ilanlari', ikon: 'ilanlar' }, { ad: 'Teklifler', to: '/tekliflerim', ikon: 'teklif' }, mesajlar, profil]
    }
    if (rol === 'is-veren') {
        return [panel, { ad: 'Ustalar', to: '/ustalar', ikon: 'ustalar' }, { ad: 'İlanlarım', to: '/ilanlarim', ikon: 'klasor' }, mesajlar, profil]
    }
    return [panel, { ad: 'Ustalar', to: '/ustalar', ikon: 'ustalar' }, { ad: 'İlanlar', to: '/is-ilanlari', ikon: 'ilanlar' }, mesajlar, profil]
}

export default function AltSekmeler({ okunmamis = 0 }) {
    const { user } = useAuth()
    // girisli: oturum ya da geliştirmedeki ?rol-onizleme= (profilRolu.js)
    const { girisli, rol, hazir } = useProfilRolu()
    const { pathname } = useLocation()
    const acikKonusma = /^\/mesajlar\/[^/]+/.test(pathname)
    const gorunur = girisli && hazir && !acikKonusma

    useEffect(() => {
        document.documentElement.classList.toggle('alt-sekmeli', gorunur)
        return () => document.documentElement.classList.remove('alt-sekmeli')
    }, [gorunur])

    if (!gorunur) return null

    const etkinMi = (s) => pathname === s.to || pathname.startsWith(`${s.to}/`) || (s.ekYol && pathname === s.ekYol)
    const rozet = okunmamis > 9 ? '9+' : okunmamis

    return (
        <nav className="alt-sekmeler" aria-label="Alt menü">
            {sekmeler(rol, user?.id).map((s) => {
                const etkin = etkinMi(s)
                return (
                    <Link
                        key={s.to}
                        to={s.to}
                        className={`alt-sekme ${etkin ? 'etkin' : ''}`}
                        aria-current={etkin ? 'page' : undefined}
                        aria-label={s.mesaj && okunmamis ? `${s.ad}, ${okunmamis} okunmamış` : undefined}
                    >
                        <span className="alt-sekme-ikon">
                            <Ikon ad={s.ikon} />
                            {s.mesaj && okunmamis > 0 && <span className="alt-sekme-rozet msj-nav-rozet">{rozet}</span>}
                        </span>
                        {s.ad}
                    </Link>
                )
            })}
        </nav>
    )
}
