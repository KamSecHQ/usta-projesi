import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import ProjeKarti from '../components/ProjeKarti'
import FavoriButonu from '../components/FavoriButonu'
import MesajlasDugmesi from '../components/MesajlasDugmesi'
import DegerlendirmeListesi from '../components/degerlendirme/DegerlendirmeListesi'
import { YildizGosterge } from '../components/degerlendirme/Yildizlar'
import { hakkindakiDegerlendirmeler, degerlendirmeOzeti } from '../components/degerlendirme/degerlendirmeVerisi'
import { SonucYok } from '../components/liste/ListeAraclari'
import { HapLink, Ok } from '../components/uzay/Hareket'
import Ikon from '../components/mesaj/Ikon'
import { cevrimiciMi, musaitlikBilgisi, ucretAraligiGoster, videoEmbedUrl, kidemRozetiHesapla, tamamlananIsSayisiGetir } from '../ustaYardimcilari'

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return '?'
    return adSoyad
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((k) => k[0].toLocaleUpperCase('tr-TR'))
        .join('')
}

function adOzeti(metin) {
    let h = 0
    for (const harf of metin || '') h = (h * 31 + harf.charCodeAt(0)) >>> 0
    return h
}

const ayYil = (tarih) => new Date(tarih).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })

function Bolum({ id, baslik, children, ek }) {
    return (
        <section id={id} className="scroll-mt-24" aria-labelledby={`${id}-baslik`}>
            <div className="mb-5 flex items-end justify-between gap-4">
                <h2 id={`${id}-baslik`} className="text-[24px] font-medium tracking-[-0.02em] text-white">
                    {baslik}
                </h2>
                {ek}
            </div>
            {children}
        </section>
    )
}

function Rozet({ children, renk = 'text-[#E4E4E7]', zemin = 'bg-white/[0.06]' }) {
    return <span className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium ${renk} ${zemin}`}>{children}</span>
}

function UstaProfili() {
    const { id } = useParams()
    const { user } = useAuth()
    const [profil, setProfil] = useState(null)
    const [projeler, setProjeler] = useState([])
    const [kidem, setKidem] = useState(null)
    const [tamamlanan, setTamamlanan] = useState(0)
    const [degerlendirmeler, setDegerlendirmeler] = useState([])
    const [ajansUyeleri, setAjansUyeleri] = useState([])
    const [uyesiOldugum, setUyesiOldugum] = useState(null)
    const [yukleniyor, setYukleniyor] = useState(true)
    const [bulunamadi, setBulunamadi] = useState(false)
    useSayfaBasligi(profil ? `${profil.ad_soyad || 'Usta'} — ${profil.unvan || 'Portföy'}` : 'Portföy', profil?.bio?.replace(/\s+/g, ' ').slice(0, 155))

    useEffect(() => {
        let iptal = false
        async function veriGetir() {
            setYukleniyor(true)
            const { data: profilData, error: profilHata } = await supabase.from('profiller').select('*').eq('id', id).single()
            if (iptal) return
            if (profilHata || !profilData) {
                setBulunamadi(true)
                setYukleniyor(false)
                return
            }

            const ajansSorgusu =
                profilData.profil_tipi === 'ajans'
                    ? supabase.from('ajans_davetleri').select('davet_edilen_id, rol_aciklamasi, profiller!ajans_davetleri_davet_edilen_id_fkey(ad_soyad, unvan, avatar_url)').eq('ajans_id', id).eq('durum', 'kabul_edildi')
                    : supabase.from('ajans_davetleri').select('ajans_id, profiller!ajans_davetleri_ajans_id_fkey(ad_soyad)').eq('davet_edilen_id', id).eq('durum', 'kabul_edildi').maybeSingle()

            const [{ data: projeData }, tamamlanan, yorumlar, ajansSonuc] = await Promise.all([
                supabase.from('projeler').select('*').eq('kullanici_id', id).order('created_at', { ascending: false }),
                tamamlananIsSayisiGetir(supabase, id),
                hakkindakiDegerlendirmeler(supabase, id),
                ajansSorgusu,
            ])
            if (iptal) return

            // Öne çıkan işler önce
            const sirali = (projeData || []).slice().sort((a, b) => (a.one_cikan === b.one_cikan ? 0 : a.one_cikan ? -1 : 1))
            setProfil(profilData)
            setProjeler(sirali)
            setKidem(kidemRozetiHesapla(profilData.rol, tamamlanan))
            setTamamlanan(tamamlanan)
            if (profilData.profil_tipi === 'ajans') setAjansUyeleri(ajansSonuc.data || [])
            else setUyesiOldugum(ajansSonuc.data || null)

            // Geliştirmede ?onizleme=degerlendirme ile örnek değerlendirmeler (canlıda yok)
            if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('onizleme') === 'degerlendirme') {
                const once = (g) => new Date(Date.now() - g * 864e5).toISOString()
                setDegerlendirmeler([
                    { id: 'o1', puan: 5, yorum: 'İletişimi çok iyiydi, her hafta demo gösterdi. Siteyi söz verdiği tarihten önce teslim etti.', created_at: once(3), degerlendiren: { ad_soyad: 'Örnek İş Veren' }, ilan: { baslik: 'Kafemiz için menü ve sipariş sayfası' } },
                    { id: 'o2', puan: 4, yorum: 'İşini iyi biliyor; bir iki küçük düzeltme için ek süre gerekti.', created_at: once(40), degerlendiren: { ad_soyad: 'Örnek İş Veren İki' }, ilan: { baslik: 'Kurumsal web sitesi' } },
                    { id: 'o3', puan: 5, yorum: null, created_at: once(90), degerlendiren: { ad_soyad: 'Örnek İş Veren Üç' }, ilan: null },
                ])
            } else {
                setDegerlendirmeler(yorumlar)
            }
            setYukleniyor(false)
        }
        veriGetir()
        return () => {
            iptal = true
        }
    }, [id])

    if (yukleniyor) {
        return (
            <div className="min-h-screen bg-black px-4 pt-20 sm:px-8" role="status" aria-label="Profil yükleniyor">
                <div className="mx-auto max-w-[1180px] animate-pulse motion-reduce:animate-none">
                    <div className="h-[220px] rounded-[28px] bg-white/[0.04]" />
                    <div className="-mt-14 ml-8 h-28 w-28 rounded-full border-4 border-black bg-white/[0.08]" />
                    <div className="mt-6 h-10 w-80 rounded-xl bg-white/[0.06]" />
                    <div className="mt-3 h-5 w-48 rounded-lg bg-white/[0.05]" />
                </div>
            </div>
        )
    }

    if (bulunamadi) {
        return (
            <div className="uzay flex min-h-screen items-center px-4">
                <SonucYok BaslikEtiketi="h1" baslik="Usta bulunamadı" metin="Profil kaldırılmış ya da bağlantı hatalı olabilir." eylem={<HapLink to="/ustalar">Ustalara göz at</HapLink>} />
            </div>
        )
    }

    const teknolojiler = profil.teknolojiler || []
    const mus = musaitlikBilgisi(profil.musaitlik)
    const ucret = ucretAraligiGoster(profil.saatlik_ucret_min, profil.saatlik_ucret_max)
    const gomulVideo = videoEmbedUrl(profil.video_url)
    const cevrimici = cevrimiciMi(profil.son_gorulme)
    const ozet = degerlendirmeOzeti(degerlendirmeler)
    const kendiProfilim = user?.id === profil.id
    const yazilimci = profil.rol !== 'is-veren'
    const vitrin = projeler.find((p) => p.kapak_gorseli_url)
    const h = adOzeti(profil.ad_soyad || profil.id)

    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />
            <section className="px-4 pb-28 pt-10 sm:px-8 lg:pt-12">
                <div className="mx-auto max-w-[1180px]">
                    <Link to="/ustalar" className="inline-flex items-center gap-2 text-[14px] text-gri hover:text-white">
                        <span className="inline-flex rotate-180">
                            <Ok />
                        </span>
                        Ustalar
                    </Link>

                    {!profil.onayli && (
                        <p className="mt-4 rounded-[14px] border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-[14px] text-gri">
                            Bu profil henüz yönetici onayından geçmedi; Ustalar listesinde ve aramada görünmüyor, yalnızca bu bağlantıyla açılıyor.
                        </p>
                    )}

                    {/* Vitrin: öne çıkan işin kapağı ya da addan türeyen ışık */}
                    <div className="relative mt-6 h-[180px] overflow-hidden rounded-[28px] border border-white/[0.08] sm:h-[230px]">
                        {vitrin ? (
                            <img src={vitrin.kapak_gorseli_url} alt="" className="h-full w-full object-cover opacity-80" />
                        ) : (
                            <span aria-hidden className="vitrin-desen" style={{ '--vx': `${20 + (h % 60)}%`, '--vy': `${30 + ((h >> 6) % 40)}%` }} />
                        )}
                        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    </div>

                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="min-w-0">
                            {/* Kimlik */}
                            <div className="relative -mt-14 ml-4 h-28 w-28 sm:ml-8">
                                {profil.avatar_url ? (
                                    <img src={profil.avatar_url} alt="" className="h-full w-full rounded-full object-cover ring-[5px] ring-black" />
                                ) : (
                                    <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-[34px] font-semibold text-black ring-[5px] ring-black">{baslangicHarfleri(profil.ad_soyad)}</span>
                                )}
                                {cevrimici && (
                                    <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-[#4ADE80] ring-4 ring-black" title="Şu an çevrimiçi">
                                        <span className="sr-only">Şu an çevrimiçi</span>
                                    </span>
                                )}
                            </div>

                            <h1 className="mt-5 text-balance font-pjs text-[clamp(2.2rem,4.4vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white">{profil.ad_soyad || 'İsimsiz Usta'}</h1>
                            {profil.unvan && <p className="mt-2 text-[19px] text-mor-soluk">{profil.unvan}</p>}

                            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-gri">
                                {ozet.adet > 0 && (
                                    <a href="#degerlendirmeler" className="inline-flex items-center gap-2 hover:text-white">
                                        <YildizGosterge puan={ozet.ortalama} boyut="h-4 w-4" />
                                        <span className="rakam">
                                            {ozet.ortalama.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} · {ozet.adet} değerlendirme
                                        </span>
                                    </a>
                                )}
                                {profil.konum && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Ikon ad="konum" className="h-4 w-4" />
                                        {profil.konum}
                                    </span>
                                )}
                                {uyesiOldugum && (
                                    <Link to={`/ustalar/${uyesiOldugum.ajans_id}`} className="hover:text-white">
                                        {uyesiOldugum.profiller?.ad_soyad} ajansının üyesi
                                    </Link>
                                )}
                                {profil.created_at && <span>{ayYil(profil.created_at)} tarihinden beri Kalfahane’de</span>}
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {profil.onayli && (
                                    <Rozet renk="text-mor-soluk" zemin="bg-mor/15">
                                        <Ikon ad="tik" className="h-3.5 w-3.5" kalinlik={2.2} /> Onaylı usta
                                    </Rozet>
                                )}
                                {profil.telefon_dogrulandi && (
                                    <Rozet renk="text-[#86EFAC]" zemin="bg-[#4ADE80]/10">
                                        <Ikon ad="kalkan" className="h-3.5 w-3.5" /> Kimlik doğrulandı
                                    </Rozet>
                                )}
                                {profil.profil_tipi === 'ajans' && <Rozet>Ajans</Rozet>}
                                {/* Kıdem herkese açık tamamlanan iş sayısından (tamamlanan_is_sayilari) */}
                                {kidem && (
                                    <Rozet renk="text-white">
                                        <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: kidem.renk, boxShadow: `0 0 8px ${kidem.renk}` }} />
                                        Kıdem: {kidem.etiket}
                                    </Rozet>
                                )}
                            </div>

                            {profil.bio && <p className="mt-8 max-w-[68ch] whitespace-pre-line text-[17px] font-light leading-[1.7] text-[#D4D4D8]">{profil.bio}</p>}

                            {teknolojiler.length > 0 && (
                                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Teknolojiler">
                                    {teknolojiler.map((t) => (
                                        <li key={t} className="uz-etiket h-8 px-3 font-kod text-[12.5px]">
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Çalışma paneli */}
                        <aside className="lg:sticky lg:top-24 lg:mt-6 lg:self-start" aria-label="Bu ustayla çalış">
                            <div className="rounded-[24px] border border-white/[0.08] bg-[#08080D] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_30px_60px_-40px_rgba(139,92,246,0.5)]">
                                <dl className="grid gap-5">
                                    <div>
                                        <dt className="text-[13px] text-gri-koyu">Müsaitlik</dt>
                                        <dd className="mt-1 flex items-center gap-2 text-[16px] text-white">
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: mus.renk, boxShadow: `0 0 10px ${mus.renk}` }} aria-hidden />
                                            {mus.etiket}
                                        </dd>
                                        {profil.musaitlik === 'kismi_musait' && profil.musaitlik_notu && <dd className="mt-1 text-[13.5px] text-gri">{profil.musaitlik_notu}</dd>}
                                    </div>
                                    {ucret && (
                                        <div>
                                            <dt className="text-[13px] text-gri-koyu">Saatlik ücret</dt>
                                            <dd className="rakam mt-1 text-[22px] font-medium tracking-[-0.01em] text-mor-soluk">{ucret}</dd>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-3 gap-4 border-t border-white/[0.07] pt-5">
                                        <div>
                                            <dt className="text-[12.5px] text-gri-koyu">Portföy işi</dt>
                                            <dd className="rakam mt-0.5 text-[18px] text-white">{projeler.length}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-[12.5px] text-gri-koyu">Tamamlanan</dt>
                                            <dd className="rakam mt-0.5 text-[18px] text-white">{tamamlanan}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-[12.5px] text-gri-koyu">Değerlendirme</dt>
                                            <dd className="rakam mt-0.5 text-[18px] text-white">{ozet.adet ? ozet.ortalama.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—'}</dd>
                                        </div>
                                    </div>
                                </dl>

                                <div className="mt-6 flex flex-col gap-2.5">
                                    {kendiProfilim ? (
                                        <HapLink to="/profilim" className="justify-center">
                                            Profilimi düzenle
                                        </HapLink>
                                    ) : (
                                        <>
                                            {yazilimci && (
                                                <HapLink to={user ? '/ilan-ver' : '/hesap-olustur?rol=is-veren'} className="justify-center">
                                                    İlan aç, teklif iste
                                                </HapLink>
                                            )}
                                            <MesajlasDugmesi karsiId={profil.id} className="isik isik-mor w-full rounded-full px-5 py-3 text-[14px] font-semibold">
                                                Mesaj gönder
                                            </MesajlasDugmesi>
                                        </>
                                    )}
                                    <div className="flex items-center justify-between gap-3 pt-1">
                                        {profil.github_url ? (
                                            <a href={profil.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[14px] font-medium text-gri hover:text-white">
                                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                                                    <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z" />
                                                </svg>
                                                GitHub
                                                <span className="sr-only">(yeni sekmede açılır)</span>
                                            </a>
                                        ) : (
                                            <span />
                                        )}
                                        <FavoriButonu ustaId={profil.id} />
                                    </div>
                                </div>
                                {!kendiProfilim && <p className="mt-5 text-[12.5px] leading-relaxed text-gri-koyu">Ödeme Kalfahane üzerinden yapılmaz; şartları mesajlaşmada netleştirirsiniz. Emanet ödeme sistemi yakında.</p>}
                            </div>
                        </aside>
                    </div>

                    <div className="mt-20 flex flex-col gap-20">
                        {gomulVideo ? (
                            <Bolum id="tanitim" baslik="Tanıtım">
                                <div className="aspect-video max-w-[860px] overflow-hidden rounded-[22px] border border-white/[0.08]">
                                    <iframe src={gomulVideo} title={`${profil.ad_soyad || 'Usta'} tanıtım videosu`} className="h-full w-full" loading="lazy" allowFullScreen />
                                </div>
                            </Bolum>
                        ) : (
                            profil.video_url && (
                                <a href={profil.video_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[15px] font-medium text-mor-soluk hover:text-white">
                                    Tanıtım videosunu izle <Ok />
                                    <span className="sr-only">(yeni sekmede açılır)</span>
                                </a>
                            )
                        )}

                        {profil.profil_tipi === 'ajans' && ajansUyeleri.length > 0 && (
                            <Bolum id="ekip" baslik="Ekip">
                                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {ajansUyeleri.map((u) => (
                                        <li key={u.davet_edilen_id}>
                                            <Link to={`/ustalar/${u.davet_edilen_id}`} className="flex items-center gap-3 rounded-[18px] border border-white/[0.08] bg-white/[0.02] p-4 hover:border-mor/40">
                                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[14px] font-semibold text-black">{baslangicHarfleri(u.profiller?.ad_soyad)}</span>
                                                <span className="min-w-0">
                                                    <span className="block truncate text-[15px] font-medium text-white">{u.profiller?.ad_soyad}</span>
                                                    <span className="block truncate text-[13px] text-gri">{u.rol_aciklamasi || u.profiller?.unvan}</span>
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </Bolum>
                        )}

                        {yazilimci && (
                            <Bolum id="portfoy" baslik="Portföy" ek={projeler.length > 0 && <span className="rakam text-[14px] text-gri">{projeler.length} iş</span>}>
                                {projeler.length === 0 ? (
                                    <SonucYok baslik="Henüz portföy işi yok" metin={kendiProfilim ? 'İlk işini ekle; usta kartındaki vitrin ve bu bölüm ondan beslenir.' : 'Bu usta henüz portföyüne iş eklemedi.'} eylem={kendiProfilim && <HapLink to="/profilim#projeler">Portföy işi ekle</HapLink>} />
                                ) : (
                                    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                        {projeler.map((p) => (
                                            <li key={p.id}>
                                                <ProjeKarti proje={p} />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Bolum>
                        )}

                        <Bolum id="degerlendirmeler" baslik="Değerlendirmeler">
                            <DegerlendirmeListesi liste={degerlendirmeler} kimeAit={yazilimci ? 'Bu usta' : 'Bu iş veren'} />
                        </Bolum>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default UstaProfili
