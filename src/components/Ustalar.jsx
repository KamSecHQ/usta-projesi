import { useState, useEffect } from 'react'
import { Sahne, SatirBaslik, HapLink } from './uzay/Hareket'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { musaitlikBilgisi, ucretAraligiGoster } from '../ustaYardimcilari'

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((k) => k[0].toLocaleUpperCase('tr-TR'))
        .join("")
}

// Usta kartı: koyu cam yüzey, imleçle yanan mor kenar ışığı
function Icazet({ usta, sira }) {
    const mus = musaitlikBilgisi(usta.musaitlik)
    const ucret = ucretAraligiGoster(usta.saatlik_ucret_min, usta.saatlik_ucret_max)
    const etiketler = (usta.teknolojiler || []).slice(0, 4)

    return (
        <Link
            to={`/ustalar/${usta.id}`}
            className="uz-otur group relative block overflow-hidden rounded-[22px] border border-white/[0.09] bg-cam p-6 transition-[border-color,transform] duration-500 ease-(--ease-cekic) hover:-translate-y-1 hover:border-mor/50 sm:p-7"
            style={{ '--d': `${0.3 + sira * 0.1}s` }}
        >
            <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(139,92,246,0.18),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[15px] font-semibold text-black">
                    {baslangicHarfleri(usta.ad_soyad)}
                </div>
                {usta.onayli && (
                    <span className="uz-etiket">
                        <svg viewBox="0 0 12 12" className="h-3 w-3 text-mor-acik" fill="none" aria-hidden>
                            <path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Onaylı usta
                    </span>
                )}
            </div>

            <h3 className="relative mt-6 text-[22px] font-medium leading-tight tracking-[-0.015em] text-white">
                {usta.ad_soyad || "İsimsiz Usta"}
            </h3>
            <div className="relative mt-1 text-[15px] font-light text-gri">{usta.unvan}</div>
            {usta.bio && (
                <p className="relative mt-3 line-clamp-2 text-[15px] font-light leading-relaxed text-gri-koyu">{usta.bio}</p>
            )}

            {etiketler.length > 0 && (
                <div className="relative mt-5 flex flex-wrap gap-1.5">
                    {etiketler.map((t) => (
                        <span key={t} className="uz-etiket font-kod text-[11px]">
                            {t}
                        </span>
                    ))}
                </div>
            )}

            <div className="relative mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4 text-[13.5px]">
                <span className="flex items-center gap-2 text-gri">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: mus.renk }} />
                    {mus.etiket}
                </span>
                {ucret && <span className="rakam font-medium text-white">{ucret}</span>}
            </div>
        </Link>
    )
}

function IskeletIcazet() {
    return (
        <div className="h-[300px] animate-pulse rounded-[22px] border border-white/[0.06] bg-cam" />
    )
}

function Ustalar() {
    const [ustalar, setUstalar] = useState([])
    const [yukleniyor, setYukleniyor] = useState(true)

    useEffect(() => {
        async function veriGetir() {
            const { data, error } = await supabase
                .from('profiller')
                .select('*')
                .eq('rol', 'yazilimci')
                .eq('onayli', true)
                .not('unvan', 'is', null)
                .order('created_at', { ascending: false })
                .limit(3)

            if (!error) setUstalar(data)
            setYukleniyor(false)
        }
        veriGetir()
    }, [])

    return (
        <Sahne as="section" id="ustalar" className="uz-ufuk px-4 py-28 sm:px-8 lg:py-36">
            <div className="mx-auto max-w-[1100px] text-center">
                <SatirBaslik
                    satirlar={['İşini teslim edeceğin', 'ustalar burada.']}
                    className="font-pjs text-[clamp(2.4rem,5.6vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.025em] text-white"
                />
                <p className="uz-sub mx-auto mt-5 max-w-[44ch] text-[17px] font-light leading-[1.6] text-gri" style={{ '--d': '0.25s' }}>
                    Platformun ayrıca incelediği, onaylı profiller. Portföylerine, kıdemlerine ve önceki işlerine bak.
                </p>
            </div>

            <div className="mx-auto mt-14 max-w-[1240px]">
                {yukleniyor ? (
                    <div className="grid gap-4 md:grid-cols-3">
                        <IskeletIcazet />
                        <IskeletIcazet />
                        <IskeletIcazet />
                    </div>
                ) : ustalar.length === 0 ? (
                    <div className="uz-otur mx-auto max-w-[560px] rounded-[22px] border border-dashed border-white/15 p-10 text-center" style={{ '--d': '0.3s' }}>
                        <p className="text-[20px] font-medium text-white">Henüz onaylı bir usta yok.</p>
                        <p className="mt-2 text-[15px] font-light text-gri">İlk onaylı usta sen olabilirsin.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-3">
                        {ustalar.map((usta, i) => (
                            <Icazet key={usta.id} usta={usta} sira={i} />
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-2.5">
                <HapLink to="/ustalar" className="uz-otur" gecikme={0.45}>Tüm ustaları gör</HapLink>
                <HapLink to="/hesap-olustur?rol=yazilimci" tur="cam" className="uz-otur" gecikme={0.52}>Usta olarak katıl</HapLink>
            </div>
        </Sahne>
    )
}

export default Ustalar
