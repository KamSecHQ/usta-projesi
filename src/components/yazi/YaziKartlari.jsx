import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Ok } from '../uzay/Hareket'
import { okumaSuresi } from './yaziBicimi'
import '../uzay/uzay.css'

// Blog kartları: liste sayfası ve yazının altındaki "diğer yazılar".

const tarihGoster = (t) => new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

function adOzeti(metin) {
    let h = 0
    for (const harf of metin || '') h = (h * 31 + harf.charCodeAt(0)) >>> 0
    return h
}

function Kapak({ yazi, oran = 'aspect-[16/9]' }) {
    const [hata, setHata] = useState(false)
    const h = adOzeti(yazi.baslik)
    return (
        <div className={`relative ${oran} overflow-hidden`}>
            {yazi.kapak_gorseli_url && !hata ? (
                <img src={yazi.kapak_gorseli_url} alt="" loading="lazy" decoding="async" onError={() => setHata(true)} className="vitrin-gorsel h-full w-full object-cover" />
            ) : (
                <span aria-hidden className="vitrin-desen" style={{ '--vx': `${20 + (h % 60)}%`, '--vy': `${30 + ((h >> 6) % 40)}%` }} />
            )}
            <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
        </div>
    )
}

export function Kunye({ yazi }) {
    return (
        <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-gri-koyu tabular-nums">
            {yazi.kategori && <span className="text-mor-soluk">{yazi.kategori}</span>}
            {yazi.kategori && <span aria-hidden>·</span>}
            <time dateTime={yazi.created_at}>{tarihGoster(yazi.created_at)}</time>
            <span aria-hidden>·</span>
            <span>{okumaSuresi(yazi.icerik)} dk okuma</span>
        </p>
    )
}

export function OneCikanYazi({ yazi }) {
    return (
        <div className="group">
            <article className="isik-kart overflow-hidden">
                <Link to={`/blog/${yazi.slug}`} className="grid rounded-[20px] lg:grid-cols-[1.25fr_1fr] focus-visible:outline-offset-[-2px]">
                    <Kapak yazi={yazi} oran="aspect-[16/9] lg:aspect-auto lg:min-h-[340px]" />
                    <div className="flex flex-col justify-center p-7 sm:p-9">
                        <Kunye yazi={yazi} />
                        <h2 className="mt-3 text-balance font-pjs text-[clamp(1.6rem,2.8vw,2.2rem)] font-medium leading-[1.12] tracking-[-0.025em] text-white">{yazi.baslik}</h2>
                        {yazi.ozet && <p className="mt-4 line-clamp-4 text-[16px] font-light leading-relaxed text-gri">{yazi.ozet}</p>}
                        <span className="mt-7 inline-flex items-center gap-2 text-[14px] font-medium text-mor-soluk">
                            Yazıyı oku <Ok />
                        </span>
                    </div>
                </Link>
            </article>
        </div>
    )
}

export function YaziKarti({ yazi }) {
    return (
        <div className="group h-full">
            <article className="isik-kart flex h-full flex-col overflow-hidden">
                <Link to={`/blog/${yazi.slug}`} className="flex flex-1 flex-col rounded-[20px] focus-visible:outline-offset-[-2px]">
                    <Kapak yazi={yazi} />
                    <div className="flex flex-1 flex-col p-6">
                        <Kunye yazi={yazi} />
                        <h2 className="mt-2.5 text-[19px] font-medium leading-snug tracking-[-0.015em] text-white">{yazi.baslik}</h2>
                        {yazi.ozet && <p className="mt-2 line-clamp-3 text-[14.5px] font-light leading-relaxed text-gri">{yazi.ozet}</p>}
                    </div>
                </Link>
            </article>
        </div>
    )
}

export function IskeletKart({ buyuk }) {
    return (
        <div className={`overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#0A0A0F] ${buyuk ? 'lg:col-span-full' : ''}`} aria-hidden>
            <div className="aspect-[16/9] motion-safe:animate-pulse bg-white/[0.03]" />
            <div className="space-y-3 p-6">
                <div className="h-3 w-1/3 motion-safe:animate-pulse rounded-full bg-white/[0.05]" />
                <div className="h-5 w-3/4 motion-safe:animate-pulse rounded-full bg-white/[0.06]" />
                <div className="h-3 w-full motion-safe:animate-pulse rounded-full bg-white/[0.04]" />
            </div>
        </div>
    )
}
