import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import { AramaKutusu, FiltreCipi, SonucYok } from '../components/liste/ListeAraclari'
import { HapLink } from '../components/uzay/Hareket'
import { useBildirim, useOnay } from '../components/bildirim/bildirimBaglami'
import MesajlasDugmesi from '../components/MesajlasDugmesi'
import Ikon from '../components/mesaj/Ikon'
import { portfoyleriGetir } from '../ustaVerisi'
import { profilGucuMaddeleri, profilGucuYuzdesi } from '../profilGucu'
import { aramaIcinKatla, zamanFarki } from '../ustaYardimcilari'
import '../components/uzay/uzay.css'
import { adminOnizlemesi } from './adminOnizleme'

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return '?'
    return adSoyad.split(' ').filter(Boolean).slice(0, 2).map((k) => k[0].toLocaleUpperCase('tr-TR')).join('')
}

const ikincilDugme = 'inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-[13.5px] text-[#E4E4E7] transition-colors hover:border-white/[0.2] hover:bg-white/[0.06] hover:text-white'

function ProfilSatiri({ profil, projeSayisi, eylem, telefonuDogrula }) {
    const teknolojiler = profil.teknolojiler || []
    const maddeler = profilGucuMaddeleri(profil, { projeSayisi, telefon: profil.telefon || '' })
    const guc = profilGucuYuzdesi(maddeler)
    const eksikler = maddeler.filter((m) => !m.dolu).map((m) => m.etiket)

    return (
        <article className="rounded-[20px] border border-white/[0.08] bg-[#0A0A0F] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-4">
                    {profil.avatar_url ? (
                        <img src={profil.avatar_url} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                    ) : (
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[15px] font-semibold text-black">{baslangicHarfleri(profil.ad_soyad)}</span>
                    )}
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <h3 className="text-[17px] font-medium tracking-[-0.01em] text-white">{profil.ad_soyad || 'İsimsiz usta'}</h3>
                            <span className="text-[12.5px] text-gri-koyu">{zamanFarki(profil.created_at)} katıldı</span>
                        </div>
                        {profil.unvan && <p className="mt-0.5 text-[14.5px] text-mor-soluk">{profil.unvan}</p>}
                        {profil.bio && <p className="mt-3 line-clamp-3 max-w-[64ch] text-[14.5px] font-light leading-relaxed text-[#D4D4D8]">{profil.bio}</p>}
                        {teknolojiler.length > 0 && (
                            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Teknolojiler">
                                {teknolojiler.map((t) => (
                                    <li key={t} className="rounded-full border border-white/[0.1] px-2.5 py-0.5 font-kod text-[12px] text-[#D4D4D8]">{t}</li>
                                ))}
                            </ul>
                        )}

                        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
                            <div className="flex items-center gap-1.5">
                                <dt className="text-gri-koyu">Profil gücü</dt>
                                <dd className={`rakam font-medium ${guc >= 75 ? 'text-mor-soluk' : 'text-white'}`}>%{guc}</dd>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <dt className="text-gri-koyu">Portföy</dt>
                                <dd className="rakam text-white">{projeSayisi} iş</dd>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <dt className="text-gri-koyu">Telefon</dt>
                                <dd className="flex items-center gap-2 text-white">
                                    {profil.telefon ? (
                                        <>
                                            <a href={`tel:${profil.telefon.replace(/[^\d+]/g, '')}`} className="rakam hover:text-mor-soluk">{profil.telefon}</a>
                                            {profil.telefon_dogrulandi ? (
                                                <span className="inline-flex items-center gap-1 text-[#86EFAC]">
                                                    <Ikon ad="tik" className="h-3.5 w-3.5" kalinlik={2.2} /> Doğrulandı
                                                </span>
                                            ) : (
                                                <button type="button" onClick={() => telefonuDogrula(profil)} className="text-mor-soluk underline decoration-mor-soluk/40 underline-offset-[3px] hover:text-white">
                                                    Doğrulandı işaretle
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-gri">Eklenmemiş</span>
                                    )}
                                </dd>
                            </div>
                        </dl>
                        {eksikler.length > 0 && <p className="mt-2 text-[12.5px] text-gri-koyu">Eksik: {eksikler.join(', ')}</p>}
                    </div>
                </div>

                <div className="grid shrink-0 gap-2 sm:grid-cols-3 lg:w-[200px] lg:grid-cols-1">
                    {eylem}
                    <a href={`/ustalar/${profil.id}`} target="_blank" rel="noopener noreferrer" className={ikincilDugme}>
                        Profili aç
                        <Ikon ad="disBaglanti" className="h-3.5 w-3.5" />
                        <span className="sr-only">(yeni sekmede)</span>
                    </a>
                    <MesajlasDugmesi karsiId={profil.id} className={`${ikincilDugme} w-full`}>
                        Ustaya yaz
                    </MesajlasDugmesi>
                </div>
            </div>
        </article>
    )
}

function Iskelet() {
    return (
        <div className="space-y-3" aria-hidden>
            {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-4 rounded-[20px] border border-white/[0.06] bg-[#0A0A0F] p-6">
                    <span className="h-12 w-12 shrink-0 rounded-full bg-white/[0.05] motion-safe:animate-pulse" />
                    <span className="flex-1 space-y-2.5">
                        <span className="block h-4 w-1/3 rounded-full bg-white/[0.06] motion-safe:animate-pulse" />
                        <span className="block h-3 w-1/4 rounded-full bg-white/[0.04] motion-safe:animate-pulse" />
                        <span className="block h-3 w-2/3 rounded-full bg-white/[0.04] motion-safe:animate-pulse" />
                    </span>
                </div>
            ))}
        </div>
    )
}

function AdminPanel() {
    useSayfaBasligi('Yönetim paneli')
    const { user: gercekKullanici, yukleniyor: authYukleniyor } = useAuth()
    // Geliştirmede ?onizleme=1 ile örnek veri (canlıda yok)
    const [onizleme] = useState(() => (import.meta.env.DEV ? adminOnizlemesi(new URLSearchParams(window.location.search).get('onizleme')) : null))
    const ornek = gercekKullanici ? null : onizleme
    const kullaniciId = gercekKullanici?.id || (ornek ? 'onizleme' : null)
    const bildir = useBildirim()
    const onayla = useOnay()
    const [adminMi, setAdminMi] = useState(null)
    const [sekme, setSekme] = useState('bekleyen')
    const [arama, setArama] = useState('')

    const [profiller, setProfiller] = useState([])
    const [portfoyler, setPortfoyler] = useState({})
    const [profillerYukleniyor, setProfillerYukleniyor] = useState(true)
    const [basvurular, setBasvurular] = useState([])
    const [basvuruFiltre, setBasvuruFiltre] = useState('tumu')

    useEffect(() => {
        if (!kullaniciId) return
        if (ornek) {
            setAdminMi(true)
            setProfiller(ornek.profiller)
            setPortfoyler(ornek.portfoyler)
            setBasvurular(ornek.basvurular)
            setProfillerYukleniyor(false)
            return
        }
        let iptal = false
        supabase.from('profiller').select('admin').eq('id', kullaniciId).single().then(({ data, error }) => {
            if (!iptal) setAdminMi(!error && Boolean(data?.admin))
        })
        return () => {
            iptal = true
        }
    }, [kullaniciId, ornek])

    const profilleriGetir = useCallback(async () => {
        const { data, error } = await supabase
            .from('profiller')
            .select('*')
            .eq('rol', 'yazilimci')
            .not('unvan', 'is', null)
            .order('created_at', { ascending: false })
        if (error || !data) {
            setProfillerYukleniyor(false)
            return
        }
        const idler = data.map((p) => p.id)
        const [{ data: iletisimler }, gruplu] = await Promise.all([
            supabase.from('profil_iletisim').select('id, telefon').in('id', idler),
            portfoyleriGetir(supabase, idler),
        ])
        const telefonlar = Object.fromEntries((iletisimler || []).map((i) => [i.id, i.telefon]))
        setProfiller(data.map((p) => ({ ...p, telefon: telefonlar[p.id] || null })))
        setPortfoyler(gruplu)
        setProfillerYukleniyor(false)
    }, [])

    useEffect(() => {
        if (!adminMi || ornek) return
        profilleriGetir()
        supabase.from('basvurular').select('*').order('created_at', { ascending: false }).then(({ data }) => setBasvurular(data || []))
    }, [adminMi, ornek, profilleriGetir])

    async function profiliGuncelle(profil, alanlar, basari) {
        if (ornek) {
            setProfiller((l) => l.map((p) => (p.id === profil.id ? { ...p, ...alanlar } : p)))
            bildir(basari)
            return
        }
        const { error } = await supabase.from('profiller').update(alanlar).eq('id', profil.id)
        if (error) {
            bildir('İşlem kaydedilemedi. Bağlantını kontrol edip tekrar dene.', { tur: 'hata' })
            return
        }
        bildir(basari)
        profilleriGetir()
    }

    function onayVer(profil) {
        profiliGuncelle(profil, { onayli: true }, `${profil.ad_soyad || 'Usta'} onaylandı; artık Ustalar listesinde.`)
    }

    async function onayiKaldir(profil) {
        const tamam = await onayla({
            baslik: 'Onay kaldırılsın mı?',
            metin: `${profil.ad_soyad || 'Bu usta'} Ustalar listesinden ve aramadan çıkar. Profili bağlantıyla açılmaya devam eder.`,
            onay: 'Onayı kaldır',
            tehlike: true,
        })
        if (tamam) profiliGuncelle(profil, { onayli: false }, 'Onay kaldırıldı.')
    }

    async function telefonuDogrula(profil) {
        const tamam = await onayla({
            baslik: 'Telefon doğrulandı olarak işaretlensin mi?',
            metin: 'Profilde "Kimlik doğrulandı" rozeti görünür. Numarayı arayarak ya da mesajla teyit ettiysen işaretle.',
            onay: 'İşaretle',
        })
        if (tamam) profiliGuncelle(profil, { telefon_dogrulandi: true }, 'Telefon doğrulandı olarak işaretlendi.')
    }

    const bekleyenler = useMemo(() => profiller.filter((p) => !p.onayli), [profiller])
    const onaylilar = useMemo(() => profiller.filter((p) => p.onayli), [profiller])
    const liste = sekme === 'bekleyen' ? bekleyenler : onaylilar
    const gorunen = useMemo(() => {
        const q = aramaIcinKatla(arama.trim())
        if (!q) return liste
        return liste.filter((p) => [p.ad_soyad, p.unvan, ...(p.teknolojiler || [])].some((v) => aramaIcinKatla(v || '').includes(q)))
    }, [liste, arama])
    const basvuruGorunen = basvuruFiltre === 'tumu' ? basvurular : basvurular.filter((b) => b.tip === basvuruFiltre)

    if (authYukleniyor || (kullaniciId && adminMi === null)) {
        return <div className="uzay min-h-screen" role="status" aria-label="Yükleniyor" />
    }

    if (!kullaniciId) {
        return (
            <div className="uzay flex min-h-screen items-center px-4">
                <SonucYok BaslikEtiketi="h1" baslik="Yönetim paneli için giriş yap" metin="Bu sayfa yalnızca platform yöneticilerine açık." eylem={<HapLink to="/giris">Giriş yap</HapLink>} />
            </div>
        )
    }

    if (!adminMi) {
        return (
            <div className="uzay flex min-h-screen items-center px-4">
                <SonucYok BaslikEtiketi="h1" baslik="Bu sayfayı görme yetkin yok" metin="Yönetim paneli yalnızca platform yöneticileri içindir." eylem={<HapLink to="/panel">Panelime dön</HapLink>} />
            </div>
        )
    }

    const sekmeler = [
        { id: 'bekleyen', ad: 'Onay bekleyen', sayi: bekleyenler.length },
        { id: 'onayli', ad: 'Onaylı ustalar', sayi: onaylilar.length },
        { id: 'basvuru', ad: 'Eski başvurular', sayi: basvurular.length },
    ]

    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />
            <section className="px-4 pb-28 pt-14 sm:px-8 lg:pt-20">
                <div className="mx-auto max-w-[1080px]">
                    <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
                        <div>
                            <h1 className="font-pjs text-[clamp(2.2rem,4.4vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white">Yönetim paneli</h1>
                            <p className="mt-3 text-[16px] font-light text-gri">Usta profillerini incele, onayla ve telefon doğrulamasını işaretle.</p>
                        </div>
                        <HapLink to="/admin/blog" tur="cam">Blog yönetimi</HapLink>
                    </header>

                    <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                        <div role="tablist" aria-label="Liste" className="flex flex-wrap gap-1 rounded-full border border-white/[0.07] bg-white/[0.02] p-1">
                            {sekmeler.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    role="tab"
                                    id={`sekme-${s.id}`}
                                    aria-selected={sekme === s.id}
                                    aria-controls="sekme-paneli"
                                    onClick={() => setSekme(s.id)}
                                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] transition-colors ${sekme === s.id ? 'bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]' : 'text-gri hover:text-white'}`}
                                >
                                    {s.ad}
                                    <span className={`rakam rounded-full px-1.5 text-[11.5px] ${s.id === 'bekleyen' && s.sayi > 0 ? 'bg-mor/25 text-mor-soluk' : 'text-gri-koyu'}`}>{s.sayi}</span>
                                </button>
                            ))}
                        </div>
                        {sekme !== 'basvuru' && (
                            <div className="w-full sm:w-[320px]">
                                <AramaKutusu deger={arama} degisti={setArama} yerTutucu="İsim, unvan ya da teknoloji" etiket="Ustalarda ara" />
                            </div>
                        )}
                    </div>

                    <div id="sekme-paneli" role="tabpanel" aria-labelledby={`sekme-${sekme}`} className="mt-6">
                        {sekme !== 'basvuru' ? (
                            profillerYukleniyor ? (
                                <Iskelet />
                            ) : gorunen.length === 0 ? (
                                <SonucYok
                                    baslik={arama ? `“${arama}” için sonuç yok` : sekme === 'bekleyen' ? 'Onay bekleyen profil yok' : 'Henüz onaylanmış usta yok'}
                                    metin={arama ? 'Başka bir isim ya da teknoloji dene.' : sekme === 'bekleyen' ? 'Unvanını dolduran yeni ustalar burada sıraya girer.' : 'Onay bekleyenler sekmesinden profilleri incele.'}
                                />
                            ) : (
                                <div className="space-y-3">
                                    {gorunen.map((p) => (
                                        <ProfilSatiri
                                            key={p.id}
                                            profil={p}
                                            projeSayisi={portfoyler[p.id]?.length || 0}
                                            telefonuDogrula={telefonuDogrula}
                                            eylem={
                                                p.onayli ? (
                                                    <button type="button" onClick={() => onayiKaldir(p)} className="isik isik-tehlike rounded-full px-4 py-2.5 text-[13.5px] font-medium">
                                                        Onayı kaldır
                                                    </button>
                                                ) : (
                                                    <button type="button" onClick={() => onayVer(p)} className="uz-hap isik-hap isik-hap-birincil justify-center">
                                                        Onayla
                                                    </button>
                                                )
                                            }
                                        />
                                    ))}
                                </div>
                            )
                        ) : (
                            <>
                                <p className="text-[14px] text-gri">Bu liste artık kullanılmayan eski başvuru formundan kalan kayıtlardır.</p>
                                <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Başvuru türü">
                                    <FiltreCipi secili={basvuruFiltre === 'tumu'} tikla={() => setBasvuruFiltre('tumu')}>Tümü</FiltreCipi>
                                    <FiltreCipi secili={basvuruFiltre === 'yazilimci'} tikla={() => setBasvuruFiltre('yazilimci')}>
                                        Yazılımcı <span className="rakam text-gri-koyu">{basvurular.filter((b) => b.tip === 'yazilimci').length}</span>
                                    </FiltreCipi>
                                    <FiltreCipi secili={basvuruFiltre === 'is-veren'} tikla={() => setBasvuruFiltre('is-veren')}>
                                        İş veren <span className="rakam text-gri-koyu">{basvurular.filter((b) => b.tip === 'is-veren').length}</span>
                                    </FiltreCipi>
                                </div>
                                {basvuruGorunen.length === 0 ? (
                                    <div className="mt-6">
                                        <SonucYok baslik="Bu türde başvuru yok" metin="Başka bir tür seç." />
                                    </div>
                                ) : (
                                    <ul className="mt-6 divide-y divide-white/[0.07] rounded-[20px] border border-white/[0.08] bg-[#0A0A0F]">
                                        {basvuruGorunen.map((b) => (
                                            <li key={b.id} className="grid gap-1 px-5 py-4 sm:grid-cols-[1.2fr_1.4fr_1fr_auto] sm:items-center sm:gap-4">
                                                <span className="text-[15px] font-medium text-white">{b.ad || 'İsimsiz'}</span>
                                                {b.email ? (
                                                    <a href={`mailto:${b.email}`} className="truncate text-[14px] text-mor-soluk hover:text-white">{b.email}</a>
                                                ) : (
                                                    <span className="text-[14px] text-gri">E-posta yok</span>
                                                )}
                                                <span className="truncate text-[14px] text-[#D4D4D8]">{b.uzmanlik || '—'}</span>
                                                <span className="flex items-center gap-3 text-[12.5px] text-gri-koyu sm:justify-end">
                                                    <span className="uz-etiket">{b.tip === 'is-veren' ? 'İş veren' : 'Yazılımcı'}</span>
                                                    <time className="rakam" dateTime={b.created_at}>{new Date(b.created_at).toLocaleDateString('tr-TR')}</time>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </div>

                    <p className="mt-10 text-[13px] text-gri-koyu">
                        Onaylanan ustalar <Link to="/ustalar" className="text-mor-soluk hover:text-white">Ustalar</Link> sayfasında ve aramada görünür. Onay ve telefon doğrulamasını yalnızca yöneticiler değiştirebilir (veritabanı kuralı).
                    </p>
                </div>
            </section>
        </div>
    )
}

export default AdminPanel
