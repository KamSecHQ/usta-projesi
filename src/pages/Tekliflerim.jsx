import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import { zamanFarki, tl, butceGoster, butceyeGore } from '../ustaYardimcilari'
import { SonucYok, FiltreCipi } from '../components/liste/ListeAraclari'
import { HapLink } from '../components/uzay/Hareket'
import MesajlasDugmesi from '../components/MesajlasDugmesi'
import DegerlendirmeFormu from '../components/degerlendirme/DegerlendirmeFormu'
import { verdigimDegerlendirmeler } from '../components/degerlendirme/degerlendirmeVerisi'
import { tekliflerimOnizlemesi } from './tekliflerimOnizleme'
import GirisKapisi from '../components/hesap/GirisKapisi'

const DURUMLAR = [
    ['', 'Tümü'],
    ['beklemede', 'Beklemede'],
    ['kabul_edildi', 'Kabul edildi'],
    ['reddedildi', 'Reddedildi'],
]
const DURUM_ADI = { beklemede: 'Beklemede', kabul_edildi: 'Kabul edildi', reddedildi: 'Reddedildi' }
const ILAN_DURUMU = { acik: 'İlan açık', kapali: 'İlan kapandı', tamamlandi: 'İş tamamlandı' }

// Teklifin durumuna göre ustaya bir sonraki adım
function sonrakiAdim(teklif) {
    if (teklif.durum === 'kabul_edildi' && teklif.ilanlar?.durum === 'tamamlandi') return 'İş tamamlandı olarak işaretlendi ve kıdemine işlendi.'
    if (teklif.durum === 'kabul_edildi') return 'Anlaştınız. Ödemeyi ve teslimi iş verenle mesajlaşmada netleştirin; Kalfahane üzerinden ödeme yapılmaz.'
    if (teklif.durum === 'reddedildi') return 'Bu sefer olmadı. Benzer ilanlara göz atmaya devam et.'
    if (teklif.ilanlar?.durum !== 'acik') return 'İlan kapandı; iş veren henüz karar vermedi.'
    return 'İş veren teklifini inceliyor. Sorusu olursa mesajlaşmadan yazar.'
}

function TeklifKarti({ teklif, isVeren, mevcutDegerlendirme, kullaniciId, yenile, onizleme }) {
    const ilan = teklif.ilanlar
    const konum = ilan ? butceyeGore(teklif.teklif_tutari, ilan.butce_min, ilan.butce_max) : null
    const butce = ilan ? butceGoster(ilan.butce_min, ilan.butce_max) : null
    const rozet = teklif.durum === 'kabul_edildi' ? 'bg-[#4ADE80]/12 text-[#86EFAC]' : teklif.durum === 'reddedildi' ? 'bg-red-400/10 text-[#FCA5A5]' : 'bg-mor/20 text-mor-soluk'
    const degerlendirilebilir = teklif.durum === 'kabul_edildi' && ilan?.durum === 'tamamlandi'

    return (
        <li>
            <article className="rounded-[22px] border border-white/[0.08] bg-[#08080D] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                        {ilan ? (
                            <Link to={`/is-ilanlari/${ilan.id}`} className="text-[18px] font-medium tracking-[-0.01em] text-white hover:text-mor-soluk">
                                {ilan.baslik}
                            </Link>
                        ) : (
                            <p className="text-[18px] font-medium text-gri">İlan kaldırılmış</p>
                        )}
                        <p className="mt-1 text-[13px] text-gri">
                            {zamanFarki(teklif.created_at)} teklif verdin
                            {ilan && <> · {ILAN_DURUMU[ilan.durum]}</>}
                            {isVeren?.ad_soyad && <> · {isVeren.ad_soyad}</>}
                        </p>
                    </div>
                    <span className={`uz-etiket ${rozet}`}>{DURUM_ADI[teklif.durum]}</span>
                </div>

                <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-3">
                    <div>
                        <p className="text-[12.5px] text-gri-koyu">Teklifin</p>
                        <p className="rakam mt-0.5 text-[20px] font-medium text-white">{teklif.teklif_tutari ? tl(teklif.teklif_tutari) : 'Tutar vermedin'}</p>
                    </div>
                    {butce && (
                        <div>
                            <p className="text-[12.5px] text-gri-koyu">İlan bütçesi</p>
                            <p className="rakam mt-0.5 text-[15px] text-gri">
                                {butce}
                                {konum && <span className={konum.yon > 0 ? 'text-[#FCA5A5]' : 'text-[#86EFAC]'}> · {konum.metin.toLocaleLowerCase('tr-TR')}</span>}
                            </p>
                        </div>
                    )}
                </div>

                {teklif.mesaj && <p className="mt-4 line-clamp-3 whitespace-pre-line text-[14.5px] leading-relaxed text-gri">{teklif.mesaj}</p>}

                {degerlendirilebilir && (
                    <div className="mt-5">
                        <DegerlendirmeFormu
                            ilanId={ilan.id}
                            kullaniciId={kullaniciId}
                            degerlenenId={ilan.is_veren_id}
                            degerlenenAd={isVeren?.ad_soyad || 'İş veren'}
                            mevcut={mevcutDegerlendirme}
                            onTamam={yenile}
                            onizleme={onizleme}
                        />
                    </div>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                    <p className="max-w-[56ch] text-[13.5px] text-gri">{sonrakiAdim(teklif)}</p>
                    {ilan && (
                        <MesajlasDugmesi teklifId={teklif.id} className={`isik ${teklif.durum === 'kabul_edildi' ? 'isik-birincil' : 'isik-cam'} rounded-full px-4 py-2 text-[13px] font-semibold`}>
                            İş verenle mesajlaş
                        </MesajlasDugmesi>
                    )}
                </div>
            </article>
        </li>
    )
}

function Tekliflerim() {
    useSayfaBasligi('Tekliflerim')
    const oturum = useAuth()
    // Geliştirmede ?onizleme=yazilimci ile örnek veriyle görülebilir (canlıda yok)
    const [onizleme] = useState(() => (import.meta.env.DEV ? tekliflerimOnizlemesi(new URLSearchParams(window.location.search).get('onizleme')) : null))
    const user = oturum.user || onizleme?.user || null
    const authYukleniyor = onizleme ? false : oturum.yukleniyor
    const [parametreler, setParametreler] = useSearchParams()
    const durum = parametreler.get('durum') || ''

    const [teklifler, setTeklifler] = useState([])
    const [isVerenler, setIsVerenler] = useState({})
    const [degerlendirmelerim, setDegerlendirmelerim] = useState({})
    const [yukleniyor, setYukleniyor] = useState(true)

    const veriGetir = useCallback(async () => {
        if (!user) return
        if (onizleme && !oturum.user) {
            setTeklifler(onizleme.teklifler)
            setIsVerenler(onizleme.isVerenler)
            setDegerlendirmelerim(onizleme.degerlendirmelerim)
            setYukleniyor(false)
            return
        }
        const { data, error } = await supabase
            .from('teklifler')
            .select('id, ilan_id, mesaj, teklif_tutari, durum, created_at, ilanlar(id, baslik, durum, is_veren_id, butce_min, butce_max)')
            .eq('yazilimci_id', user.id)
            .order('created_at', { ascending: false })
        const liste = !error && data ? data : []
        const isVerenIdler = [...new Set(liste.map((t) => t.ilanlar?.is_veren_id).filter(Boolean))]
        const tamamlananIlanlar = liste.filter((t) => t.durum === 'kabul_edildi' && t.ilanlar?.durum === 'tamamlandi').map((t) => t.ilan_id)
        const [isVerenSonuc, degerlendirme] = await Promise.all([
            isVerenIdler.length ? supabase.from('profiller').select('id, ad_soyad').in('id', isVerenIdler) : Promise.resolve({ data: [] }),
            verdigimDegerlendirmeler(supabase, user.id, tamamlananIlanlar),
        ])
        setTeklifler(liste)
        setIsVerenler(Object.fromEntries((isVerenSonuc.data || []).map((p) => [p.id, p])))
        setDegerlendirmelerim(degerlendirme)
        setYukleniyor(false)
    }, [user, onizleme, oturum.user])

    useEffect(() => {
        if (user) veriGetir()
    }, [user, veriGetir])

    if (authYukleniyor || (user && yukleniyor)) {
        return <div className="uzay min-h-screen" role="status" aria-label="Yükleniyor"><div className="uz-yildizlar" aria-hidden /></div>
    }

    if (!user) {
        return (
            <GirisKapisi ikon="teklif" baslik="Tekliflerin burada toplanır" metin="Verdiğin teklifleri, durumlarını ve sıradaki adımı tek yerden izle. Görmek için giriş yap." kayitRolu="yazilimci" />
        )
    }

    const sayilar = Object.fromEntries(DURUMLAR.map(([d]) => [d, d ? teklifler.filter((t) => t.durum === d).length : teklifler.length]))
    const gorunen = durum ? teklifler.filter((t) => t.durum === durum) : teklifler

    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />
            <section className="px-4 pb-28 pt-14 sm:px-8 lg:pt-20">
                <div className="mx-auto max-w-[860px]">
                    <header className="flex flex-wrap items-end justify-between gap-6">
                        <div>
                            <h1 className="font-pjs text-[clamp(2.2rem,4.6vw,3.6rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white">Tekliflerim</h1>
                            <p className="mt-3 text-[16px] font-light text-gri">Verdiğin teklifler, durumları ve sıradaki adımın.</p>
                        </div>
                        <HapLink to="/is-ilanlari" tur="cam">
                            Açık ilanlar
                        </HapLink>
                    </header>

                    {teklifler.length > 0 && (
                        <div className="liste-serit mt-8" role="group" aria-label="Duruma göre süz">
                            {DURUMLAR.map(([d, ad]) => (
                                <FiltreCipi key={d || 'tumu'} secili={durum === d} tikla={() => setParametreler(d ? { durum: d } : {}, { replace: true })}>
                                    {ad}
                                    <span className="rakam text-[11px] text-gri">{sayilar[d]}</span>
                                </FiltreCipi>
                            ))}
                        </div>
                    )}

                    <div className="mt-6">
                        {teklifler.length === 0 ? (
                            <SonucYok baslik="Henüz teklif vermedin" metin="Açık ilanlara göz at; teknolojilerine uyan bir işe ilk teklifini ver." eylem={<HapLink to="/is-ilanlari">İlanlara göz at</HapLink>} />
                        ) : gorunen.length === 0 ? (
                            <SonucYok baslik="Bu durumda teklifin yok" metin="Başka bir durumu seç ya da tüm tekliflerine dön." eylem={<button type="button" onClick={() => setParametreler({}, { replace: true })} className="isik-hap rounded-full px-5 py-2.5 text-[14px] font-medium">Tümünü göster</button>} />
                        ) : (
                            <ul className="flex flex-col gap-4">
                                {gorunen.map((t) => (
                                    <TeklifKarti
                                        key={t.id}
                                        teklif={t}
                                        isVeren={isVerenler[t.ilanlar?.is_veren_id]}
                                        mevcutDegerlendirme={degerlendirmelerim[`${t.ilan_id}:${t.ilanlar?.is_veren_id}`]}
                                        kullaniciId={user.id}
                                        yenile={veriGetir}
                                        onizleme={Boolean(onizleme && !oturum.user)}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Tekliflerim
