import { useLocation } from 'react-router-dom'
import { HapLink } from '../uzay/Hareket'
import Ikon from '../gezinmeIkonlari'
import '../uzay/uzay.css'

// Tam sayfa durum kartı: giriş gerektiren, yetki ya da rol uymayan sayfaların ortak hâli.
// Kartın altından hero küresinin ufku yükselir (uzay.css, .kapi-kart).
export function KapiSayfasi({ ikon = 'kisi', baslik, metin, eylem, not }) {
    return (
        <div className="uzay relative flex min-h-[calc(100svh-64px)] items-center justify-center px-4 py-16 sm:py-24">
            <div className="uz-yildizlar" aria-hidden />
            <section className="w-full max-w-[540px]">
                <div className="kapi-kart">
                    <span className="kapi-ikon" aria-hidden>
                        <Ikon ad={ikon} />
                    </span>
                    <h1 className="mx-auto mt-7 max-w-[20ch] text-balance font-pjs text-[clamp(1.7rem,3.4vw,2.2rem)] font-medium leading-[1.12] tracking-[-0.025em] text-white">
                        {baslik}
                    </h1>
                    <p className="mx-auto mt-3 max-w-[40ch] text-pretty text-[15.5px] font-light leading-relaxed text-gri">{metin}</p>
                    {eylem && <div className="mt-8 flex flex-wrap justify-center gap-2.5">{eylem}</div>}
                    {not && <p className="mt-6 text-[13px] text-gri-koyu">{not}</p>}
                </div>
            </section>
        </div>
    )
}

// Hesap gerektiren sayfaların ziyaretçi hâli. Giriş bağlantısı bulunulan adresi taşır;
// giriş yapınca ziyaretçi kaldığı sayfaya döner (GirisYap.jsx, ?sonra=).
export default function GirisKapisi({ baslik, metin, ikon = 'kisi', kayitRolu, kayitYok = false }) {
    const { pathname, search } = useLocation()
    const sonra = encodeURIComponent(pathname + search)
    const kayitAdresi = `/hesap-olustur${kayitRolu ? `?rol=${kayitRolu}` : ''}`

    return (
        <KapiSayfasi
            ikon={ikon}
            baslik={baslik}
            metin={metin}
            eylem={
                <>
                    <HapLink to={`/giris?sonra=${sonra}`}>Giriş yap</HapLink>
                    {!kayitYok && (
                        <HapLink to={kayitAdresi} tur="cam">
                            Hesap oluştur
                        </HapLink>
                    )}
                </>
            }
            not={kayitYok ? null : 'Hesap açmak ücretsiz ve birkaç dakika sürer.'}
        />
    )
}
