import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import useSayfaBasligi from '../useSayfaBasligi'
import { Sahne, SatirBaslik, HapLink, Ok } from '../components/uzay/Hareket'
import { FiltreCipi } from '../components/liste/ListeAraclari'
import IlanKarti from '../components/ilan/IlanKarti'
import UstaIcazeti from '../components/usta/UstaIcazeti'
import { YildizGosterge } from '../components/degerlendirme/Yildizlar'
import Ikon from '../components/mesaj/Ikon'
import { aciklamayiAyir } from '../components/ilan/ilanSablonlari'
import { butceGoster, butceyeGore, kidemRozetiHesapla, musaitlikBilgisi, teknolojiUyumu, tl, ucretAraligiGoster } from '../ustaYardimcilari'
import { useProfilRolu, uyeEylemleri } from '../profilRolu'
import {
    AKIS_DEGERLENDIRMESI,
    AKIS_ILAN_ID,
    AKIS_KONUSMASI,
    AKIS_TEKLIFLERI,
    ORNEK_ILANLAR,
    ORNEK_USTALAR,
    gunOnce,
    isVerenBul,
    ustaBul,
} from './ornekVitrinVerisi'
import '../components/mesaj/mesaj.css'
import '../components/ornek/ornek.css'
import { SAYFA_ETIKETLERI } from '../paylasimEtiketleri'

// Örnek vitrin: Kalfahane'de bir işin baştan sona akışı, açıkça "örnek" olarak işaretlenmiş
// verilerle. Hiçbir şey veritabanına yazılmaz; teklif ve mesaj eylemleri gerçek çarşıya yönlendirir.

const ADIMLAR = [
    { id: 'adim-1', ad: 'İlan' },
    { id: 'adim-2', ad: 'Teklifler' },
    { id: 'adim-3', ad: 'Konuşma' },
    { id: 'adim-4', ad: 'Teslim ve kıdem', kisa: 'Teslim' },
]

// Kıdem eşikleri ustaYardimcilari.js ile aynı: Çırak 0, Kalfa 1, Usta 3, Kıdemli Usta 10
const KIDEM_ESIKLERI = [0, 1, 3, 10]

function harfler(ad) {
    return (ad || '?')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((k) => k[0].toLocaleUpperCase('tr'))
        .join('')
}

function hareketAzaltilsinMi() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function kaydir(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: hareketAzaltilsinMi() ? 'auto' : 'smooth', block: 'start' })
}

function OrnekCip({ children = 'Örnek' }) {
    return <span className="ornek-cip">{children}</span>
}

function Harf({ ad, boyut = 'h-11 w-11 text-[14px]', isletme = false }) {
    return (
        <span
            className={`${boyut} flex shrink-0 items-center justify-center rounded-full font-semibold ${isletme ? 'bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] text-[#050505]' : 'bg-white text-black'}`}
            aria-hidden
        >
            {harfler(ad)}
        </span>
    )
}

function KidemCipi({ rol, sayi }) {
    if (!sayi) return null
    const k = kidemRozetiHesapla(rol, sayi)
    return (
        <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium" style={{ color: k.renk, borderColor: `${k.renk}50`, backgroundColor: `${k.renk}12` }}>
            {k.etiket}
        </span>
    )
}

// ---------- İlan ayrıntısı: akışın ilk adımı ve ilan penceresi aynı görünümü kullanır ----------
function IlanAyrintisi({ ilan, isVeren }) {
    const { giris, bolumler, teslim } = aciklamayiAyir(ilan.aciklama)
    return (
        <div>
            <div className="flex items-center gap-3">
                <Harf ad={isVeren.isletme} isletme />
                <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-medium text-white">{isVeren.isletme}</p>
                    <p className="truncate text-[12.5px] text-gri-koyu">
                        {isVeren.sektor} · {isVeren.konum}
                    </p>
                </div>
                <span className="ml-auto">
                    <OrnekCip />
                </span>
            </div>
            <h3 className="mt-5 text-balance text-[clamp(1.35rem,2.4vw,1.7rem)] font-medium leading-[1.15] tracking-[-0.02em] text-white">{ilan.baslik}</h3>
            {giris && <p className="mt-3 text-[15px] font-light leading-relaxed text-[#D4D4D8]">{giris}</p>}
            {bolumler.length > 0 && (
                <dl className="mt-5 flex flex-col gap-4 border-t border-white/[0.07] pt-5">
                    {bolumler.map((b) => (
                        <div key={b.baslik || b.metin}>
                            {b.baslik && <dt className="text-[13px] font-medium text-mor-soluk">{b.baslik}</dt>}
                            <dd className="mt-1 text-[14.5px] leading-relaxed text-gri">{b.metin}</dd>
                        </div>
                    ))}
                </dl>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                    <p className="text-[12px] text-gri-koyu">Bütçe</p>
                    <p className="rakam mt-0.5 text-[15px] font-medium text-mor-soluk">{butceGoster(ilan.butce_min, ilan.butce_max)}</p>
                </div>
                {teslim && (
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                        <p className="text-[12px] text-gri-koyu">Teslim</p>
                        <p className="mt-0.5 text-[15px] font-medium text-white">{teslim}</p>
                    </div>
                )}
                <div className="col-span-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5 sm:col-span-1">
                    <p className="text-[12px] text-gri-koyu">Gelen teklif</p>
                    <p className="rakam mt-0.5 text-[15px] font-medium text-white">{ilan.teklifSayisi}</p>
                </div>
            </div>
            <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Gereken teknolojiler">
                {ilan.gerekli_teknolojiler.map((t) => (
                    <li key={t} className="uz-etiket font-kod text-[11px]">
                        {t}
                    </li>
                ))}
            </ul>
        </div>
    )
}

// ---------- Teklif kartı ----------
function TeklifKarti({ teklif, ilan }) {
    const usta = ustaBul(teklif.usta_id)
    const uyum = teknolojiUyumu(ilan.gerekli_teknolojiler, usta.teknolojiler)
    const yer = butceyeGore(teklif.tutar, ilan.butce_min, ilan.butce_max)
    const secildi = teklif.durum === 'kabul_edildi'
    const yerRengi = !yer ? '' : yer.yon === 0 ? 'text-[#86EFAC]' : yer.yon > 0 ? 'text-[#FCA5A5]' : 'text-mor-soluk'
    const mus = musaitlikBilgisi(usta.musaitlik)
    return (
        <article className={`ornek-teklif ${secildi ? 'secildi' : 'soluk'}`}>
            <div className="flex items-start gap-3">
                <Harf ad={usta.ad_soyad} boyut="h-10 w-10 text-[13px]" />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[15px] font-medium text-white">{usta.ad_soyad}</p>
                        <KidemCipi rol="yazilimci" sayi={secildi ? usta.tamamlanan - 1 : usta.tamamlanan} />
                    </div>
                    <p className="text-[12.5px] text-gri-koyu">
                        {usta.unvan} · {teklif.sure}
                    </p>
                </div>
                <div className="text-right">
                    <p className="rakam text-[18px] font-medium tracking-[-0.01em] text-white">{tl(teklif.tutar)}</p>
                    {yer && <p className={`text-[12px] ${yerRengi}`}>Bütçeye göre {yer.metin.toLocaleLowerCase('tr')}</p>}
                </div>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-gri">{teklif.mesaj}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="uz-etiket text-[11px]">
                    <span className="rakam">
                        {uyum.eslesen}/{uyum.toplam}
                    </span>
                    teknoloji uyumu
                </span>
                <span className="uz-etiket text-[11px]">
                    <span className="rakam">{usta.projeler.length}</span> portföy işi
                </span>
                <span className="uz-etiket text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: mus.renk }} aria-hidden />
                    {mus.etiket}
                </span>
                {secildi && (
                    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#4ADE80]/12 px-2.5 py-1 text-[11.5px] font-medium text-[#86EFAC]">
                        <Ikon ad="tik" className="h-3 w-3" kalinlik={2.4} /> Kabul edildi
                    </span>
                )}
            </div>
        </article>
    )
}

// ---------- Konuşma ----------
function Konusma({ usta, isVeren, tutar }) {
    return (
        <div className="ornek-ekran">
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3.5 sm:px-5">
                <Harf ad={usta.ad_soyad} boyut="h-10 w-10 text-[13px]" />
                <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-medium text-white">{usta.ad_soyad}</p>
                    <p className="truncate text-[12px] text-mor-soluk">QR menü ilanı · {isVeren.isletme}</p>
                </div>
                <span className="ml-auto">
                    <OrnekCip />
                </span>
            </div>
            <div className="flex flex-col gap-2 px-3 py-5 sm:px-5">
                <div className="msj-anlasma msj-kart-dis mx-auto mb-3 w-full max-w-[440px] px-5 py-5">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#4ADE80]/25 bg-[#4ADE80]/[0.12] text-[#86EFAC]">
                            <Ikon ad="anlasma" className="h-5 w-5" kalinlik={1.5} />
                        </span>
                        <span>
                            <span className="block text-[15.5px] font-semibold tracking-[-0.01em]">Teklif kabul edildi</span>
                            <span className="rakam block text-[12px] text-gri">{tl(tutar)} · 5 hafta</span>
                        </span>
                    </div>
                    <p className="mt-3 text-[12.5px] leading-relaxed text-[#D4D4D8]">Konuşma kendiliğinden açıldı. Kapsamı, teslim tarihini ve ödeme aşamalarını burada yazılı olarak netleştirin.</p>
                </div>
                {AKIS_KONUSMASI.map((m, i) => {
                    const ben = m.gonderen === 'isveren'
                    const sonraki = AKIS_KONUSMASI[i + 1]
                    const grupSonu = !sonraki || sonraki.gonderen !== m.gonderen
                    return (
                        <div key={m.id} className={`flex ${ben ? 'msj-ben justify-end' : 'msj-o justify-start'} ${grupSonu ? 'mb-1.5' : ''}`}>
                            <p className={`msj-balon ${ben ? 'msj-balon-ben' : 'msj-balon-o'} max-w-[82%] text-[14px]`}>
                                {m.metin}
                                <span className={`rakam float-right ml-3 mt-1.5 text-[10.5px] ${ben ? 'text-[#DDD6FE]' : 'text-gri-koyu'}`}>{m.saat}</span>
                            </p>
                        </div>
                    )
                })}
            </div>
            <div className="border-t border-white/[0.07] px-3 py-3 sm:px-5">
                <div className="flex h-11 items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-4 text-[13.5px] text-[#80808C]">Bir mesaj yaz…</div>
            </div>
        </div>
    )
}

// ---------- Teslim ve kıdem ----------
function KidemIlerlemesi({ once, sonra }) {
    const yuzde = (n) => {
        const i = KIDEM_ESIKLERI.findIndex((e, j) => n >= e && (j === KIDEM_ESIKLERI.length - 1 || n < KIDEM_ESIKLERI[j + 1]))
        return (i / (KIDEM_ESIKLERI.length - 1)) * 100
    }
    const eski = kidemRozetiHesapla('yazilimci', once)
    const yeni = kidemRozetiHesapla('yazilimci', sonra)
    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <p className="text-[14.5px] text-white">
                    <span style={{ color: eski.renk }}>{eski.etiket}</span>
                    <span className="mx-2 text-gri-koyu">→</span>
                    <span className="font-medium" style={{ color: yeni.renk }}>
                        {yeni.etiket}
                    </span>
                </p>
                <p className="rakam text-[12.5px] text-gri">
                    {once} → {sonra} tamamlanan iş
                </p>
            </div>
            <div className="ornek-kidem-yol mt-4">
                <span className="ornek-kidem-dolu" style={{ width: `${yuzde(sonra)}%` }} />
            </div>
            <ol className="mt-3 grid grid-cols-4 text-[11.5px]">
                {KIDEM_ESIKLERI.map((e, i) => {
                    const k = kidemRozetiHesapla('yazilimci', e)
                    return (
                        <li key={e} className={`${i === 0 ? 'text-left' : i === KIDEM_ESIKLERI.length - 1 ? 'text-right' : 'text-center'} ${sonra >= e ? 'text-white' : 'text-gri-koyu'}`}>
                            {k.etiket}
                            <span className="rakam block text-gri-koyu">{e}+</span>
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}

// ---------- Adım bölümü ----------
function Adim({ id, no, baslik, metin, maddeler, children, ters = false }) {
    return (
        <Sahne as="section" id={id} className="ornek-adim px-4 py-16 sm:px-8 lg:py-24" esik={0.12}>
            <div className={`mx-auto grid max-w-[1180px] items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 ${ters ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                <div className="lg:sticky lg:top-40">
                    <span className="uz-kalk ornek-adim-no">{no}</span>
                    <SatirBaslik satirlar={[baslik]} as="h2" className="mt-6 font-pjs text-[clamp(1.9rem,3.6vw,2.8rem)] font-medium leading-[1.06] tracking-[-0.025em] text-white" />
                    <p className="uz-sub mt-4 max-w-[46ch] text-pretty text-[16px] font-light leading-[1.65] text-gri" style={{ '--d': '0.15s' }}>
                        {metin}
                    </p>
                    {maddeler && (
                        <ul className="mt-6 flex flex-col gap-3">
                            {maddeler.map((m, i) => (
                                <li key={m} className="uz-kalk flex items-start gap-3 text-[14.5px] text-[#D4D4D8]" style={{ '--d': `${0.25 + i * 0.06}s` }}>
                                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-mor-acik shadow-[0_0_10px_rgba(167,139,250,0.9)]" aria-hidden />
                                    {m}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="uz-otur" style={{ '--d': '0.2s' }}>
                    {children}
                </div>
            </div>
        </Sahne>
    )
}

// ---------- Ayrıntı penceresi ----------
function AyrintiPenceresi({ ilan, usta, kapat, girisli }) {
    const diyalog = useRef(null)
    const acik = Boolean(ilan || usta)

    useEffect(() => {
        const d = diyalog.current
        if (!d) return
        if (acik && !d.open) d.showModal()
        if (!acik && d.open) d.close()
    }, [acik])

    const isVeren = ilan ? isVerenBul(ilan.is_veren_id) : null
    const mus = usta ? musaitlikBilgisi(usta.musaitlik) : null
    const ucret = usta ? ucretAraligiGoster(usta.saatlik_ucret_min, usta.saatlik_ucret_max) : null

    return (
        <dialog
            ref={diyalog}
            className="ornek-diyalog"
            aria-label={ilan ? `Örnek ilan: ${ilan.baslik}` : usta ? `Örnek usta: ${usta.ad_soyad}` : 'Örnek ayrıntı'}
            onClose={kapat}
            onClick={(e) => {
                if (e.target === e.currentTarget) kapat()
            }}
        >
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-6 py-4 sm:px-8">
                <p className="text-[13px] text-gri">{ilan ? 'Örnek ilan' : 'Örnek usta'} · gerçek değildir</p>
                <button type="button" className="ornek-kapat" onClick={kapat} aria-label="Kapat">
                    <Ikon ad="kapat" className="h-4 w-4" />
                </button>
            </div>
            <div className="ornek-diyalog-govde">
                {ilan && isVeren && (
                    <>
                        <IlanAyrintisi ilan={ilan} isVeren={isVeren} />
                        <div className="mt-7 flex flex-wrap gap-2.5 border-t border-white/[0.07] pt-6">
                            <HapLink to="/is-ilanlari">Gerçek ilanlara bak</HapLink>
                            <HapLink to="/ilan-ver" tur="cam">
                                Kendi ilanını aç
                            </HapLink>
                        </div>
                    </>
                )}
                {usta && (
                    <>
                        <div className="flex items-start gap-4">
                            <Harf ad={usta.ad_soyad} boyut="h-14 w-14 text-[18px]" />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-[22px] font-medium tracking-[-0.015em] text-white">{usta.ad_soyad}</h3>
                                    <OrnekCip />
                                </div>
                                <p className="text-[14.5px] text-gri">
                                    {usta.unvan} · {usta.konum}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <KidemCipi rol="yazilimci" sayi={usta.tamamlanan} />
                                    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-gri">
                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: mus.renk }} aria-hidden />
                                        {mus.etiket}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="mt-5 text-[15px] font-light leading-relaxed text-[#D4D4D8]">{usta.bio}</p>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                                <p className="text-[12px] text-gri-koyu">Saatlik ücret</p>
                                <p className="rakam mt-0.5 text-[15px] font-medium text-mor-soluk">{ucret}</p>
                            </div>
                            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                                <p className="text-[12px] text-gri-koyu">Tamamlanan iş</p>
                                <p className="rakam mt-0.5 text-[15px] font-medium text-white">{usta.tamamlanan}</p>
                            </div>
                        </div>
                        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Teknolojiler">
                            {usta.teknolojiler.map((t) => (
                                <li key={t} className="uz-etiket font-kod text-[11px]">
                                    {t}
                                </li>
                            ))}
                        </ul>
                        <h4 className="mt-7 text-[14px] font-medium text-white">Portföy</h4>
                        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                            {usta.projeler.map((p) => (
                                <li key={p.baslik} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                                    {p.one_cikan && <span className="mb-2 inline-flex text-[11px] font-medium text-mor-soluk">Öne çıkan iş</span>}
                                    <p className="text-[14.5px] font-medium text-white">{p.baslik}</p>
                                    <p className="mt-1 text-[13px] leading-relaxed text-gri">{p.aciklama}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-7 flex flex-wrap gap-2.5 border-t border-white/[0.07] pt-6">
                            <HapLink to="/ustalar">Gerçek ustalara göz at</HapLink>
                            {!girisli && (
                                <HapLink to="/hesap-olustur?rol=yazilimci" tur="cam">
                                    Usta olarak katıl
                                </HapLink>
                            )}
                        </div>
                    </>
                )}
            </div>
        </dialog>
    )
}

// ---------- Sayfa ----------
export default function OrnekVitrin() {
    useSayfaBasligi(SAYFA_ETIKETLERI.ornek.baslik, SAYFA_ETIKETLERI.ornek.aciklama)
    const [parametreler, setParametreler] = useSearchParams()
    const [sekme, setSekme] = useState('ilanlar')
    const [etkinAdim, setEtkinAdim] = useState(null)
    const { girisli, rol, hazir } = useProfilRolu()

    // Tarihler sayfa açıldığında hesaplanır: örnekler hep "yakın zamanda" görünür
    const ilanlar = useMemo(() => {
        const simdi = Date.now()
        return ORNEK_ILANLAR.map((i) => ({ ...i, created_at: gunOnce(i.gun, simdi) }))
    }, [])
    const ustalar = useMemo(() => ORNEK_USTALAR.map((u) => ({ ...u, onayli: u.id !== 'ornek-usta-9', son_gorulme: null })), [])

    const akisIlani = ilanlar.find((i) => i.id === AKIS_ILAN_ID)
    const akisIsVereni = isVerenBul(akisIlani.is_veren_id)
    const secilenTeklif = AKIS_TEKLIFLERI.find((t) => t.durum === 'kabul_edildi')
    const secilenUsta = ustaBul(secilenTeklif.usta_id)

    const acikIlan = ilanlar.find((i) => i.id === parametreler.get('ilan')) || null
    const acikUsta = ustalar.find((u) => u.id === parametreler.get('usta')) || null

    // Adım rayı: ekranın ortasındaki adım yanar
    useEffect(() => {
        const bolumler = ADIMLAR.map((a) => document.getElementById(a.id)).filter(Boolean)
        const g = new IntersectionObserver(
            (girdiler) => {
                for (const e of girdiler) if (e.isIntersecting) setEtkinAdim(e.target.id)
            },
            { rootMargin: '-45% 0px -50% 0px' }
        )
        bolumler.forEach((b) => g.observe(b))
        return () => g.disconnect()
    }, [])

    const kapanis = girisli ? uyeEylemleri(rol) : [
        { ad: 'Yazılımcı olarak katıl', to: '/hesap-olustur?rol=yazilimci' },
        { ad: 'İş vermek istiyorum', to: '/hesap-olustur?rol=is-veren' },
    ]

    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />

            {/* Giriş */}
            <Sahne as="section" className="px-4 pb-10 pt-12 sm:px-8 lg:pt-16">
                <div className="mx-auto max-w-[1180px]">
                    <div className="ornek-serit uz-kalk max-w-[760px]">
                        <OrnekCip />
                        <p>Bu sayfadaki kişiler, işletmeler, ilanlar ve mesajlar örnektir; gerçek değildir. Kalfahane’de bir işin nasıl ilerlediğini göstermek için hazırlandı.</p>
                    </div>
                    <p className="uz-kalk mt-12 text-[13px] font-semibold tracking-[0.04em] text-mor-soluk" style={{ '--d': '0.05s' }}>
                        Örnek vitrin
                    </p>
                    <SatirBaslik
                        as="h1"
                        satirlar={['Bir iş,', 'baştan sona.']}
                        gecikme={0.08}
                        className="mt-3 font-pjs text-[clamp(2.8rem,7vw,5.6rem)] font-medium leading-[0.98] tracking-[-0.035em] text-white"
                    />
                    <p className="uz-sub mt-6 max-w-[56ch] text-pretty text-[17px] font-light leading-[1.65] text-gri" style={{ '--d': '0.3s' }}>
                        Lavanta Kafe’nin QR menü ilanı nasıl açıldı, kimler teklif verdi, nasıl anlaşıldı ve iş teslim edilince kıdeme nasıl işlendi: dört adımda gör. Altta farklı sektörlerden
                        örnek ilanlar ve ustalar var.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-2.5">
                        <a
                            href="#adim-1"
                            onClick={(e) => {
                                e.preventDefault()
                                kaydir('adim-1')
                            }}
                            className="uz-hap uz-otur isik-hap isik-hap-birincil"
                            style={{ '--d': '0.4s' }}
                        >
                            Akışı izle <Ok />
                        </a>
                        <a
                            href="#ornek-carsi"
                            onClick={(e) => {
                                e.preventDefault()
                                kaydir('ornek-carsi')
                            }}
                            className="uz-hap uz-otur isik-hap"
                            style={{ '--d': '0.46s' }}
                        >
                            Örnek ilanlar ve ustalar <Ok />
                        </a>
                    </div>
                </div>
            </Sahne>

            {/* Akış: adım rayı yalnızca dört adım boyunca yapışık kalır */}
            <div className="relative z-[1]">
            <div className="ornek-ray px-4">
                <nav className="ornek-ray-ic" aria-label="Akış adımları">
                    {ADIMLAR.map((a, i) => (
                        <a
                            key={a.id}
                            href={`#${a.id}`}
                            onClick={(e) => {
                                e.preventDefault()
                                kaydir(a.id)
                            }}
                            className={`ornek-ray-hap ${etkinAdim === a.id ? 'etkin' : ''}`}
                            aria-current={etkinAdim === a.id ? 'step' : undefined}
                        >
                            <span className="ornek-ray-no">{i + 1}</span>
                            {a.kisa ? (
                                <>
                                    <span className="sm:hidden">{a.kisa}</span>
                                    <span className="hidden sm:inline">{a.ad}</span>
                                </>
                            ) : (
                                a.ad
                            )}
                        </a>
                    ))}
                </nav>
            </div>

            <Adim
                id="adim-1"
                no={1}
                baslik="İş veren ilanını açar"
                metin="Gamze Hanım işini dört kısa adımda tarif etti: ne istediğini, kimlerin kullanacağını, bütçe aralığını ve teslim beklentisini. Şablon doğru soruları sorar; ilan açmak ücretsiz."
                maddeler={['Hazır şablonla birkaç dakikada ilan', 'Bütçe aralığı ve teknoloji önerisi', 'Yayına çıkınca uygun ustalar görür']}
            >
                <div className="ornek-ekran">
                    <div className="ornek-ekran-ust">
                        <span className="ornek-ekran-nokta" aria-hidden>
                            <span />
                            <span />
                            <span />
                        </span>
                        <span>kalfahane.com/is-ilanlari</span>
                        <span className="w-[39px]" aria-hidden />
                    </div>
                    <div className="p-5 sm:p-7">
                        <IlanAyrintisi ilan={akisIlani} isVeren={akisIsVereni} />
                    </div>
                </div>
            </Adim>

            <Adim
                id="adim-2"
                no={2}
                baslik="Ustalar teklif verir"
                metin="Teknolojisi uyan ustalar tutarını, süresini ve nasıl yapacağını yazar. Gamze Hanım üç teklifi yan yana gördü: tutar bütçenin neresinde, teknoloji uyumu, kıdem ve portföy."
                maddeler={['Teklifler fiyat, kıdem ve portföyle karşılaştırılır', 'Sorular teklif vermeden de sorulabilir', 'Seçilmeyen ustaya da durum bildirilir']}
                ters
            >
                <div className="flex flex-col gap-3">
                    {AKIS_TEKLIFLERI.map((t) => (
                        <TeklifKarti key={t.id} teklif={t} ilan={akisIlani} />
                    ))}
                </div>
            </Adim>

            <Adim
                id="adim-3"
                no={3}
                baslik="Konuşup netleştirirler"
                metin="Teklif kabul edilince iki taraf arasında konuşma kendiliğinden açılır. Kapsam, teslim tarihi ve ödeme aşamaları yazılı olarak netleşir; telefon numarası yalnızca kişi isterse paylaşılır."
                maddeler={['Ödeme şimdilik taraflar arasında; emanet ödeme yakında', 'Okundu bilgisi, yazıyor sinyali ve iletişim kartı', 'Konuşma ilanın bağlamıyla birlikte durur']}
            >
                <Konusma usta={secilenUsta} isVeren={akisIsVereni} tutar={secilenTeklif.tutar} />
            </Adim>

            <Adim
                id="adim-4"
                no={4}
                baslik="Teslim edilir, kıdeme işlenir"
                metin="İş tamamlanınca iki taraf birbirini değerlendirir ve iş, ustanın kıdemine işlenir. Mert Kaya üçüncü işiyle Kalfa’dan Usta’ya yükseldi; Lavanta Kafe de ilk tamamlanan işiyle Güvenilir İş Veren oldu."
                maddeler={['Kıdem satın alınmaz, yalnızca tamamlanan işle gelir', 'Değerlendirmeyi yalnızca işin tarafları yazabilir']}
                ters
            >
                <div className="flex flex-col gap-3">
                    <div className="ornek-ekran p-5 sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <Harf ad={secilenUsta.ad_soyad} boyut="h-10 w-10 text-[13px]" />
                            <div className="min-w-0">
                                <p className="text-[14.5px] font-medium text-white">{secilenUsta.ad_soyad}</p>
                                <p className="text-[12.5px] text-gri-koyu">Kıdem yolu</p>
                            </div>
                            <span className="ml-auto">
                                <OrnekCip />
                            </span>
                        </div>
                        <KidemIlerlemesi once={secilenUsta.tamamlanan - 1} sonra={secilenUsta.tamamlanan} />
                    </div>
                    <div className="ornek-ekran p-5 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <YildizGosterge puan={AKIS_DEGERLENDIRMESI.puan} boyut="h-5 w-5" />
                            <OrnekCip>Örnek değerlendirme</OrnekCip>
                        </div>
                        <p className="mt-4 text-pretty text-[16px] font-light leading-relaxed text-white">“{AKIS_DEGERLENDIRMESI.yorum}”</p>
                        <p className="mt-4 text-[13px] text-gri">
                            {akisIsVereni.ad_soyad} · {akisIsVereni.isletme}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-[18px] border border-white/[0.07] bg-white/[0.02] px-4 py-3.5">
                        <Harf ad={akisIsVereni.isletme} boyut="h-9 w-9 text-[12px]" isletme />
                        <p className="min-w-0 flex-1 text-[13.5px] text-gri">
                            <span className="text-white">{akisIsVereni.isletme}</span> ilk tamamlanan işiyle
                        </p>
                        <KidemCipi rol="is-veren" sayi={akisIsVereni.tamamlanan} />
                    </div>
                </div>
            </Adim>
            </div>

            {/* Örnek çarşı */}
            <Sahne as="section" id="ornek-carsi" className="uz-ufuk ornek-adim px-4 py-24 sm:px-8 lg:py-32" esik={0.08}>
                <div className="mx-auto max-w-[1180px]">
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <div>
                            <SatirBaslik satirlar={['Çarşıdan örnekler']} className="font-pjs text-[clamp(2rem,4.4vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white" />
                            <p className="uz-sub mt-4 max-w-[52ch] text-pretty text-[16px] font-light leading-[1.6] text-gri" style={{ '--d': '0.15s' }}>
                                Farklı sektörlerden on iş veren, on usta. Ayrıntısını görmek için bir karta dokun. Hepsi örnektir.
                            </p>
                        </div>
                        <div className="uz-kalk flex gap-2" role="group" aria-label="Örnek türü" style={{ '--d': '0.2s' }}>
                            <FiltreCipi secili={sekme === 'ilanlar'} tikla={() => setSekme('ilanlar')}>
                                İlanlar <span className="rakam text-gri">{ilanlar.length}</span>
                            </FiltreCipi>
                            <FiltreCipi secili={sekme === 'ustalar'} tikla={() => setSekme('ustalar')}>
                                Ustalar <span className="rakam text-gri">{ustalar.length}</span>
                            </FiltreCipi>
                        </div>
                    </div>

                    {sekme === 'ilanlar' ? (
                        <ul key="ilanlar" className="mt-10 grid gap-5 md:grid-cols-2">
                            {ilanlar.map((ilan, i) => (
                                <li key={ilan.id}>
                                    <IlanKarti
                                        ilan={ilan}
                                        isVeren={{ ad_soyad: isVerenBul(ilan.is_veren_id).isletme }}
                                        sira={Math.min(i, 6)}
                                        to={`?ilan=${ilan.id}`}
                                        rozet={<OrnekCip />}
                                        eylemMetni="Ayrıntıyı gör"
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul key="ustalar" className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {ustalar.map((usta, i) => (
                                <li key={usta.id}>
                                    <UstaIcazeti usta={usta} projeler={usta.projeler} sira={Math.min(i, 5)} to={`?usta=${usta.id}`} rozet={<OrnekCip />} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Sahne>

            {/* Kapanış */}
            <Sahne as="section" className="relative overflow-hidden px-4 pb-28 pt-20 sm:px-8 lg:pb-36">
                <div className="relative mx-auto max-w-[900px] text-center" style={hazir ? undefined : { visibility: 'hidden' }}>
                    <SatirBaslik satirlar={['Sıra gerçek çarşıda.']} className="font-pjs text-[clamp(2.2rem,5.4vw,4.2rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white" />
                    <p className="uz-sub mx-auto mt-5 max-w-[46ch] text-balance text-[17px] font-light leading-[1.6] text-gri" style={{ '--d': '0.2s' }}>
                        Aynı akış gerçek ilanlar ve gerçek ustalarla işliyor. Kalfahane yeni açıldı; ilk tezgâhlar şimdi kuruluyor.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                        <HapLink to={kapanis[0].to} className="uz-otur" gecikme={0.35}>
                            {kapanis[0].ad}
                        </HapLink>
                        <HapLink to={kapanis[1].to} tur="cam" className="uz-otur" gecikme={0.42}>
                            {kapanis[1].ad}
                        </HapLink>
                    </div>
                    <p className="uz-kalk mt-6 text-[14px]" style={{ '--d': '0.5s' }}>
                        <Link to="/is-ilanlari" className="text-mor-soluk hover:text-white">
                            Gerçek ilanlara bak
                        </Link>
                        <span className="mx-2 text-gri-koyu">·</span>
                        <Link to="/ustalar" className="text-mor-soluk hover:text-white">
                            Gerçek ustalar
                        </Link>
                    </p>
                </div>
            </Sahne>

            <AyrintiPenceresi
                ilan={acikIlan}
                usta={acikUsta}
                girisli={girisli}
                kapat={() => setParametreler({}, { replace: true, preventScrollReset: true })}
            />
        </div>
    )
}
