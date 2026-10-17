import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import useSayfaBasligi from '../useSayfaBasligi'
import { SonucYok } from '../components/liste/ListeAraclari'
import { HapLink, Ok } from '../components/uzay/Hareket'
import YaziGovdesi from '../components/yazi/YaziGovdesi'
import { Kunye, YaziKarti } from '../components/yazi/YaziKartlari'
import { basliktanKimlik, bloklaraAyir } from '../components/yazi/yaziBicimi'
import useOkunanBolum from '../components/yazi/useOkunanBolum'
import { blogOnizlemesi } from './blogOnizleme'
import '../components/uzay/uzay.css'

const SITE = 'https://www.kalfahane.com'

// Arama motorları için makale bilgisi (JSON-LD). Sayfadan çıkınca kaldırılır.
function useMakaleVerisi(yazi) {
    useEffect(() => {
        if (!yazi) return
        const veri = {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: yazi.baslik,
            description: yazi.ozet || undefined,
            image: yazi.kapak_gorseli_url ? [yazi.kapak_gorseli_url] : [`${SITE}/og-image.png`],
            datePublished: yazi.created_at,
            dateModified: yazi.guncellenme_tarihi || yazi.created_at,
            articleSection: yazi.kategori || undefined,
            mainEntityOfPage: `${SITE}/blog/${yazi.slug}`,
            author: { '@type': 'Organization', name: 'Kalfahane', url: SITE },
            publisher: { '@type': 'Organization', name: 'Kalfahane', url: SITE },
        }
        const etiket = document.createElement('script')
        etiket.type = 'application/ld+json'
        etiket.textContent = JSON.stringify(veri)
        document.head.appendChild(etiket)
        return () => etiket.remove()
    }, [yazi])
}

function GeriBaglanti() {
    return (
        <Link to="/blog" className="inline-flex items-center gap-2 text-[14px] text-gri hover:text-white">
            <span className="inline-flex rotate-180">
                <Ok />
            </span>
            Blog
        </Link>
    )
}

function BlogYazisi() {
    const { slug } = useParams()
    const [yazi, setYazi] = useState(null)
    const [digerleri, setDigerleri] = useState([])
    const [durum, setDurum] = useState('yukleniyor')
    const [kapakHatasi, setKapakHatasi] = useState(false)
    useSayfaBasligi(yazi ? yazi.baslik : 'Blog', yazi?.ozet?.replace(/\s+/g, ' ').slice(0, 155))
    useMakaleVerisi(yazi)

    // Geliştirmede ?onizleme=1 ile örnek yazı (canlıda yok)
    const [onizleme] = useState(() => (import.meta.env.DEV ? blogOnizlemesi(new URLSearchParams(window.location.search).get('onizleme')) : null))

    useEffect(() => {
        let iptal = false
        setDurum('yukleniyor')
        setKapakHatasi(false)
        if (onizleme) {
            const ana = onizleme.find((y) => y.slug === slug)
            setYazi(ana || null)
            setDigerleri(onizleme.filter((y) => y.slug !== slug).slice(0, 3))
            setDurum(ana ? 'hazir' : 'yok')
            return
        }
        Promise.all([
            supabase.from('blog_yazilari').select('*').eq('slug', slug).eq('yayinlandi', true).maybeSingle(),
            supabase
                .from('blog_yazilari')
                .select('id, baslik, slug, kategori, ozet, icerik, kapak_gorseli_url, created_at')
                .eq('yayinlandi', true)
                .neq('slug', slug)
                .order('created_at', { ascending: false })
                .limit(3),
        ]).then(([ana, diger]) => {
            if (iptal) return
            if (ana.error || !ana.data) {
                setDurum('yok')
                return
            }
            setYazi(ana.data)
            setDigerleri(diger.data || [])
            setDurum('hazir')
        })
        return () => {
            iptal = true
        }
    }, [slug, onizleme])

    const basliklar = useMemo(
        () => (yazi ? bloklaraAyir(yazi.icerik).filter((b) => b.tur === 'h2').map((b) => ({ metin: b.metin, kimlik: basliktanKimlik(b.metin) })) : []),
        [yazi]
    )
    const kimlikler = useMemo(() => basliklar.map((b) => b.kimlik), [basliklar])
    const aktifBolum = useOkunanBolum(kimlikler)
    const icindekilerVar = basliklar.length >= 2

    if (durum === 'yukleniyor') {
        return (
            <div className="uzay min-h-screen" role="status" aria-label="Yazı yükleniyor">
                <section className="mx-auto max-w-[760px] px-4 pt-20 sm:px-8" aria-hidden>
                    <div className="h-3 w-40 rounded-full bg-white/[0.05] motion-safe:animate-pulse" />
                    <div className="mt-6 h-10 w-4/5 rounded-full bg-white/[0.06] motion-safe:animate-pulse" />
                    <div className="mt-4 h-4 w-3/5 rounded-full bg-white/[0.04] motion-safe:animate-pulse" />
                    <div className="mt-12 space-y-3">
                        {[100, 96, 98, 70].map((g) => (
                            <div key={g} className="h-3 rounded-full bg-white/[0.04] motion-safe:animate-pulse" style={{ width: `${g}%` }} />
                        ))}
                    </div>
                </section>
            </div>
        )
    }

    if (durum === 'yok') {
        return (
            <div className="uzay flex min-h-screen items-center px-4">
                <SonucYok BaslikEtiketi="h1" baslik="Yazı bulunamadı" metin="Yazı kaldırılmış ya da bağlantı hatalı olabilir." eylem={<HapLink to="/blog">Tüm yazılar</HapLink>} />
            </div>
        )
    }

    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />
            <article className="px-4 pb-24 pt-12 sm:px-8 lg:pt-16">
                <div className="mx-auto max-w-[1080px]">
                    <GeriBaglanti />

                    <div className={icindekilerVar ? 'lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-14' : 'mx-auto max-w-[760px]'}>
                        <header className={`mt-8 max-w-[760px] ${icindekilerVar ? 'lg:col-start-2' : ''}`}>
                            <Kunye yazi={yazi} />
                            <h1 className="mt-4 text-balance font-pjs text-[clamp(2.1rem,4.6vw,3.4rem)] font-medium leading-[1.06] tracking-[-0.032em] text-white">
                                {yazi.baslik}
                            </h1>
                            {yazi.ozet && <p className="mt-5 text-pretty text-[19px] font-light leading-relaxed text-[#C9C9D1]">{yazi.ozet}</p>}
                        </header>

                        {yazi.kapak_gorseli_url && !kapakHatasi && (
                            <figure className={`mt-10 overflow-hidden rounded-[24px] border border-white/[0.08] ${icindekilerVar ? 'lg:col-span-2' : ''}`}>
                                <img src={yazi.kapak_gorseli_url} alt="" decoding="async" onError={() => setKapakHatasi(true)} className="aspect-[16/8] w-full object-cover" />
                            </figure>
                        )}

                        {icindekilerVar && (
                            <nav aria-label="İçindekiler" className="icindekiler mt-12 hidden lg:block">
                                <div className="sticky top-28">
                                    <p className="mb-3 text-[12.5px] font-medium text-gri">Bu yazıda</p>
                                    {basliklar.map((b) => (
                                        <a key={b.kimlik} href={`#${b.kimlik}`} aria-current={aktifBolum === b.kimlik ? 'true' : undefined}>
                                            {b.metin}
                                        </a>
                                    ))}
                                </div>
                            </nav>
                        )}
                        <YaziGovdesi metin={yazi.icerik} className="mt-12" />
                    </div>
                </div>
            </article>

            <section className="border-t border-white/[0.06] px-4 pb-28 pt-16 sm:px-8">
                <div className="mx-auto max-w-[1240px]">
                    <div className="uz-panel flex flex-wrap items-center justify-between gap-6 px-7 py-8 sm:px-10">
                        <div className="relative max-w-[560px]">
                            <h2 className="text-[clamp(1.35rem,2.4vw,1.75rem)] font-medium leading-tight tracking-[-0.02em] text-white">Projen için usta mı arıyorsun?</h2>
                            <p className="mt-2 text-[15px] font-light leading-relaxed text-gri">İşini tarif et, ilanını aç; uygun ustalar sana teklif getirsin. İlan açmak ücretsiz.</p>
                        </div>
                        <div className="relative flex flex-wrap gap-3">
                            <HapLink to="/ilan-ver">İlan aç</HapLink>
                            <HapLink to="/ustalar" tur="cam">Ustalara göz at</HapLink>
                        </div>
                    </div>

                    {digerleri.length > 0 && (
                        <>
                            <h2 className="mt-16 text-[22px] font-medium tracking-[-0.02em] text-white">Diğer yazılar</h2>
                            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {digerleri.map((y) => (
                                    <YaziKarti key={y.id} yazi={y} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    )
}

export default BlogYazisi
