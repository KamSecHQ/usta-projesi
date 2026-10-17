import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { profilGucuMaddeleri, profilGucuYuzdesi } from '../profilGucu'
import { useBildirim } from '../components/bildirim/bildirimBaglami'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import {
    kidemRozetiHesapla,
    sonrakiKidemHesapla,
    tamamlananIsSayisiGetir,
    MUSAITLIK_BILGISI,
} from '../ustaYardimcilari'
import { onizlemeVerisi } from './panelOnizleme'
import GirisKapisi from '../components/hesap/GirisKapisi'

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad.split(" ").filter(Boolean).slice(0, 2).map((k) => k[0].toLocaleUpperCase('tr-TR')).join("")
}

function zamanOnce(tarih) {
    const dk = Math.round((Date.now() - new Date(tarih).getTime()) / 60000)
    if (dk < 1) return 'şimdi'
    if (dk < 60) return `${dk} dk önce`
    const sa = Math.round(dk / 60)
    if (sa < 24) return `${sa} sa önce`
    const gun = Math.round(sa / 24)
    if (gun < 30) return `${gun} gün önce`
    return `${Math.round(gun / 30)} ay önce`
}

const TEKLIF_DURUM = {
    beklemede: { etiket: 'Beklemede', renk: '#C4B5FD' },
    kabul_edildi: { etiket: 'Kabul edildi', renk: '#4ADE80' },
    reddedildi: { etiket: 'Reddedildi', renk: '#71717A' },
}

const RUTBELER_YAZILIMCI = [
    { etiket: 'Çırak', esik: 0 },
    { etiket: 'Kalfa', esik: 1 },
    { etiket: 'Usta', esik: 3 },
    { etiket: 'Kıdemli Usta', esik: 10 },
]
const RUTBELER_ISVEREN = [
    { etiket: 'Yeni İş Veren', esik: 0 },
    { etiket: 'Güvenilir İş Veren', esik: 1 },
    { etiket: 'Kıdemli İş Veren', esik: 5 },
]

// ---------------------------------------------------------------------------
// Küçük yapı taşları
// ---------------------------------------------------------------------------

// Sayarak açılan sayı
function Sayac({ deger, renk = '#fff' }) {
    const [gosterilen, setGosterilen] = useState(0)
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setGosterilen(deger)
            return
        }
        let kare
        const bas = performance.now()
        const adim = (t) => {
            const k = Math.min(1, (t - bas) / 900)
            setGosterilen(Math.round((1 - Math.pow(1 - k, 4)) * deger))
            if (k < 1) kare = requestAnimationFrame(adim)
        }
        kare = requestAnimationFrame(adim)
        return () => cancelAnimationFrame(kare)
    }, [deger])
    return (
        <span className="tabular-nums" style={{ color: renk }}>
            {gosterilen}
        </span>
    )
}

// Dairesel ilerleme halkası
function Halka({ oran, boyut = 96, kalinlik = 6, renk = '#A78BFA', children }) {
    const r = (boyut - kalinlik) / 2
    const cevre = 2 * Math.PI * r
    return (
        <div className="relative shrink-0" style={{ width: boyut, height: boyut }}>
            <svg width={boyut} height={boyut} className="-rotate-90" aria-hidden>
                <circle cx={boyut / 2} cy={boyut / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={kalinlik} />
                <circle
                    cx={boyut / 2}
                    cy={boyut / 2}
                    r={r}
                    fill="none"
                    stroke={renk}
                    strokeWidth={kalinlik}
                    strokeLinecap="round"
                    strokeDasharray={cevre}
                    strokeDashoffset={cevre * (1 - Math.max(0, Math.min(1, oran)))}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)', filter: `drop-shadow(0 0 6px ${renk}99)` }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">{children}</div>
        </div>
    )
}

function Kart({ baslik, sag, className = '', children }) {
    return (
        <section className={`isik-kutu p-6 ${className}`}>
            {(baslik || sag) && (
                <div className="mb-5 flex items-center justify-between gap-3">
                    {baslik && <h2 className="text-[15px] font-medium text-white">{baslik}</h2>}
                    {sag}
                </div>
            )}
            {children}
        </section>
    )
}

function Ikon({ ad }) {
    const ortak = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', className: 'h-5 w-5' }
    const yollar = {
        ilan: <path d="M12 5v14M5 12h14" />,
        ara: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
        profil: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
        teklif: <><path d="M4 6h16v10H8l-4 4V6z" /></>,
        ajans: <><circle cx="8" cy="9" r="3" /><circle cx="16" cy="9" r="3" /><path d="M2 20a6 6 0 0 1 12 0M10 20a6 6 0 0 1 12 0" /></>,
        kalp: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
        link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
        goz: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
        liste: <><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></>,
        tamam: <path d="m5 12 5 5 9-10" />,
        mesaj: <><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" /><path d="M8 10h8M8 13.5h5" /></>,
    }
    return <svg {...ortak}>{yollar[ad]}</svg>
}

// Hızlı eylem kutucuğu: ışıklı cam
function Eylem({ to, onClick, ikon, baslik, alt, vurgu }) {
    const ic = (
        <>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${vurgu ? 'border-[#A78BFA]/50 bg-[#8B5CF6]/20 text-white' : 'border-white/[0.1] bg-white/[0.05] text-[#C4B5FD]'}`}>
                <Ikon ad={ikon} />
            </span>
            <span className="mt-4 block text-[15px] font-medium text-white">{baslik}</span>
            <span className="mt-0.5 block text-[13px] text-[#A1A1AA]">{alt}</span>
        </>
    )
    const sinif = 'isik-kutu flex flex-col items-start justify-start p-5 text-left'
    return to ? (
        <Link to={to} className={sinif}>
            {ic}
        </Link>
    ) : (
        <button type="button" onClick={onClick} className={sinif}>
            {ic}
        </button>
    )
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------
function Dashboard() {
    useSayfaBasligi('Panelim')
    const { user: gercekKullanici, yukleniyor: authYukleniyor } = useAuth()
    // Geliştirmede ?onizleme=yazilimci|is-veren ile örnek veriyle panel görülebilir (canlıda yok)
    const onizleme = import.meta.env.DEV ? onizlemeVerisi(new URLSearchParams(window.location.search).get('onizleme')) : null
    const user = gercekKullanici || onizleme?.user || null

    const [profil, setProfil] = useState(null)
    const [projeSayisi, setProjeSayisi] = useState(0)
    const [favoriSayisi, setFavoriSayisi] = useState(0)
    const [tamamlanan, setTamamlanan] = useState(0)
    const [kidem, setKidem] = useState(null)
    const [sonrakiKidem, setSonrakiKidem] = useState(null)
    const [teklifOzet, setTeklifOzet] = useState({ beklemede: 0, kabul_edildi: 0, reddedildi: 0 })
    const [ilanOzet, setIlanOzet] = useState({ acik: 0, kapali: 0, tamamlandi: 0, bekleyenTeklif: 0 })
    const [okunmamisMesaj, setOkunmamisMesaj] = useState(0)
    const [ajansDavetleri, setAjansDavetleri] = useState([])
    const [hareketler, setHareketler] = useState([])
    const [musaitlik, setMusaitlik] = useState('musait')
    const [musaitlikKaydi, setMusaitlikKaydi] = useState('')
    const bildir = useBildirim()
    const [yukleniyor, setYukleniyor] = useState(true)

    async function veriGetir() {
        if (!user) return

        if (onizleme && !gercekKullanici) {
            const v = onizleme
            setProfil(v.profil)
            setMusaitlik(v.profil.musaitlik || 'musait')
            setProjeSayisi(v.projeSayisi)
            setFavoriSayisi(v.favoriSayisi)
            setTamamlanan(v.tamamlanan)
            setKidem(kidemRozetiHesapla(v.profil.rol, v.tamamlanan))
            setSonrakiKidem(sonrakiKidemHesapla(v.profil.rol, v.tamamlanan))
            setTeklifOzet(v.teklifOzet)
            setIlanOzet(v.ilanOzet)
            setHareketler(v.hareketler)
            setOkunmamisMesaj(2)
            setYukleniyor(false)
            return
        }

        supabase.rpc('okunmamis_sayilari').then(({ data }) => {
            if (data) setOkunmamisMesaj(data.reduce((t, r) => t + r.sayi, 0))
        })

        const [{ data: profilData }, { data: iletisim }] = await Promise.all([
            supabase.from('profiller').select('*').eq('id', user.id).single(),
            supabase.from('profil_iletisim').select('telefon').eq('id', user.id).maybeSingle(),
        ])
        if (!profilData) {
            setYukleniyor(false)
            return
        }
        setProfil({ ...profilData, telefon: iletisim?.telefon || null })
        setMusaitlik(profilData.musaitlik || 'musait')

        const sayi = await tamamlananIsSayisiGetir(supabase, user.id)
        setTamamlanan(sayi)
        setKidem(kidemRozetiHesapla(profilData.rol, sayi))
        setSonrakiKidem(sonrakiKidemHesapla(profilData.rol, sayi))

        if (profilData.rol === 'yazilimci') {
            const [{ count: pSayisi }, { count: fSayisi }, { data: teklifler }, { data: davetlerData }] = await Promise.all([
                supabase.from('projeler').select('*', { count: 'exact', head: true }).eq('kullanici_id', user.id),
                supabase.from('favoriler').select('*', { count: 'exact', head: true }).eq('usta_id', user.id),
                supabase.from('teklifler').select('*, ilanlar(id, baslik, durum)').eq('yazilimci_id', user.id).order('created_at', { ascending: false }),
                supabase
                    .from('ajans_davetleri')
                    .select('*, profiller!ajans_davetleri_ajans_id_fkey(ad_soyad, unvan)')
                    .eq('davet_edilen_id', user.id)
                    .eq('durum', 'beklemede'),
            ])
            setProjeSayisi(pSayisi || 0)
            setFavoriSayisi(fSayisi || 0)
            const ozet = { beklemede: 0, kabul_edildi: 0, reddedildi: 0 }
            for (const t of teklifler || []) ozet[t.durum] = (ozet[t.durum] || 0) + 1
            setTeklifOzet(ozet)
            setAjansDavetleri(davetlerData || [])
            setHareketler(
                (teklifler || []).slice(0, 5).map((t) => ({
                    id: t.id,
                    baslik: t.ilanlar?.baslik || 'İlan',
                    alt: t.teklif_tutari ? `₺${Number(t.teklif_tutari).toLocaleString('tr-TR')} teklif verdin` : 'Teklif verdin',
                    durum: t.durum,
                    tarih: t.created_at,
                    to: t.ilanlar?.id ? `/is-ilanlari/${t.ilanlar.id}` : '/tekliflerim',
                }))
            )
        }

        if (profilData.rol === 'is-veren') {
            const { data: ilanlar } = await supabase.from('ilanlar').select('id, baslik, durum').eq('is_veren_id', user.id)
            const liste = ilanlar || []
            const acik = liste.filter((i) => i.durum === 'acik').length
            const kapali = liste.filter((i) => i.durum === 'kapali').length
            const tamamlandi = liste.filter((i) => i.durum === 'tamamlandi').length
            let bekleyenTeklif = 0
            if (liste.length > 0) {
                const { data: gelenler } = await supabase
                    .from('teklifler')
                    .select('*, profiller!teklifler_yazilimci_id_fkey(ad_soyad)')
                    .in('ilan_id', liste.map((i) => i.id))
                    .order('created_at', { ascending: false })
                bekleyenTeklif = (gelenler || []).filter((t) => t.durum === 'beklemede').length
                const baslikBul = (id) => liste.find((i) => i.id === id)?.baslik || 'İlanın'
                setHareketler(
                    (gelenler || []).slice(0, 5).map((t) => ({
                        id: t.id,
                        baslik: `${t.profiller?.ad_soyad || 'Bir usta'} teklif verdi`,
                        alt: `${baslikBul(t.ilan_id)}${t.teklif_tutari ? ` · ₺${Number(t.teklif_tutari).toLocaleString('tr-TR')}` : ''}`,
                        durum: t.durum,
                        tarih: t.created_at,
                        to: '/ilanlarim',
                    }))
                )
            }
            setIlanOzet({ acik, kapali, tamamlandi, bekleyenTeklif })
        }

        setYukleniyor(false)
    }

    useEffect(() => {
        if (user) veriGetir()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])

    async function davetYanitla(davetId, yeniDurum) {
        await supabase.from('ajans_davetleri').update({ durum: yeniDurum }).eq('id', davetId)
        veriGetir()
    }

    // Müsaitlik anahtarı: profile anında yazılır
    async function musaitlikDegistir(yeni) {
        if (yeni === musaitlik) return
        const onceki = musaitlik
        setMusaitlik(yeni)
        setMusaitlikKaydi('kaydediliyor')
        if (onizleme && !gercekKullanici) {
            setMusaitlikKaydi('kaydedildi')
            return
        }
        const { error } = await supabase.from('profiller').update({ musaitlik: yeni }).eq('id', user.id)
        if (error) {
            setMusaitlik(onceki)
            setMusaitlikKaydi('hata')
        } else {
            setMusaitlikKaydi('kaydedildi')
        }
    }

    async function profilLinkiniKopyala() {
        const link = `${window.location.origin}/ustalar/${user.id}`
        try {
            await navigator.clipboard.writeText(link)
            bildir('Profil linkin kopyalandı')
        } catch {
            bildir(link)
        }
    }

    if (authYukleniyor || (user && yukleniyor)) {
        return (
            <div className="uzay relative min-h-screen px-6 pt-28" role="status" aria-label="Panel yükleniyor">
                <div className="uz-yildizlar" aria-hidden />
                <div className="relative mx-auto grid max-w-6xl animate-pulse gap-4 motion-reduce:animate-none md:grid-cols-3">
                    <div className="h-48 rounded-[20px] bg-white/[0.04] md:col-span-3" />
                    <div className="h-36 rounded-[20px] bg-white/[0.04]" />
                    <div className="h-36 rounded-[20px] bg-white/[0.04]" />
                    <div className="h-36 rounded-[20px] bg-white/[0.04]" />
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <GirisKapisi ikon="panel" baslik="Panelin seni bekliyor" metin="İlanların, tekliflerin, mesajların ve kıdem yolun tek ekranda. Görmek için giriş yap." />
        )
    }

    if (!profil) return null

    const yazilimci = profil.rol === 'yazilimci'

    // Profil gücü: gerçek alan doluluğuna dayalı (profilGucu.js; profil düzenlemede de aynı maddeler)
    const alanlar = profilGucuMaddeleri(profil, { projeSayisi, telefon: profil.telefon })
    const guc = profilGucuYuzdesi(alanlar)
    const eksikler = alanlar.filter((a) => !a.dolu)

    // Kıdem halkası: mevcut rütbeden bir sonrakine ilerleme
    const rutbeler = yazilimci ? RUTBELER_YAZILIMCI : RUTBELER_ISVEREN
    const simdikiIndex = rutbeler.reduce((s, r, i) => (tamamlanan >= r.esik ? i : s), 0)
    const sonraki = rutbeler[simdikiIndex + 1]
    const kidemOrani = sonraki ? (tamamlanan - rutbeler[simdikiIndex].esik) / (sonraki.esik - rutbeler[simdikiIndex].esik) : 1

    const mesajEylemi = {
        to: '/mesajlar',
        ikon: 'mesaj',
        baslik: 'Mesajlar',
        alt: okunmamisMesaj ? `${okunmamisMesaj} okunmamış mesaj` : 'Ustalarla ve iş verenlerle konuş',
        vurgu: okunmamisMesaj > 0,
    }

    const eylemler = yazilimci
        ? [
              { to: '/is-ilanlari', ikon: 'ara', baslik: 'İş ilanları', alt: 'Açık işlere teklif ver', vurgu: true },
              mesajEylemi,
              { to: '/tekliflerim', ikon: 'teklif', baslik: 'Tekliflerim', alt: `${teklifOzet.beklemede} beklemede` },
              { to: '/profilim', ikon: 'profil', baslik: 'Profilini düzenle', alt: `Profil gücü %${guc}` },
              { to: '/ajansim', ikon: 'ajans', baslik: 'Ajansım', alt: 'Ekibini kur, iş al' },
              { to: `/ustalar/${user.id}`, ikon: 'goz', baslik: 'Profilimi gör', alt: 'İş verenlerin gördüğü hali' },
              { onClick: profilLinkiniKopyala, ikon: 'link', baslik: 'Linki kopyala', alt: 'Profilini paylaş' },
              { to: '/blog', ikon: 'liste', baslik: 'İçerik merkezi', alt: 'Sektörden yazılar ve rehberler' },
          ]
        : [
              { to: '/ilan-ver', ikon: 'ilan', baslik: 'İlan ver', alt: 'Ücretsiz, birkaç dakikada', vurgu: true },
              mesajEylemi,
              { to: '/ilanlarim', ikon: 'liste', baslik: 'İlanlarım', alt: `${ilanOzet.acik} açık ilan` },
              { to: '/ustalar', ikon: 'ara', baslik: 'Ustaları keşfet', alt: 'Onaylı profilleri incele' },
              { to: '/favorilerim', ikon: 'kalp', baslik: 'Favorilerim', alt: 'Kaydettiğin ustalar' },
          ]

    const istatistikler = yazilimci
        ? [
              { etiket: 'Bekleyen teklif', deger: teklifOzet.beklemede, renk: '#C4B5FD' },
              { etiket: 'Kabul edilen', deger: teklifOzet.kabul_edildi, renk: '#4ADE80' },
              { etiket: 'Portföy projesi', deger: projeSayisi, renk: '#fff' },
              { etiket: 'Seni favorileyen', deger: favoriSayisi, renk: '#fff' },
          ]
        : [
              { etiket: 'Açık ilan', deger: ilanOzet.acik, renk: '#fff' },
              { etiket: 'Bekleyen teklif', deger: ilanOzet.bekleyenTeklif, renk: '#C4B5FD' },
              { etiket: 'Kapalı', deger: ilanOzet.kapali, renk: '#fff' },
              { etiket: 'Tamamlanan', deger: ilanOzet.tamamlandi, renk: '#4ADE80' },
          ]

    return (
        <div className="relative min-h-screen overflow-hidden bg-black px-4 pb-24 pt-24 sm:px-6 sm:pt-28">
            {/* Arka plan ışığı */}
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[1100px] -translate-x-1/2 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(139,92,246,0.22),transparent_70%)]" />

            <div className="relative mx-auto max-w-6xl">
                {/* Karşılama */}
                <section className="isik-kutu flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-5">
                        <Halka oran={kidemOrani} boyut={92} kalinlik={4} renk={kidem?.renk || '#A78BFA'}>
                            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] text-xl font-semibold text-[#050505]">
                                {baslangicHarfleri(profil.ad_soyad)}
                            </div>
                        </Halka>
                        <div className="min-w-0">
                            <p className="text-[13px] text-[#A1A1AA]">Panelin</p>
                            <h1 className="truncate text-[clamp(1.6rem,3vw,2.2rem)] font-medium tracking-[-0.02em] text-white">
                                Merhaba, {profil.ad_soyad?.split(' ')[0] || 'Usta'}
                            </h1>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {kidem && (
                                    <span className="rounded-full border px-3 py-1 text-xs font-medium" style={{ color: kidem.renk, borderColor: `${kidem.renk}55`, backgroundColor: `${kidem.renk}14` }}>
                                        {kidem.etiket}
                                    </span>
                                )}
                                {yazilimci && (
                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${profil.onayli ? 'bg-[#8B5CF6]/15 text-[#C4B5FD]' : 'bg-white/[0.06] text-[#A1A1AA]'}`}>
                                        {profil.onayli ? 'Onaylı usta' : 'Onay bekliyor'}
                                    </span>
                                )}
                                <span className="text-xs text-[#71717A]">⌘K ile her yerde ara</span>
                            </div>
                        </div>
                    </div>

                    {/* Müsaitlik anahtarı (yazılımcı) ya da ana eylem (iş veren) */}
                    {yazilimci ? (
                        <div>
                            <div className="mb-2 flex items-center justify-between gap-3 text-[13px]">
                                <span className="text-[#A1A1AA]">Müsaitlik durumun</span>
                                <span className="text-[#71717A]" aria-live="polite">
                                    {musaitlikKaydi === 'kaydediliyor' ? 'Kaydediliyor…' : musaitlikKaydi === 'kaydedildi' ? 'Kaydedildi' : musaitlikKaydi === 'hata' ? 'Kaydedilemedi, tekrar dene' : ''}
                                </span>
                            </div>
                            <div role="radiogroup" aria-label="Müsaitlik durumu" className="inline-flex flex-wrap gap-1 rounded-[22px] border border-white/[0.09] bg-white/[0.03] p-1">
                                {Object.entries(MUSAITLIK_BILGISI).map(([anahtar, b]) => {
                                    const secili = musaitlik === anahtar
                                    return (
                                        <button
                                            key={anahtar}
                                            role="radio"
                                            aria-checked={secili}
                                            onClick={() => musaitlikDegistir(anahtar)}
                                            className={`isik flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium ${secili ? 'isik-mor' : 'isik-cam border-transparent bg-transparent shadow-none'}`}
                                        >
                                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.renk, boxShadow: secili ? `0 0 10px ${b.renk}` : 'none' }} />
                                            {b.etiket}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <Link to="/ilan-ver" className="isik isik-birincil inline-flex items-center gap-2 self-start rounded-full px-6 py-3 text-sm font-medium lg:self-center">
                            <Ikon ad="ilan" /> Yeni ilan ver
                        </Link>
                    )}
                </section>

                {/* İstatistikler */}
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {istatistikler.map((s) => (
                        <div key={s.etiket} className="isik-kutu px-5 py-5">
                            <div className="text-[clamp(1.8rem,3vw,2.4rem)] font-medium leading-none tracking-[-0.02em]">
                                <Sayac deger={s.deger} renk={s.renk} />
                            </div>
                            <div className="mt-2 text-[13px] text-[#A1A1AA]">{s.etiket}</div>
                        </div>
                    ))}
                </div>

                {/* Hızlı eylemler */}
                <div className={`mt-4 grid grid-cols-2 gap-3 ${yazilimci ? 'md:grid-cols-4' : 'md:grid-cols-3 lg:grid-cols-5'}`}>
                    {eylemler.map((e) => (
                        <Eylem key={e.baslik} {...e} />
                    ))}
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    {/* Kıdem yolu */}
                    <Kart baslik="Kıdem yolun" className="lg:col-span-1">
                        <p className="mb-5 text-[13px] leading-relaxed text-[#A1A1AA]">
                            {sonrakiKidem ? (
                                <>
                                    <span className="font-medium text-white">{sonrakiKidem.etiket}</span> rozetine{' '}
                                    <span className="font-medium text-white">{sonrakiKidem.kalan}</span> tamamlanmış iş kaldı.
                                </>
                            ) : (
                                'En üst kıdem seviyesindesin.'
                            )}
                        </p>
                        <ol className="relative space-y-4 border-l border-white/[0.08] pl-5">
                            {rutbeler.map((r, i) => {
                                const gecti = i < simdikiIndex
                                const simdi = i === simdikiIndex
                                return (
                                    <li key={r.etiket} className="relative">
                                        <span
                                            className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full border ${simdi ? 'border-[#C4B5FD] bg-[#A78BFA]' : gecti ? 'border-[#8B5CF6] bg-[#8B5CF6]/60' : 'border-white/20 bg-black'}`}
                                            style={simdi ? { boxShadow: '0 0 12px #A78BFA' } : undefined}
                                        />
                                        <div className={`text-[14px] ${simdi ? 'font-medium text-white' : gecti ? 'text-[#C4B5FD]' : 'text-[#71717A]'}`}>{r.etiket}</div>
                                        <div className="text-[12px] text-[#71717A]">{r.esik === 0 ? 'Başlangıç' : `${r.esik}+ tamamlanan iş`}</div>
                                    </li>
                                )
                            })}
                        </ol>
                    </Kart>

                    {/* Profil gücü */}
                    <Kart baslik="Profil gücü" className="lg:col-span-1">
                        <div className="flex items-center gap-5">
                            <Halka oran={guc / 100} boyut={88} kalinlik={6} renk={guc === 100 ? '#4ADE80' : '#A78BFA'}>
                                <span className="text-[20px] font-medium tabular-nums text-white">%{guc}</span>
                            </Halka>
                            <p className="text-[13px] leading-relaxed text-[#A1A1AA]">
                                {guc === 100 ? 'Profilin eksiksiz. İş verenler seni ustalar listesinde ve profilinde tüm bilgilerinle görür.' : 'Eksik alanları doldurdukça iş verenler seni daha iyi tanır.'}
                            </p>
                        </div>
                        {eksikler.length > 0 && (
                            <ul className="mt-5 space-y-1.5">
                                {eksikler.slice(0, 4).map((a) => (
                                    <li key={a.etiket}>
                                        <Link to={`/profilim#${a.bolum}`} className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-[13px] text-[#A1A1AA] transition-colors hover:bg-white/[0.04] hover:text-white">
                                            <span>{a.etiket} ekle</span>
                                            <svg viewBox="0 0 12 10" className="h-[10px] w-3 text-[#8A8A94] transition-transform group-hover:translate-x-0.5" fill="none" aria-hidden>
                                                <path d="M0.8 5h10M7.1 1.4 10.9 5l-3.8 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Kart>

                    {/* Son hareketler */}
                    <Kart
                        baslik="Son hareketler"
                        sag={
                            <Link to={yazilimci ? '/tekliflerim' : '/ilanlarim'} className="text-[13px] text-[#C4B5FD] hover:text-white">
                                Tümü →
                            </Link>
                        }
                        className="lg:col-span-1"
                    >
                        {hareketler.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-white/[0.12] px-4 py-8 text-center">
                                <p className="text-[14px] text-white">Henüz hareket yok</p>
                                <p className="mt-1 text-[13px] text-[#A1A1AA]">
                                    {yazilimci ? 'İlk teklifini verdiğinde burada görünecek.' : 'İlanına teklif geldiğinde burada görünecek.'}
                                </p>
                                <Link to={yazilimci ? '/is-ilanlari' : '/ilan-ver'} className="isik isik-mor mt-4 inline-flex rounded-full px-4 py-2 text-[13px] font-medium">
                                    {yazilimci ? 'İlanlara göz at' : 'İlan ver'}
                                </Link>
                            </div>
                        ) : (
                            <ul className="space-y-1">
                                {hareketler.map((h) => {
                                    const d = TEKLIF_DURUM[h.durum] || TEKLIF_DURUM.beklemede
                                    return (
                                        <li key={h.id}>
                                            <Link to={h.to} className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/[0.04]">
                                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.renk, boxShadow: `0 0 8px ${d.renk}` }} />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-[14px] text-white">{h.baslik}</span>
                                                    <span className="block truncate text-[12.5px] text-[#A1A1AA]">{h.alt}</span>
                                                </span>
                                                <span className="shrink-0 text-right">
                                                    <span className="block text-[12px]" style={{ color: d.renk }}>{d.etiket}</span>
                                                    <span className="block text-[11.5px] text-[#71717A]">{zamanOnce(h.tarih)}</span>
                                                </span>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </Kart>
                </div>

                {/* Ajans davetleri */}
                {yazilimci && ajansDavetleri.length > 0 && (
                    <Kart baslik="Ajans davetlerin" className="mt-4">
                        <div className="flex flex-col gap-2">
                            {ajansDavetleri.map((d) => (
                                <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                                    <div className="min-w-0">
                                        <div className="truncate text-sm text-white">{d.profiller?.ad_soyad}</div>
                                        <div className="text-xs text-[#A1A1AA]">Ajansına katılmanı istiyor{d.rol_aciklamasi ? ` · ${d.rol_aciklamasi}` : ''}</div>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <button onClick={() => davetYanitla(d.id, 'kabul_edildi')} className="isik isik-birincil rounded-full px-4 py-1.5 text-xs font-medium">
                                            Kabul et
                                        </button>
                                        <button onClick={() => davetYanitla(d.id, 'reddedildi')} className="isik isik-tehlike rounded-full px-4 py-1.5 text-xs font-medium">
                                            Reddet
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Kart>
                )}

                {/* İş veren: bekleyen teklif çağrısı */}
                {!yazilimci && ilanOzet.bekleyenTeklif > 0 && (
                    <section className="isik-kutu mt-4 flex flex-wrap items-center justify-between gap-4 p-6">
                        <p className="text-[15px] text-white">
                            <span className="font-medium text-[#C4B5FD]">{ilanOzet.bekleyenTeklif}</span> teklif senin cevabını bekliyor.
                        </p>
                        <Link to="/ilanlarim" className="isik isik-birincil rounded-full px-5 py-2.5 text-sm font-medium">
                            Şimdi incele
                        </Link>
                    </section>
                )}
            </div>

        </div>
    )
}

export default Dashboard
