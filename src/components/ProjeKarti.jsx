import { useState } from 'react'
import { Link } from 'react-router-dom'
import { dilRengi, zamanFarki } from '../ustaYardimcilari'
import './uzay/uzay.css'

// Portföy işi kartı: profil sayfası ve profil düzenleme kullanır. Kapak görseli yoksa (ya da
// yüklenemezse) başlıktan türeyen noktalı ışık deseni. Canlı bağlantı, kart bağlantısının
// içinde değil yanında durur: iç içe bağlantı geçersizdir ve klavyede tek odak olarak kalır.
function adOzeti(metin) {
    let h = 0
    for (const harf of metin || '') h = (h * 31 + harf.charCodeAt(0)) >>> 0
    return h
}

function ProjeKarti({ proje, aksiyon }) {
    const [gorselHatasi, setGorselHatasi] = useState(false)
    const teknolojiler = proje.teknolojiler || []
    const anaTeknoloji = teknolojiler[0]
    const h = adOzeti(proje.baslik)
    const kapak = proje.kapak_gorseli_url && !gorselHatasi

    return (
        <div className="group h-full">
            <article className="isik-kart flex h-full flex-col overflow-hidden">
                <Link to={`/proje/${proje.id}`} className="flex flex-1 flex-col rounded-[20px] focus-visible:outline-offset-[-2px]">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-t-[19px]">
                        {kapak ? (
                            <img src={proje.kapak_gorseli_url} alt="" loading="lazy" decoding="async" onError={() => setGorselHatasi(true)} className="vitrin-gorsel h-full w-full object-cover" />
                        ) : (
                            <span aria-hidden className="vitrin-desen" style={{ '--vx': `${20 + (h % 60)}%`, '--vy': `${30 + ((h >> 6) % 40)}%` }} />
                        )}
                        <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
                        {proje.one_cikan && (
                            <span className="uz-etiket absolute left-4 top-4 bg-black/60">
                                <svg viewBox="0 0 24 24" className="h-3 w-3 text-mor-acik" fill="currentColor" aria-hidden>
                                    <path d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />
                                </svg>
                                Öne çıkan
                            </span>
                        )}
                    </div>
                    <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                        <h3 className="text-[17px] font-medium leading-snug tracking-[-0.01em] text-white transition-colors group-hover:text-mor-soluk">{proje.baslik}</h3>
                        {proje.aciklama && <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-gri">{proje.aciklama}</p>}
                        {teknolojiler.length > 0 && (
                            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Teknolojiler">
                                {teknolojiler.slice(0, 5).map((t) => (
                                    <li key={t} className="uz-etiket font-kod text-[11px]">
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <span aria-hidden className="min-h-4 flex-1" />
                        <div className="flex items-center gap-4 text-[12.5px] text-gri-koyu">
                            {anaTeknoloji && (
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dilRengi(anaTeknoloji) }} aria-hidden />
                                    {anaTeknoloji}
                                </span>
                            )}
                            {proje.created_at && <span>{zamanFarki(proje.created_at)} eklendi</span>}
                        </div>
                    </div>
                </Link>

                {(proje.link || aksiyon) && (
                    <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] px-5 py-3">
                        {proje.link ? (
                            <a href={proje.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-mor-soluk hover:text-white">
                                Canlı gör
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
                                    <path d="M14 4h6v6M20 4l-9 9M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h14a1 1 0 001-1v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="sr-only">(yeni sekmede açılır)</span>
                            </a>
                        ) : (
                            <span />
                        )}
                        {aksiyon}
                    </div>
                )}
            </article>
        </div>
    )
}

export default ProjeKarti
