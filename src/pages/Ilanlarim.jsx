import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import { butceGoster, butceyeGore, zamanFarki, tl, teknolojiUyumu, musaitlikBilgisi } from '../ustaYardimcilari'
import { portfoyleriGetir } from '../ustaVerisi'
import { useBildirim, useOnay } from '../components/bildirim/bildirimBaglami'
import { SonucYok } from '../components/liste/ListeAraclari'
import { HapLink } from '../components/uzay/Hareket'
import MesajlasDugmesi from '../components/MesajlasDugmesi'
import { ilanlarimOnizlemesi } from './ilanlarimOnizleme'
import DegerlendirmeFormu from '../components/degerlendirme/DegerlendirmeFormu'
import { verdigimDegerlendirmeler } from '../components/degerlendirme/degerlendirmeVerisi'

const DURUMLAR = [
    ['acik', 'Açık'],
    ['kapali', 'Kapalı'],
    ['tamamlandi', 'Tamamlandı'],
]
const TEKLIF_DURUMU = { beklemede: 'Beklemede', kabul_edildi: 'Kabul edildi', reddedildi: 'Reddedildi' }

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return '?'
    return adSoyad
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((k) => k[0].toLocaleUpperCase('tr-TR'))
        .join('')
}

function Avatar({ profil, boyut = 'h-10 w-10 text-[13px]' }) {
    if (profil?.avatar_url) return <img src={profil.avatar_url} alt="" loading="lazy" className={`${boyut} shrink-0 rounded-full object-cover`} />
    return <span className={`${boyut} flex shrink-0 items-center justify-center rounded-full bg-white font-semibold text-black`}>{baslangicHarfleri(profil?.ad_soyad)}</span>
}

function DurumRozeti({ durum }) {
    const renk = durum === 'kabul_edildi' ? 'bg-[#4ADE80]/12 text-[#86EFAC]' : durum === 'reddedildi' ? 'bg-red-400/10 text-[#FCA5A5]' : 'bg-white/[0.06] text-gri'
    return <span className={`uz-etiket ${renk}`}>{TEKLIF_DURUMU[durum] || durum}</span>
}

function TeklifEylemleri({ teklif, kabulEt, reddet, kucuk = false }) {
    const boyut = kucuk ? 'px-3.5 py-1.5 text-[12.5px]' : 'px-4 py-2 text-[13px]'
    return (
        <div className="flex flex-wrap gap-2">
            {teklif.durum === 'beklemede' && (
                <>
                    <button type="button" onClick={() => kabulEt(teklif)} className={`isik isik-birincil rounded-full font-semibold ${boyut}`}>
                        Kabul et
                    </button>
                    <button type="button" onClick={() => reddet(teklif)} className={`isik isik-tehlike rounded-full font-medium ${boyut}`}>
                        Reddet
                    </button>
                </>
            )}
            <MesajlasDugmesi teklifId={teklif.id} className={`isik isik-cam rounded-full font-medium ${boyut}`}>
                Mesajlaş
            </MesajlasDugmesi>
        </div>
    )
}

function TeklifKarti({ teklif, ilan, portfoy, kabulEt, reddet }) {
    const [acik, setAcik] = useState(false)
    const p = teklif.profiller
    const uyum = teknolojiUyumu(ilan.gerekli_teknolojiler, p?.teknolojiler)
    const konum = butceyeGore(teklif.teklif_tutari, ilan.butce_min, ilan.butce_max)
    const mus = musaitlikBilgisi(p?.musaitlik)
    const uzunMesaj = (teklif.mesaj || '').length > 220

    return (
        <li className="rounded-[18px] border border-white/[0.08] bg-white/[0.02] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <Avatar profil={p} />
                    <div className="min-w-0">
                        <Link to={`/ustalar/${teklif.yazilimci_id}`} className="flex items-center gap-1.5 text-[15.5px] font-semibold text-white hover:text-mor-soluk">
                            <span className="truncate">{p?.ad_soyad || 'Yazılımcı'}</span>
                            {p?.onayli && (
                                <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 shrink-0 text-mor-acik" fill="none" aria-label="Onaylı usta">
                                    <path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </Link>
                        <p className="truncate text-[13px] text-gri">{p?.unvan || 'Usta'} · {zamanFarki(teklif.created_at)}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="rakam text-[19px] font-medium tracking-[-0.01em] text-white">{teklif.teklif_tutari ? tl(teklif.teklif_tutari) : 'Tutar yok'}</p>
                    {konum && <p className={`text-[12.5px] ${konum.yon > 0 ? 'text-[#FCA5A5]' : 'text-[#86EFAC]'}`}>Bütçeye göre {konum.metin.toLocaleLowerCase('tr-TR')}</p>}
                </div>
            </div>

            {teklif.mesaj && (
                <div className="mt-4">
                    <p className={`whitespace-pre-line text-[14.5px] leading-relaxed text-gri ${!acik && uzunMesaj ? 'line-clamp-3' : ''}`}>{teklif.mesaj}</p>
                    {uzunMesaj && (
                        <button type="button" onClick={() => setAcik(!acik)} className="mt-1 text-[13px] font-medium text-mor-soluk hover:text-white" aria-expanded={acik}>
                            {acik ? 'Daha az göster' : 'Devamını göster'}
                        </button>
                    )}
                </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <ul className="flex flex-wrap gap-1.5 text-[12px]">
                    {uyum.toplam > 0 && (
                        <li className="uz-etiket">
                            <span className="rakam">
                                {uyum.eslesen}/{uyum.toplam}
                            </span>{' '}
                            teknoloji uyumu
                        </li>
                    )}
                    <li className="uz-etiket">
                        <span className="rakam">{portfoy}</span> portföy işi
                    </li>
                    <li className="uz-etiket">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: mus.renk }} aria-hidden />
                        {mus.etiket}
                    </li>
                    {teklif.durum !== 'beklemede' && (
                        <li>
                            <DurumRozeti durum={teklif.durum} />
                        </li>
                    )}
                </ul>
                <TeklifEylemleri teklif={teklif} kabulEt={kabulEt} reddet={reddet} />
            </div>
        </li>
    )
}

function EnIyi({ goster }) {
    return goster ? <span className="karsilastirma-iyi">en iyi</span> : null
}

// Karşılaştırma tablosu: her satırda en iyi değer mor ve "en iyi" işaretli
function Karsilastirma({ teklifler, ilan, portfoyler, kabulEt, reddet }) {
    const satirlar = teklifler.map((t) => ({
        t,
        uyum: teknolojiUyumu(ilan.gerekli_teknolojiler, t.profiller?.teknolojiler),
        konum: butceyeGore(t.teklif_tutari, ilan.butce_min, ilan.butce_max),
        portfoy: portfoyler[t.yazilimci_id]?.length || 0,
    }))
    const tutarlar = satirlar.map((s) => s.t.teklif_tutari).filter(Boolean)
    const enDusuk = tutarlar.length > 1 ? Math.min(...tutarlar) : null
    const enIyiUyum = Math.max(...satirlar.map((s) => (s.uyum.toplam ? s.uyum.eslesen / s.uyum.toplam : -1)))
    const enCokPortfoy = Math.max(...satirlar.map((s) => s.portfoy))
    const isaret = (iyi) => (iyi ? 'text-mor-soluk font-medium' : 'text-gri')

    return (
        <div className="karsilastirma-kap">
            <table className="karsilastirma">
                <caption className="sr-only">{ilan.baslik} için gelen tekliflerin karşılaştırması</caption>
                <thead>
                    <tr>
                        <th scope="col">
                            <span className="sr-only">Ölçüt</span>
                        </th>
                        {satirlar.map(({ t }) => (
                            <th key={t.id} scope="col">
                                <Link to={`/ustalar/${t.yazilimci_id}`} className="flex items-center gap-2.5 text-left hover:text-mor-soluk">
                                    <Avatar profil={t.profiller} boyut="h-8 w-8 text-[11px]" />
                                    <span className="min-w-0">
                                        <span className="block truncate text-[14px] font-semibold text-white">{t.profiller?.ad_soyad || 'Yazılımcı'}</span>
                                        <span className="block truncate text-[12px] font-normal text-gri">{t.profiller?.unvan || 'Usta'}</span>
                                    </span>
                                </Link>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row">Teklif</th>
                        {satirlar.map(({ t }) => {
                            const iyi = enDusuk !== null && t.teklif_tutari === enDusuk
                            return (
                                <td key={t.id} className={`rakam text-[15px] ${isaret(iyi)}`}>
                                    {t.teklif_tutari ? tl(t.teklif_tutari) : '—'} <EnIyi goster={iyi} />
                                </td>
                            )
                        })}
                    </tr>
                    {(ilan.butce_min || ilan.butce_max) && (
                        <tr>
                            <th scope="row">Bütçeye göre</th>
                            {satirlar.map(({ t, konum }) => (
                                <td key={t.id} className={konum ? (konum.yon > 0 ? 'text-[#FCA5A5]' : 'text-[#86EFAC]') : 'text-gri'}>
                                    {konum ? konum.metin : '—'}
                                </td>
                            ))}
                        </tr>
                    )}
                    {(ilan.gerekli_teknolojiler || []).length > 0 && (
                        <tr>
                            <th scope="row">Teknoloji uyumu</th>
                            {satirlar.map(({ t, uyum }) => {
                                const iyi = uyum.toplam > 0 && uyum.eslesen / uyum.toplam === enIyiUyum && satirlar.length > 1
                                return (
                                    <td key={t.id} className={`rakam ${isaret(iyi)}`}>
                                        {uyum.eslesen}/{uyum.toplam} <EnIyi goster={iyi} />
                                    </td>
                                )
                            })}
                        </tr>
                    )}
                    <tr>
                        <th scope="row">Portföy işi</th>
                        {satirlar.map(({ t, portfoy }) => {
                            const iyi = portfoy > 0 && portfoy === enCokPortfoy
                            return (
                                <td key={t.id} className={`rakam ${isaret(iyi)}`}>
                                    {portfoy} <EnIyi goster={iyi} />
                                </td>
                            )
                        })}
                    </tr>
                    <tr>
                        <th scope="row">Onaylı usta</th>
                        {satirlar.map(({ t }) => (
                            <td key={t.id} className={t.profiller?.onayli ? 'text-white' : 'text-gri-koyu'}>
                                {t.profiller?.onayli ? 'Evet' : 'Hayır'}
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <th scope="row">Müsaitlik</th>
                        {satirlar.map(({ t }) => {
                            const mus = musaitlikBilgisi(t.profiller?.musaitlik)
                            return (
                                <td key={t.id}>
                                    <span className="inline-flex items-center gap-2 text-gri">
                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: mus.renk }} aria-hidden />
                                        {mus.etiket}
                                    </span>
                                </td>
                            )
                        })}
                    </tr>
                    <tr>
                        <th scope="row">Durum</th>
                        {satirlar.map(({ t }) => (
                            <td key={t.id}>
                                <DurumRozeti durum={t.durum} />
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <th scope="row">
                            <span className="sr-only">Eylemler</span>
                        </th>
                        {satirlar.map(({ t }) => (
                            <td key={t.id}>
                                <TeklifEylemleri teklif={t} kabulEt={kabulEt} reddet={reddet} kucuk />
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

function IlanPaneli({ ilan, teklifler, portfoyler, durumDegistir, kabulEt, reddet, degerlendirmelerim, kullaniciId, yenile, onizleme }) {
    const [gorunum, setGorunum] = useState('liste')
    const butce = butceGoster(ilan.butce_min, ilan.butce_max)
    const bekleyen = teklifler.filter((t) => t.durum === 'beklemede').length
    const karsilastirilabilir = teklifler.length >= 2
    // İş tamamlandıysa kabul edilen usta(lar) değerlendirilebilir
    const degerlendirilecekler = ilan.durum === 'tamamlandi' ? teklifler.filter((t) => t.durum === 'kabul_edildi') : []

    return (
        <article className="rounded-[24px] border border-white/[0.08] bg-[#08080D] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="min-w-0">
                    <Link to={`/is-ilanlari/${ilan.id}`} className="text-[21px] font-medium tracking-[-0.015em] text-white hover:text-mor-soluk">
                        {ilan.baslik}
                    </Link>
                    <p className="mt-1.5 text-[13.5px] text-gri">
                        {zamanFarki(ilan.created_at)} · <span className="rakam">{teklifler.length}</span> teklif
                        {bekleyen > 0 && (
                            <>
                                {' '}
                                · <span className="rakam text-mor-soluk">{bekleyen}</span> yanıt bekliyor
                            </>
                        )}
                        {butce && (
                            <>
                                {' '}
                                · <span className="rakam">{butce}</span>
                            </>
                        )}
                    </p>
                </div>
                <div role="radiogroup" aria-label="İlan durumu" className="flex rounded-full border border-white/[0.09] bg-white/[0.02] p-1">
                    {DURUMLAR.map(([d, ad]) => (
                        <button
                            key={d}
                            type="button"
                            role="radio"
                            aria-checked={ilan.durum === d}
                            onClick={() => ilan.durum !== d && durumDegistir(ilan, d)}
                            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${ilan.durum === d ? 'bg-white text-black' : 'text-gri hover:text-white'}`}
                        >
                            {ad}
                        </button>
                    ))}
                </div>
            </div>

            {degerlendirilecekler.length > 0 && (
                <div className="mt-6 flex flex-col gap-3">
                    {degerlendirilecekler.map((t) => (
                        <DegerlendirmeFormu
                            key={t.id}
                            ilanId={ilan.id}
                            kullaniciId={kullaniciId}
                            degerlenenId={t.yazilimci_id}
                            degerlenenAd={t.profiller?.ad_soyad || 'Usta'}
                            mevcut={degerlendirmelerim[`${ilan.id}:${t.yazilimci_id}`]}
                            onTamam={yenile}
                            onizleme={onizleme}
                        />
                    ))}
                </div>
            )}

            <div className="mt-6 border-t border-white/[0.07] pt-6">
                {teklifler.length === 0 ? (
                    <p className="text-[14.5px] text-gri">
                        Henüz teklif yok. Ustalar ilanını gördükçe teklifler burada toplanır.{' '}
                        <Link to="/ustalar" className="font-medium text-mor-soluk hover:text-white">
                            Ustalara göz at
                        </Link>
                    </p>
                ) : (
                    <>
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="text-[15px] font-semibold text-white">Gelen teklifler</h3>
                            <div role="tablist" aria-label="Teklif görünümü" className="flex rounded-full border border-white/[0.09] bg-white/[0.02] p-1">
                                {[
                                    ['liste', 'Liste'],
                                    ['karsilastir', 'Karşılaştır'],
                                ].map(([g, ad]) => (
                                    <button
                                        key={g}
                                        type="button"
                                        role="tab"
                                        aria-selected={gorunum === g}
                                        disabled={g === 'karsilastir' && !karsilastirilabilir}
                                        title={g === 'karsilastir' && !karsilastirilabilir ? 'Karşılaştırmak için en az iki teklif gerekir' : undefined}
                                        onClick={() => setGorunum(g)}
                                        className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${gorunum === g ? 'bg-mor/25 text-white' : 'text-gri hover:text-white'}`}
                                    >
                                        {ad}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {gorunum === 'karsilastir' && karsilastirilabilir ? (
                            <Karsilastirma teklifler={teklifler} ilan={ilan} portfoyler={portfoyler} kabulEt={kabulEt} reddet={reddet} />
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {teklifler.map((t) => (
                                    <TeklifKarti key={t.id} teklif={t} ilan={ilan} portfoy={portfoyler[t.yazilimci_id]?.length || 0} kabulEt={kabulEt} reddet={reddet} />
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>
        </article>
    )
}

function Ilanlarim() {
    useSayfaBasligi('İlanlarım')
    const oturum = useAuth()
    // Geliştirmede ?onizleme=is-veren ile örnek veriyle görülebilir (canlıda yok)
    const [onizleme] = useState(() => (import.meta.env.DEV ? ilanlarimOnizlemesi(new URLSearchParams(window.location.search).get('onizleme')) : null))
    const user = oturum.user || onizleme?.user || null
    const authYukleniyor = onizleme ? false : oturum.yukleniyor
    const bildir = useBildirim()
    const onayla = useOnay()
    const [ilanlar, setIlanlar] = useState([])
    const [teklifler, setTeklifler] = useState({})
    const [portfoyler, setPortfoyler] = useState({})
    const [degerlendirmelerim, setDegerlendirmelerim] = useState({})
    const [yukleniyor, setYukleniyor] = useState(true)

    const veriGetir = useCallback(async () => {
        if (!user) return
        if (onizleme && !oturum.user) {
            setIlanlar(onizleme.ilanlar)
            setTeklifler(onizleme.teklifler)
            setPortfoyler(onizleme.portfoyler)
            setDegerlendirmelerim(onizleme.degerlendirmelerim || {})
            setYukleniyor(false)
            return
        }
        const { data: ilanData, error } = await supabase
            .from('ilanlar')
            .select('id, baslik, butce_min, butce_max, gerekli_teknolojiler, durum, created_at')
            .eq('is_veren_id', user.id)
            .order('created_at', { ascending: false })

        if (!error && ilanData) {
            setIlanlar(ilanData)
            // Tüm ilanların teklifleri tek sorguda gelir, ilana göre gruplanır
            const idler = ilanData.map((ilan) => ilan.id)
            const teklifMap = Object.fromEntries(idler.map((ilanId) => [ilanId, []]))
            let ustaIdler = []
            if (idler.length) {
                const { data: teklifData } = await supabase
                    .from('teklifler')
                    .select('id, ilan_id, yazilimci_id, mesaj, teklif_tutari, durum, created_at, profiller!teklifler_yazilimci_id_fkey(ad_soyad, unvan, onayli, musaitlik, teknolojiler, avatar_url)')
                    .in('ilan_id', idler)
                    .order('created_at', { ascending: false })
                for (const teklif of teklifData || []) teklifMap[teklif.ilan_id]?.push(teklif)
                ustaIdler = [...new Set((teklifData || []).map((t) => t.yazilimci_id))]
            }
            setTeklifler(teklifMap)
            const [portfoy, degerlendirme] = await Promise.all([
                portfoyleriGetir(supabase, ustaIdler),
                verdigimDegerlendirmeler(supabase, user.id, ilanData.filter((i) => i.durum === 'tamamlandi').map((i) => i.id)),
            ])
            setPortfoyler(portfoy)
            setDegerlendirmelerim(degerlendirme)
        }
        setYukleniyor(false)
    }, [user, onizleme, oturum.user])

    useEffect(() => {
        if (user) veriGetir()
    }, [user, veriGetir])

    async function kabulEt(teklif) {
        const ad = teklif.profiller?.ad_soyad || 'Ustanın'
        const evet = await onayla({
            baslik: `${ad} teklifi kabul edilsin mi?`,
            metin: 'Usta bilgilendirilir ve aranızda mesajlaşma açılır. Ödeme Kalfahane üzerinden yapılmaz; şartları ve ödemeyi mesajlaşmada netleştirin.',
            onay: 'Teklifi kabul et',
        })
        if (!evet) return
        const { error } = await supabase.from('teklifler').update({ durum: 'kabul_edildi' }).eq('id', teklif.id)
        if (error) bildir('Teklif kabul edilemedi. Tekrar dene.', { tur: 'hata' })
        else bildir('Teklif kabul edildi; mesajlaşma açıldı.', { tur: 'basari' })
        veriGetir()
    }

    async function reddet(teklif) {
        const evet = await onayla({
            baslik: 'Teklif reddedilsin mi?',
            metin: 'Usta, teklifinin reddedildiğini görür.',
            onay: 'Teklifi reddet',
            tehlike: true,
        })
        if (!evet) return
        const { error } = await supabase.from('teklifler').update({ durum: 'reddedildi' }).eq('id', teklif.id)
        if (error) bildir('Teklif reddedilemedi. Tekrar dene.', { tur: 'hata' })
        else bildir('Teklif reddedildi.')
        veriGetir()
    }

    async function durumDegistir(ilan, durum) {
        if (durum === 'tamamlandi') {
            const evet = await onayla({
                baslik: 'İş tamamlandı olarak işaretlensin mi?',
                metin: 'Kabul ettiğin ustanın kıdemine bir tamamlanan iş işlenir ve ilan yeni teklif almaz. Yalnızca iş gerçekten teslim edildiyse işaretle.',
                onay: 'Tamamlandı olarak işaretle',
            })
            if (!evet) return
        } else if (durum === 'kapali') {
            const evet = await onayla({ baslik: 'İlan kapatılsın mı?', metin: 'İlan listeden kalkar ve yeni teklif almaz. İstediğinde yeniden açabilirsin.', onay: 'İlanı kapat' })
            if (!evet) return
        }
        const { error } = await supabase.from('ilanlar').update({ durum }).eq('id', ilan.id)
        if (error) bildir('Durum güncellenemedi. Tekrar dene.', { tur: 'hata' })
        else bildir(durum === 'acik' ? 'İlan yeniden açıldı.' : durum === 'kapali' ? 'İlan kapatıldı.' : 'İş tamamlandı olarak işaretlendi.', { tur: 'basari' })
        veriGetir()
    }

    if (authYukleniyor || (user && yukleniyor)) {
        return (
            <div className="min-h-screen bg-black px-4 pt-24 sm:px-8" role="status" aria-label="Yükleniyor">
                <div className="mx-auto max-w-[980px] animate-pulse space-y-5 motion-reduce:animate-none">
                    <div className="h-14 w-60 rounded-2xl bg-white/[0.05]" />
                    <div className="h-64 rounded-[24px] bg-white/[0.04]" />
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="uzay flex min-h-screen items-center px-4">
                <SonucYok BaslikEtiketi="h1" baslik="İlanlarını görmek için giriş yap" metin="Açtığın ilanlar ve gelen teklifler burada toplanır." eylem={<HapLink to="/giris">Giriş yap</HapLink>} />
            </div>
        )
    }

    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />
            <section className="px-4 pb-28 pt-14 sm:px-8 lg:pt-20">
                <div className="mx-auto max-w-[980px]">
                    <header className="flex flex-wrap items-end justify-between gap-6">
                        <div>
                            <h1 className="font-pjs text-[clamp(2.2rem,4.6vw,3.6rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white">İlanlarım</h1>
                            <p className="mt-3 text-[16px] font-light text-gri">Açtığın ilanlar ve gelen teklifler. Teklifleri yan yana karşılaştırıp karar ver.</p>
                        </div>
                        <HapLink to="/ilan-ver">Yeni ilan</HapLink>
                    </header>

                    <div className="mt-10">
                        {ilanlar.length === 0 ? (
                            <SonucYok
                                baslik="Henüz ilan açmadın"
                                metin="İşini dört kısa adımda anlat; doğrulanmış ustalar teklif getirsin. İlan açmak ücretsiz."
                                eylem={<HapLink to="/ilan-ver">İlk ilanını ver</HapLink>}
                            />
                        ) : (
                            <div className="flex flex-col gap-6">
                                {ilanlar.map((ilan) => (
                                    <IlanPaneli
                                        key={ilan.id}
                                        ilan={ilan}
                                        teklifler={teklifler[ilan.id] || []}
                                        portfoyler={portfoyler}
                                        durumDegistir={durumDegistir}
                                        kabulEt={kabulEt}
                                        reddet={reddet}
                                        degerlendirmelerim={degerlendirmelerim}
                                        kullaniciId={user.id}
                                        yenile={veriGetir}
                                        onizleme={Boolean(onizleme && !oturum.user)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Ilanlarim
