import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import useSayfaBasligi from '../useSayfaBasligi'
import { SonucYok, FiltreCipi } from '../components/liste/ListeAraclari'
import { Sahne, HapLink } from '../components/uzay/Hareket'
import { OneCikanYazi, YaziKarti, IskeletKart } from '../components/yazi/YaziKartlari'
import { blogOnizlemesi } from './blogOnizleme'
import { SAYFA_ETIKETLERI } from '../paylasimEtiketleri'

function BlogListesi() {
    useSayfaBasligi(SAYFA_ETIKETLERI.blog.baslik, SAYFA_ETIKETLERI.blog.aciklama)
    const [yazilar, setYazilar] = useState([])
    const [yukleniyor, setYukleniyor] = useState(true)
    const [hata, setHata] = useState(false)
    const [parametreler, setParametreler] = useSearchParams()
    const kategori = parametreler.get('kategori') || ''

    // Geliştirmede ?onizleme=1 ile örnek yazılar (canlıda yok)
    const [onizleme] = useState(() => (import.meta.env.DEV ? blogOnizlemesi(new URLSearchParams(window.location.search).get('onizleme')) : null))

    useEffect(() => {
        if (onizleme) {
            setYazilar(onizleme)
            setYukleniyor(false)
            return
        }
        let iptal = false
        supabase
            .from('blog_yazilari')
            .select('id, baslik, slug, kategori, ozet, icerik, kapak_gorseli_url, created_at')
            .eq('yayinlandi', true)
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
                if (iptal) return
                if (error) setHata(true)
                else setYazilar(data || [])
                setYukleniyor(false)
            })
        return () => {
            iptal = true
        }
    }, [onizleme])

    const kategoriler = useMemo(() => {
        const sayac = new Map()
        for (const y of yazilar) if (y.kategori) sayac.set(y.kategori, (sayac.get(y.kategori) || 0) + 1)
        return [...sayac.entries()].sort((a, b) => b[1] - a[1])
    }, [yazilar])

    const gorunen = kategori ? yazilar.filter((y) => y.kategori === kategori) : yazilar
    const [oneCikan, ...digerleri] = gorunen

    function kategoriSec(k) {
        const yeni = new URLSearchParams(parametreler)
        if (k) yeni.set('kategori', k)
        else yeni.delete('kategori')
        setParametreler(yeni, { replace: true })
    }

    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />
            <section className="px-4 pb-28 pt-14 sm:px-8 lg:pt-20">
                <div className="mx-auto max-w-[1240px]">
                    <header className="max-w-[640px]">
                        <h1 className="font-pjs text-[clamp(2.2rem,4.4vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white">Blog</h1>
                        <p className="mt-3 text-[16px] font-light leading-relaxed text-gri">
                            Yazılım yaptıranlar ve yazılımcılar için rehberler: bütçe belirleme, iyi teklif, sözleşme ve teknoloji seçimi.
                        </p>
                    </header>

                    {kategoriler.length > 1 && (
                        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Kategoriye göre süz">
                            <FiltreCipi secili={!kategori} tikla={() => kategoriSec('')}>Tümü</FiltreCipi>
                            {kategoriler.map(([k, sayi]) => (
                                <FiltreCipi key={k} secili={kategori === k} tikla={() => kategoriSec(k)}>
                                    {k} <span className="tabular-nums text-gri-koyu">{sayi}</span>
                                </FiltreCipi>
                            ))}
                        </div>
                    )}

                    <Sahne className="mt-10" esik={0.01}>
                        {yukleniyor ? (
                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                <IskeletKart buyuk />
                                <IskeletKart />
                                <IskeletKart />
                                <IskeletKart />
                            </div>
                        ) : hata ? (
                            <SonucYok baslik="Yazılar yüklenemedi" metin="Bağlantını kontrol edip sayfayı yenile." />
                        ) : yazilar.length === 0 ? (
                            <SonucYok
                                baslik="Henüz yayınlanmış yazı yok"
                                metin="İlk rehberler hazırlanıyor. O zamana kadar açık ilanlara ya da ustaların portföylerine göz atabilirsin."
                                eylem={<HapLink to="/is-ilanlari">İş ilanları</HapLink>}
                            />
                        ) : gorunen.length === 0 ? (
                            <SonucYok baslik="Bu kategoride yazı yok" metin="Başka bir kategori seç ya da tüm yazılara dön." eylem={<button type="button" onClick={() => kategoriSec('')} className="uz-hap isik-hap">Tüm yazılar</button>} />
                        ) : (
                            <div className="space-y-5">
                                <div className="uz-otur">
                                    <OneCikanYazi yazi={oneCikan} />
                                </div>
                                {digerleri.length > 0 && (
                                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                        {digerleri.map((y, i) => (
                                            <div key={y.id} className="uz-otur" style={{ '--d': `${Math.min(i, 5) * 0.06}s` }}>
                                                <YaziKarti yazi={y} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </Sahne>
                </div>
            </section>
        </div>
    )
}

export default BlogListesi
