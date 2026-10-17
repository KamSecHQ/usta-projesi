import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useSayfaBasligi from '../useSayfaBasligi'
import { HapLink } from '../components/uzay/Hareket'

const KISAYOLLAR = [
    { to: '/ustalar', ad: 'Ustalar', alt: 'Onaylı yazılımcıların portföyleri' },
    { to: '/is-ilanlari', ad: 'İş ilanları', alt: 'Açık işlere göz at, teklif ver' },
    { to: '/blog', ad: 'Blog', alt: 'Bütçe, teklif ve teknoloji rehberleri' },
]

function SayfaBulunamadi() {
    useSayfaBasligi('Sayfa bulunamadı')
    // Olmayan adresler arama sonuçlarına girmesin
    useEffect(() => {
        const etiket = document.createElement('meta')
        etiket.name = 'robots'
        etiket.content = 'noindex'
        document.head.appendChild(etiket)
        return () => etiket.remove()
    }, [])

    return (
        <div className="uzay relative min-h-[calc(100dvh-108px)] overflow-hidden">
            <div className="uz-yildizlar" aria-hidden />
            <section className="relative px-4 pb-24 pt-24 sm:px-8 lg:pt-28">
                <div className="mx-auto flex max-w-[720px] flex-col items-center text-center">
                    <div className="relative" aria-hidden>
                        <span className="kayip-hale" />
                        <span className="kayip-yorunge" />
                        <p className="kayip-rakam relative font-pjs">404</p>
                    </div>

                    <h1 className="mt-4 font-pjs text-[clamp(1.9rem,3.6vw,2.6rem)] font-medium leading-[1.08] tracking-[-0.03em] text-white">
                        Bu adreste bir şey yok
                    </h1>
                    <p className="mt-4 max-w-[46ch] text-[16px] font-light leading-relaxed text-gri">
                        Sayfa taşınmış, silinmiş ya da bağlantıda bir yazım hatası olabilir. Aradığın şey büyük ihtimalle aşağıdakilerden birinde.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <HapLink to="/">Anasayfaya dön</HapLink>
                        <HapLink to="/ustalar" tur="cam">Ustalara göz at</HapLink>
                    </div>

                    <nav aria-label="Kısayollar" className="mt-14 grid w-full gap-3 sm:grid-cols-3">
                        {KISAYOLLAR.map((k) => (
                            <Link
                                key={k.to}
                                to={k.to}
                                className="group rounded-[18px] border border-white/[0.08] bg-white/[0.02] px-5 py-4 text-left transition-colors duration-300 hover:border-mor-acik/40 hover:bg-white/[0.04]"
                            >
                                <span className="flex items-center justify-between text-[15px] font-medium text-white">
                                    {k.ad}
                                    <svg viewBox="0 0 12 10" fill="none" aria-hidden className="h-[10px] w-3 text-mor-acik transition-transform duration-300 group-hover:translate-x-0.5">
                                        <path d="M1 5h10M7 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <span className="mt-1 block text-[13px] text-gri-koyu">{k.alt}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </section>
        </div>
    )
}

export default SayfaBulunamadi
