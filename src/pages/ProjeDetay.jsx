import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import { cevrimiciMi, zamanFarki } from '../ustaYardimcilari'
import { SonucYok } from '../components/liste/ListeAraclari'
import { HapLink, Ok } from '../components/uzay/Hareket'
import MesajlasDugmesi from '../components/MesajlasDugmesi'
import ProjeKarti from '../components/ProjeKarti'
import '../components/uzay/uzay.css'

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return '?'
    return adSoyad.split(' ').filter(Boolean).slice(0, 2).map((k) => k[0].toLocaleUpperCase('tr-TR')).join('')
}

function adOzeti(metin) {
    let h = 0
    for (const harf of metin || '') h = (h * 31 + harf.charCodeAt(0)) >>> 0
    return h
}

function Anlati({ baslik, children }) {
    if (!children) return null
    return (
        <section className="border-t border-white/[0.07] pt-8 first:border-t-0 first:pt-0">
            <h2 className="text-[clamp(1.25rem,2vw,1.45rem)] font-medium tracking-[-0.02em] text-white">{baslik}</h2>
            <p className="mt-3 max-w-[68ch] whitespace-pre-line text-[17px] font-light leading-[1.75] text-[#D4D4D8]">{children}</p>
        </section>
    )
}

function ProjeDetay() {
    const { id } = useParams()
    const { user } = useAuth()
    const [proje, setProje] = useState(null)
    const [sahip, setSahip] = useState(null)
    const [digerleri, setDigerleri] = useState([])
    const [durum, setDurum] = useState('yukleniyor')
    const [kapakHatasi, setKapakHatasi] = useState(false)

    useSayfaBasligi(proje ? proje.baslik : 'Proje', (proje?.problem || proje?.aciklama)?.replace(/\s+/g, ' ').slice(0, 155))

    useEffect(() => {
        let iptal = false
        async function veriGetir() {
            setDurum('yukleniyor')
            setKapakHatasi(false)
            const { data: projeData, error } = await supabase.from('projeler').select('*').eq('id', id).maybeSingle()
            if (iptal) return
            if (error || !projeData) {
                setDurum('yok')
                return
            }
            const [sahipYaniti, digerYaniti] = await Promise.all([
                supabase.from('profiller').select('id, ad_soyad, unvan, avatar_url, onayli, son_gorulme').eq('id', projeData.kullanici_id).maybeSingle(),
                supabase
                    .from('projeler')
                    .select('*')
                    .eq('kullanici_id', projeData.kullanici_id)
                    .neq('id', projeData.id)
                    .order('one_cikan', { ascending: false })
                    .order('created_at', { ascending: false })
                    .limit(3),
            ])
            if (iptal) return
            setProje(projeData)
            setSahip(sahipYaniti.data)
            setDigerleri(digerYaniti.data || [])
            setDurum('hazir')
        }
        veriGetir()
        return () => {
            iptal = true
        }
    }, [id])

    if (durum === 'yukleniyor') {
        return (
            <div className="uzay min-h-screen" role="status" aria-label="Proje yükleniyor">
                <section className="mx-auto max-w-[1180px] px-4 pt-16 sm:px-8" aria-hidden>
                    <div className="h-3 w-32 rounded-full bg-white/[0.05] motion-safe:animate-pulse" />
                    <div className="mt-8 h-11 w-2/3 rounded-full bg-white/[0.06] motion-safe:animate-pulse" />
                    <div className="mt-10 aspect-[16/8] rounded-[28px] bg-white/[0.03] motion-safe:animate-pulse" />
                </section>
            </div>
        )
    }

    if (durum === 'yok') {
        return (
            <div className="uzay flex min-h-screen items-center px-4">
                <SonucYok BaslikEtiketi="h1" baslik="Proje bulunamadı" metin="Proje kaldırılmış ya da bağlantı hatalı olabilir." eylem={<HapLink to="/ustalar">Ustalara göz at</HapLink>} />
            </div>
        )
    }

    const teknolojiler = proje.teknolojiler || []
    const anlatiVar = proje.problem || proje.cozum || proje.sonuc
    const kendiProjem = user?.id === proje.kullanici_id
    const h = adOzeti(proje.baslik)
    const canliAdres = /^https?:\/\//i.test(proje.link || '') ? proje.link : null

    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />
            <section className="px-4 pb-24 pt-10 sm:px-8 lg:pt-12">
                <div className="mx-auto max-w-[1180px]">
                    <Link to={sahip ? `/ustalar/${sahip.id}` : '/ustalar'} className="inline-flex items-center gap-2 text-[14px] text-gri hover:text-white">
                        <span className="inline-flex rotate-180">
                            <Ok />
                        </span>
                        {sahip?.ad_soyad ? `${sahip.ad_soyad} · portföy` : 'Ustalar'}
                    </Link>

                    <header className="mt-8 max-w-[860px]">
                        {proje.one_cikan && (
                            <span className="uz-etiket mb-4">
                                <svg viewBox="0 0 24 24" className="h-3 w-3 text-mor-acik" fill="currentColor" aria-hidden>
                                    <path d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />
                                </svg>
                                Öne çıkan iş
                            </span>
                        )}
                        <h1 className="text-balance font-pjs text-[clamp(2.1rem,4.4vw,3.3rem)] font-medium leading-[1.05] tracking-[-0.03em] text-white">{proje.baslik}</h1>
                        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14.5px] text-gri">
                            {proje.rol && (
                                <span>
                                    Rolü: <span className="text-white">{proje.rol}</span>
                                </span>
                            )}
                            {proje.rol && proje.created_at && <span aria-hidden>·</span>}
                            {proje.created_at && <span>{zamanFarki(proje.created_at)} eklendi</span>}
                        </p>
                        {teknolojiler.length > 0 && (
                            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Kullanılan teknolojiler">
                                {teknolojiler.map((t) => (
                                    <li key={t} className="rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1 font-mono text-[12.5px] text-[#D4D4D8]">
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </header>

                    <figure className={`relative mt-10 overflow-hidden rounded-[28px] border border-white/[0.08] ${proje.kapak_gorseli_url && !kapakHatasi ? 'aspect-[16/8]' : 'h-[200px] sm:h-[260px]'}`}>
                        {proje.kapak_gorseli_url && !kapakHatasi ? (
                            <img src={proje.kapak_gorseli_url} alt={`${proje.baslik} ekran görüntüsü`} decoding="async" onError={() => setKapakHatasi(true)} className="h-full w-full object-cover" />
                        ) : (
                            <span aria-hidden className="vitrin-desen" style={{ '--vx': `${20 + (h % 60)}%`, '--vy': `${30 + ((h >> 6) % 40)}%` }} />
                        )}
                    </figure>

                    <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
                        <div className="space-y-8">
                            {anlatiVar ? (
                                <>
                                    <Anlati baslik="Problem">{proje.problem}</Anlati>
                                    <Anlati baslik="Çözüm">{proje.cozum}</Anlati>
                                    <Anlati baslik="Sonuç">{proje.sonuc}</Anlati>
                                </>
                            ) : proje.aciklama ? (
                                <Anlati baslik="Proje hakkında">{proje.aciklama}</Anlati>
                            ) : (
                                <p className="max-w-[60ch] text-[16px] font-light leading-relaxed text-gri">
                                    Bu iş için henüz ayrıntılı bir anlatım eklenmemiş.
                                    {kendiProjem && (
                                        <>
                                            {' '}
                                            <Link to="/profilim#projeler" className="text-mor-soluk underline decoration-mor-soluk/40 underline-offset-[3px] hover:text-white">
                                                Problem, çözüm ve sonucu ekle
                                            </Link>
                                            ; iş verenler en çok bunları okur.
                                        </>
                                    )}
                                </p>
                            )}
                        </div>

                        <aside className="lg:sticky lg:top-28 lg:self-start">
                            <div className="uz-panel px-6 py-6">
                                {sahip && (
                                    <Link to={`/ustalar/${sahip.id}`} className="relative flex items-center gap-4 rounded-2xl">
                                        <span className="relative h-14 w-14 shrink-0">
                                            {sahip.avatar_url ? (
                                                <img src={sahip.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-[18px] font-semibold text-black">{baslangicHarfleri(sahip.ad_soyad)}</span>
                                            )}
                                            {cevrimiciMi(sahip.son_gorulme) && (
                                                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-[#4ADE80] ring-[3px] ring-[#06060A]">
                                                    <span className="sr-only">Şu an çevrimiçi</span>
                                                </span>
                                            )}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate text-[16px] font-medium text-white">{sahip.ad_soyad || 'İsimsiz usta'}</span>
                                            {sahip.unvan && <span className="block truncate text-[14px] text-mor-soluk">{sahip.unvan}</span>}
                                        </span>
                                    </Link>
                                )}

                                <div className="relative mt-6 flex flex-col gap-2.5">
                                    {canliAdres && (
                                        <a href={canliAdres} target="_blank" rel="noopener noreferrer" className="uz-hap isik-hap isik-hap-birincil w-full">
                                            Canlı projeyi gör
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-[14px] w-[14px]">
                                                <path d="M14 4h6v6" />
                                                <path d="M20 4l-9 9" />
                                                <path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
                                            </svg>
                                            <span className="sr-only">(yeni sekmede açılır)</span>
                                        </a>
                                    )}
                                    {kendiProjem ? (
                                        <HapLink to="/profilim#projeler" tur="cam" className="w-full">
                                            Bu işi düzenle
                                        </HapLink>
                                    ) : (
                                        sahip && (
                                            <>
                                                <MesajlasDugmesi karsiId={sahip.id} className="isik isik-mor w-full rounded-full px-5 py-3 text-[14px] font-semibold">
                                                    Ustaya yaz
                                                </MesajlasDugmesi>
                                                <HapLink to={`/ustalar/${sahip.id}`} tur="cam" className="w-full">
                                                    Profili incele
                                                </HapLink>
                                            </>
                                        )
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {digerleri.length > 0 && (
                <section className="border-t border-white/[0.06] px-4 pb-28 pt-16 sm:px-8">
                    <div className="mx-auto max-w-[1180px]">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <h2 className="text-[22px] font-medium tracking-[-0.02em] text-white">Aynı ustanın diğer işleri</h2>
                            {sahip && (
                                <Link to={`/ustalar/${sahip.id}`} className="text-[14px] font-medium text-mor-soluk hover:text-white">
                                    Tüm portföy
                                </Link>
                            )}
                        </div>
                        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {digerleri.map((p) => (
                                <ProjeKarti key={p.id} proje={p} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}

export default ProjeDetay
