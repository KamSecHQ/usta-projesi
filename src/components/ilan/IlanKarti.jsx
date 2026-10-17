import { Link } from 'react-router-dom'
import { butceGoster, zamanFarki } from '../../ustaYardimcilari'
import { Ok } from '../uzay/Hareket'

// İlan kartı: /is-ilanlari listesi ve ilan sihirbazının canlı önizlemesi aynı kartı kullanır.
const YENI_GUN = 3

// onizleme: sihirbazdaki canlı önizleme; bağlantı yerine düz kart çizilir
export default function IlanKarti({ ilan, isVeren, sira = 0, onizleme = false }) {
    const teknolojiler = ilan.gerekli_teknolojiler || []
    const butce = butceGoster(ilan.butce_min, ilan.butce_max)
    // Kartta yalnızca ilk paragraf (özet): sihirbazın soru-cevap bölümleri ilan sayfasında okunur
    const ozet = (ilan.aciklama || '').split(/\n{2,}/)[0]
    const yeni = Date.now() - new Date(ilan.created_at).getTime() < YENI_GUN * 864e5

    const Kap = onizleme ? 'div' : Link
    const kapOzellik = onizleme ? { className: 'group block h-full rounded-[20px]' } : { to: `/is-ilanlari/${ilan.id}`, className: 'uz-otur group block h-full rounded-[20px]', style: { '--d': `${0.1 + sira * 0.06}s` } }
    return (
        <Kap {...kapOzellik}>
            <article className="isik-kart flex h-full flex-col p-6 sm:p-7">
                <div className="flex items-center justify-between gap-3 text-[13px] text-gri-koyu">
                    <span className="flex items-center gap-2">
                        {yeni && <span className="uz-etiket bg-mor/20 text-mor-soluk">Yeni</span>}
                        <time dateTime={ilan.created_at}>{onizleme ? 'şimdi' : zamanFarki(ilan.created_at)}</time>
                    </span>
                    {isVeren?.ad_soyad && <span className="truncate">{isVeren.ad_soyad}</span>}
                </div>

                <h2 className="mt-4 text-[20px] font-medium leading-snug tracking-[-0.015em] text-white">{ilan.baslik || 'İlan başlığın burada görünecek'}</h2>
                {ozet && <p className="mt-2.5 line-clamp-3 text-[14.5px] font-light leading-relaxed text-gri">{ozet}</p>}

                {teknolojiler.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Gereken teknolojiler">
                        {teknolojiler.slice(0, 5).map((t) => (
                            <li key={t} className="uz-etiket font-kod text-[11px]">
                                {t}
                            </li>
                        ))}
                        {teknolojiler.length > 5 && <li className="uz-etiket text-[11px] text-gri">+{teknolojiler.length - 5}</li>}
                    </ul>
                )}

                <span aria-hidden className="min-h-6 flex-1" />
                <div className="flex items-end justify-between gap-4 border-t border-white/[0.08] pt-4">
                    <div>
                        <p className="text-[12px] text-gri-koyu">Bütçe</p>
                        <p className="rakam mt-0.5 text-[18px] font-medium tracking-[-0.01em] text-mor-soluk">{butce || 'Teklife açık'}</p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-[14px] font-medium text-white">
                        İncele, teklif ver
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                            <Ok />
                        </span>
                    </span>
                </div>
            </article>
        </Kap>
    )
}

export function IskeletIlan() {
    return <div className="h-[290px] animate-pulse rounded-[20px] border border-white/[0.06] bg-cam motion-reduce:animate-none" />
}
