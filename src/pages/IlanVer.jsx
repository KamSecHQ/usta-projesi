import { useState, useEffect, useId, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import { useBildirim } from '../components/bildirim/bildirimBaglami'
import { HapLink, Ok } from '../components/uzay/Hareket'
import { Anahtar } from '../components/liste/ListeAraclari'
import IlanKarti from '../components/ilan/IlanKarti'
import TeknolojiSecici from '../components/ilan/TeknolojiSecici'
import { SABLONLAR, TESLIM_SECENEKLERI, aciklamaOlustur } from '../components/ilan/ilanSablonlari'
import { TEKNOLOJILER } from '../components/atolye/teknolojiler'
import { butceGoster } from '../ustaYardimcilari'
import GirisKapisi, { KapiSayfasi } from '../components/hesap/GirisKapisi'

const ADIMLAR = ['İş türü', 'Anlat', 'Teknoloji ve bütçe', 'Gözden geçir']
const BOS_TASLAK = {
    sablon: null,
    baslik: '',
    ozet: '',
    cevaplar: ['', '', ''],
    notlar: '',
    teslim: '',
    teknolojiler: [],
    ustayaBirak: false,
    butceMin: '',
    butceMax: '',
    teklifeAcik: false,
}
const taslakAnahtari = (kullaniciId) => `kalfahane-ilan-taslagi-${kullaniciId}`

// İlan netliği: iyi teklif almayı kolaylaştıran maddeler, girilen bilgiden hesaplanır
function netlikMaddeleri(t) {
    return [
        { ad: 'Başlık işi anlatıyor', tamam: t.baslik.trim().length >= 12 },
        { ad: 'Özet yeterince açık', tamam: t.ozet.trim().length >= 60 },
        { ad: 'Yönlendirici sorulardan en az biri cevaplandı', tamam: t.cevaplar.some((c) => c.trim().length > 0) },
        { ad: 'Teknoloji seçildi ya da ustaya bırakıldı', tamam: t.teknolojiler.length > 0 || t.ustayaBirak },
        { ad: 'Bütçe aralığı belirtildi', tamam: !t.teklifeAcik && Boolean(t.butceMin || t.butceMax) },
        { ad: 'Teslim beklentisi seçildi', tamam: Boolean(t.teslim) },
    ]
}

function adimHatalari(adim, t) {
    const h = {}
    if (adim === 0 && !t.sablon) h.sablon = 'Devam etmek için bir iş türü seç.'
    if (adim === 1) {
        if (t.baslik.trim().length < 8) h.baslik = 'Başlık en az 8 karakter olmalı.'
        if (t.ozet.trim().length < 30) h.ozet = 'İşi en az bir iki cümleyle anlat (30 karakter).'
    }
    if (adim === 2 && !t.teklifeAcik) {
        const min = t.butceMin === '' ? null : Number(t.butceMin)
        const max = t.butceMax === '' ? null : Number(t.butceMax)
        if ((min !== null && min < 0) || (max !== null && max < 0)) h.butce = 'Bütçe eksi olamaz.'
        else if (min !== null && max !== null && min > max) h.butce = 'En az tutar, en çok tutardan büyük olamaz.'
    }
    return h
}

function Alan({ etiket, hata, ipucu, children, id }) {
    return (
        <div>
            <label htmlFor={id} className="alan-etiket">
                {etiket}
            </label>
            {children}
            {hata ? (
                <p id={`${id}-hata`} className="alan-hata" role="alert">
                    {hata}
                </p>
            ) : (
                ipucu && <p className="alan-ipucu">{ipucu}</p>
            )}
        </div>
    )
}

// Geliştirmede giriş yapmadan denemek için: /ilan-ver?onizleme=is-veren (yayınlama kapalı)
const ONIZLEME = import.meta.env.DEV && new URLSearchParams(window.location.search).get('onizleme') === 'is-veren'
const ONIZLEME_KULLANICI = { id: 'onizleme' }

function IlanVer() {
    useSayfaBasligi('İlan ver')
    const oturum = useAuth()
    const user = ONIZLEME ? ONIZLEME_KULLANICI : oturum.user
    const authYukleniyor = ONIZLEME ? false : oturum.yukleniyor
    const navigate = useNavigate()
    const bildir = useBildirim()
    const kok = useId()
    const icerik = useRef(null)

    const [rol, setRol] = useState(null)
    const [rolYukleniyor, setRolYukleniyor] = useState(true)
    const [adim, setAdim] = useState(0)
    const [enIleri, setEnIleri] = useState(0)
    const [t, setT] = useState(BOS_TASLAK)
    const [hatalar, setHatalar] = useState({})
    const [taslakGeldi, setTaslakGeldi] = useState(false)
    const [gonderiliyor, setGonderiliyor] = useState(false)

    useEffect(() => {
        if (!user) return
        if (ONIZLEME) {
            setRol('is-veren')
            setRolYukleniyor(false)
            return
        }
        supabase
            .from('profiller')
            .select('rol')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
                setRol(data?.rol || null)
                setRolYukleniyor(false)
            })
    }, [user])

    // Taslak bu tarayıcıda saklanır: sayfadan çıkıp dönünce kaldığı yerden devam eder
    useEffect(() => {
        if (!user) return
        try {
            const kayit = JSON.parse(localStorage.getItem(taslakAnahtari(user.id)) || 'null')
            if (kayit?.taslak) {
                setT({ ...BOS_TASLAK, ...kayit.taslak })
                setAdim(kayit.adim || 0)
                setEnIleri(kayit.enIleri || 0)
                setTaslakGeldi(true)
            }
        } catch {
            // saklama kapalıysa taslaksız devam edilir
        }
    }, [user])

    useEffect(() => {
        if (!user || !t.sablon) return
        const id = setTimeout(() => {
            try {
                localStorage.setItem(taslakAnahtari(user.id), JSON.stringify({ taslak: t, adim, enIleri }))
            } catch {
                // saklama kapalı
            }
        }, 400)
        return () => clearTimeout(id)
    }, [t, adim, enIleri, user])

    const sablon = SABLONLAR.find((s) => s.kod === t.sablon)
    const sorular = sablon?.sorular || []
    const netlik = useMemo(() => netlikMaddeleri(t), [t])
    const netlikSayisi = netlik.filter((m) => m.tamam).length
    const aciklama = aciklamaOlustur({ ozet: t.ozet, sorular, cevaplar: t.cevaplar, teslim: t.teslim, notlar: t.notlar })
    const butceMin = t.teklifeAcik || t.butceMin === '' ? null : Number(t.butceMin)
    const butceMax = t.teklifeAcik || t.butceMax === '' ? null : Number(t.butceMax)
    const onizleme = {
        baslik: t.baslik.trim(),
        aciklama: t.ozet.trim() ? aciklama : '',
        butce_min: butceMin,
        butce_max: butceMax,
        gerekli_teknolojiler: t.ustayaBirak ? [] : t.teknolojiler,
        created_at: new Date().toISOString(),
    }

    const guncelle = (alan, deger) => setT((onceki) => ({ ...onceki, [alan]: deger }))

    function sablonSec(kod) {
        const yeni = SABLONLAR.find((s) => s.kod === kod)
        const eski = SABLONLAR.find((s) => s.kod === t.sablon)
        setT((o) => ({
            ...o,
            sablon: kod,
            // Başlık ve teknolojiler yalnızca kullanıcı henüz kendisi yazmadıysa önerilir
            baslik: !o.baslik || o.baslik === eski?.baslik ? yeni.baslik : o.baslik,
            teknolojiler: o.teknolojiler.length === 0 || o.teknolojiler.join() === eski?.teknolojiler.join() ? yeni.teknolojiler : o.teknolojiler,
        }))
        setHatalar({})
    }

    function adimaGit(yeni) {
        setAdim(yeni)
        setEnIleri((e) => Math.max(e, yeni))
        setHatalar({})
        requestAnimationFrame(() => icerik.current?.focus({ preventScroll: true }))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function ileri() {
        const h = adimHatalari(adim, t)
        setHatalar(h)
        if (Object.keys(h).length === 0) adimaGit(adim + 1)
    }

    function taslagiSil() {
        try {
            localStorage.removeItem(taslakAnahtari(user.id))
        } catch {
            // yoksay
        }
        setT(BOS_TASLAK)
        setAdim(0)
        setEnIleri(0)
        setTaslakGeldi(false)
    }

    async function yayinla() {
        for (let i = 0; i < 3; i++) {
            const h = adimHatalari(i, t)
            if (Object.keys(h).length) {
                setHatalar(h)
                adimaGit(i)
                return
            }
        }
        if (ONIZLEME) {
            bildir('Önizleme modunda ilan yayınlanmaz.', { tur: 'bilgi' })
            return
        }
        setGonderiliyor(true)
        const { data, error } = await supabase
            .from('ilanlar')
            .insert({
                is_veren_id: user.id,
                baslik: t.baslik.trim(),
                aciklama,
                butce_min: butceMin,
                butce_max: butceMax,
                gerekli_teknolojiler: t.ustayaBirak ? [] : t.teknolojiler,
            })
            .select('id')
            .single()
        setGonderiliyor(false)
        if (error) {
            bildir('İlan yayınlanamadı. Bağlantını kontrol edip tekrar dene.', { tur: 'hata' })
            return
        }
        try {
            localStorage.removeItem(taslakAnahtari(user.id))
        } catch {
            // yoksay
        }
        bildir('İlanın yayında. Teklifler geldikçe İlanlarım’da göreceksin.', { tur: 'basari', sure: 4500 })
        navigate(`/is-ilanlari/${data.id}`)
    }

    if (authYukleniyor || (user && rolYukleniyor)) {
        return <div className="uzay min-h-screen" role="status" aria-label="Yükleniyor"><div className="uz-yildizlar" aria-hidden /></div>
    }

    if (!user) {
        return (
            <GirisKapisi ikon="arti" baslik="İlan vermek için giriş yap" metin="İlan açmak ücretsiz. Hesabın yoksa iş veren olarak birkaç dakikada açabilirsin." kayitRolu="is-veren" />
        )
    }

    if (rol !== 'is-veren') {
        return (
            <KapiSayfasi ikon="ilanlar" baslik="İlan vermek için iş veren hesabı gerekiyor" metin="Bu hesap yazılımcı olarak kayıtlı. Açık ilanlara teklif verebilir ya da iş veren olarak ayrı bir hesap açabilirsin." eylem={<HapLink to="/is-ilanlari">Açık ilanlara bak</HapLink>} />
        )
    }

    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />
            <section className="px-4 pb-28 pt-14 sm:px-8 lg:pt-20">
                <div className="mx-auto max-w-[1180px]">
                    <header className="flex flex-wrap items-end justify-between gap-6">
                        <div>
                            <h1 className="font-pjs text-[clamp(2.2rem,4.6vw,3.6rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white">İş ilanı ver</h1>
                            <p className="mt-3 max-w-[56ch] text-pretty text-[16px] font-light leading-[1.6] text-gri">
                                Dört kısa adım. Ne kadar açık anlatırsan ustalar o kadar isabetli teklif getirir. İlan açmak ücretsiz.
                            </p>
                        </div>
                        {taslakGeldi && (
                            <p className="flex items-center gap-3 text-[13.5px] text-gri">
                                Kaldığın yerden devam ediyorsun.
                                <button type="button" onClick={taslagiSil} className="font-medium text-mor-soluk hover:text-white">
                                    Baştan başla
                                </button>
                            </p>
                        )}
                    </header>

                    <nav className="adimlar mt-10" style={{ '--adim-sayisi': ADIMLAR.length }} aria-label="İlan adımları">
                        {ADIMLAR.map((ad, i) => (
                            <button
                                key={ad}
                                type="button"
                                className="adim"
                                aria-current={i === adim ? 'step' : undefined}
                                data-durum={i < adim || (i <= enIleri && i !== adim) ? 'gecti' : undefined}
                                disabled={i > enIleri || i === adim}
                                onClick={() => adimaGit(i)}
                            >
                                <span className="rakam text-[12px] text-gri-koyu">{i + 1}</span>
                                <span className="hidden sm:inline">{ad}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
                        <div ref={icerik} tabIndex={-1} className="outline-none" aria-live="polite">
                            {adim === 0 && (
                                <fieldset>
                                    <legend className="text-[22px] font-medium tracking-[-0.015em] text-white">Ne yaptıracaksın?</legend>
                                    <p className="mt-2 text-[15px] text-gri">Bir şablon seç; sana uygun sorular ve teknoloji önerileri gelsin.</p>
                                    <div role="radiogroup" aria-label="İş türü" className="mt-6 grid gap-3 sm:grid-cols-2">
                                        {SABLONLAR.map((s) => (
                                            <button key={s.kod} type="button" role="radio" aria-checked={t.sablon === s.kod} onClick={() => sablonSec(s.kod)} className="secim-kart">
                                                <span className="text-[16px] font-semibold text-white">{s.ad}</span>
                                                <span className="text-[13.5px] text-gri">{s.ozet}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {hatalar.sablon && (
                                        <p className="alan-hata" role="alert">
                                            {hatalar.sablon}
                                        </p>
                                    )}
                                </fieldset>
                            )}

                            {adim === 1 && (
                                <div className="flex flex-col gap-7">
                                    <h2 className="text-[22px] font-medium tracking-[-0.015em] text-white">İşini anlat</h2>
                                    <Alan id={`${kok}-baslik`} etiket="İlan başlığı" hata={hatalar.baslik} ipucu="Ustalar listede ilk bunu görür; işi tek cümlede söyle.">
                                        <input
                                            id={`${kok}-baslik`}
                                            className="alan"
                                            value={t.baslik}
                                            maxLength={90}
                                            onChange={(e) => guncelle('baslik', e.target.value)}
                                            placeholder="örn. Kafemiz için online sipariş sitesi"
                                            aria-invalid={Boolean(hatalar.baslik)}
                                            aria-describedby={hatalar.baslik ? `${kok}-baslik-hata` : undefined}
                                        />
                                    </Alan>
                                    <Alan id={`${kok}-ozet`} etiket="Kısaca iş" hata={hatalar.ozet} ipucu={`Kartta görünen kısım. ${t.ozet.trim().length} karakter; 60'ı geçerse netlik artar.`}>
                                        <textarea
                                            id={`${kok}-ozet`}
                                            className="alan"
                                            rows={3}
                                            maxLength={600}
                                            value={t.ozet}
                                            onChange={(e) => guncelle('ozet', e.target.value)}
                                            placeholder="Ne yapılmasını istiyorsun, kimler kullanacak, neden şimdi?"
                                            aria-invalid={Boolean(hatalar.ozet)}
                                            aria-describedby={hatalar.ozet ? `${kok}-ozet-hata` : undefined}
                                        />
                                    </Alan>
                                    {sorular.map((soru, i) => (
                                        <Alan key={soru} id={`${kok}-soru-${i}`} etiket={soru} ipucu="İsteğe bağlı">
                                            <textarea
                                                id={`${kok}-soru-${i}`}
                                                className="alan"
                                                rows={2}
                                                maxLength={800}
                                                value={t.cevaplar[i] || ''}
                                                onChange={(e) => {
                                                    const cevaplar = [...t.cevaplar]
                                                    cevaplar[i] = e.target.value
                                                    guncelle('cevaplar', cevaplar)
                                                }}
                                            />
                                        </Alan>
                                    ))}
                                    <fieldset>
                                        <legend className="alan-etiket">Ne zaman teslim edilsin?</legend>
                                        <div role="radiogroup" aria-label="Teslim beklentisi" className="flex flex-wrap gap-2">
                                            {TESLIM_SECENEKLERI.map((s) => (
                                                <button key={s} type="button" role="radio" aria-checked={t.teslim === s} onClick={() => guncelle('teslim', t.teslim === s ? '' : s)} className="liste-cip">
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </fieldset>
                                    <Alan id={`${kok}-not`} etiket="Ek notlar" ipucu="İsteğe bağlı: bütçe esnekliği, toplantı tercihi, dikkat edilmesini istediğin şeyler.">
                                        <textarea id={`${kok}-not`} className="alan" rows={2} maxLength={800} value={t.notlar} onChange={(e) => guncelle('notlar', e.target.value)} />
                                    </Alan>
                                </div>
                            )}

                            {adim === 2 && (
                                <div className="flex flex-col gap-8">
                                    <h2 className="text-[22px] font-medium tracking-[-0.015em] text-white">Teknoloji ve bütçe</h2>
                                    <div>
                                        <div className={t.ustayaBirak ? 'pointer-events-none opacity-40' : ''} aria-disabled={t.ustayaBirak}>
                                            <TeknolojiSecici
                                                etiket="Gereken teknolojiler"
                                                deger={t.teknolojiler}
                                                degisti={(d) => guncelle('teknolojiler', d)}
                                                oneriler={[...new Set([...(sablon?.teknolojiler || []), ...TEKNOLOJILER.map((x) => x.ad)])].slice(0, 10)}
                                            />
                                        </div>
                                        <div className="mt-4">
                                            <Anahtar acik={t.ustayaBirak} degisti={(a) => guncelle('ustayaBirak', a)}>
                                                Bilmiyorum, teknolojiyi ustaya bırak
                                            </Anahtar>
                                        </div>
                                    </div>

                                    <fieldset>
                                        <legend className="alan-etiket">Bütçe aralığı (₺, toplam)</legend>
                                        <div className={`grid gap-3 sm:grid-cols-2 ${t.teklifeAcik ? 'pointer-events-none opacity-40' : ''}`}>
                                            <input
                                                className="alan rakam"
                                                type="number"
                                                inputMode="numeric"
                                                min="0"
                                                step="500"
                                                value={t.butceMin}
                                                onChange={(e) => guncelle('butceMin', e.target.value)}
                                                placeholder="En az"
                                                aria-label="En az bütçe (₺)"
                                                aria-invalid={Boolean(hatalar.butce)}
                                                disabled={t.teklifeAcik}
                                            />
                                            <input
                                                className="alan rakam"
                                                type="number"
                                                inputMode="numeric"
                                                min="0"
                                                step="500"
                                                value={t.butceMax}
                                                onChange={(e) => guncelle('butceMax', e.target.value)}
                                                placeholder="En çok"
                                                aria-label="En çok bütçe (₺)"
                                                aria-invalid={Boolean(hatalar.butce)}
                                                disabled={t.teklifeAcik}
                                            />
                                        </div>
                                        {hatalar.butce ? (
                                            <p className="alan-hata" role="alert">
                                                {hatalar.butce}
                                            </p>
                                        ) : (
                                            <p className="alan-ipucu rakam">
                                                {butceGoster(butceMin, butceMax) ? `İlanda görünecek: ${butceGoster(butceMin, butceMax)}` : 'Bir aralık vermek, ustaların işine uygun teklif hazırlamasını kolaylaştırır.'}
                                            </p>
                                        )}
                                        <div className="mt-4">
                                            <Anahtar acik={t.teklifeAcik} degisti={(a) => guncelle('teklifeAcik', a)}>
                                                Bütçeyi teklife bırak
                                            </Anahtar>
                                        </div>
                                    </fieldset>
                                    <p className="rounded-[14px] border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[13.5px] leading-relaxed text-gri">
                                        Ödeme Kalfahane üzerinden yapılmaz. Bir teklifi kabul ettiğinde ustayla mesajlaşma açılır; ödemeyi ve sözleşmeyi aranızda belirlersiniz. Emanet ödeme sistemi yakında.
                                    </p>
                                </div>
                            )}

                            {adim === 3 && (
                                <div className="flex flex-col gap-8">
                                    <h2 className="text-[22px] font-medium tracking-[-0.015em] text-white">Gözden geçir</h2>
                                    <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.02] p-6">
                                        <p className="text-[13px] text-gri-koyu">İlan sayfasında böyle görünecek</p>
                                        <h3 className="mt-3 text-[22px] font-medium tracking-[-0.015em] text-white">{t.baslik}</h3>
                                        <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-gri">{aciklama}</p>
                                        <dl className="mt-6 grid gap-4 border-t border-white/[0.08] pt-5 text-[14px] sm:grid-cols-2">
                                            <div>
                                                <dt className="text-gri-koyu">Bütçe</dt>
                                                <dd className="rakam mt-1 font-medium text-mor-soluk">{butceGoster(butceMin, butceMax) || 'Teklife açık'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-gri-koyu">Teknolojiler</dt>
                                                <dd className="mt-1 text-white">{t.ustayaBirak || t.teknolojiler.length === 0 ? 'Ustaya bırakıldı' : t.teknolojiler.join(', ')}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            )}

                            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-6">
                                {adim > 0 ? (
                                    <button type="button" onClick={() => adimaGit(adim - 1)} className="isik-hap rounded-full px-5 py-2.5 text-[14px] font-medium">
                                        Geri
                                    </button>
                                ) : (
                                    <span />
                                )}
                                {adim < ADIMLAR.length - 1 ? (
                                    <button type="button" onClick={ileri} className="isik-hap isik-hap-birincil inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14.5px] font-semibold">
                                        Devam <Ok />
                                    </button>
                                ) : (
                                    <button type="button" onClick={yayinla} disabled={gonderiliyor} className="isik-hap isik-hap-birincil inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14.5px] font-semibold disabled:opacity-60">
                                        {gonderiliyor ? 'Yayınlanıyor…' : 'İlanı yayınla'} {!gonderiliyor && <Ok />}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Canlı önizleme ve ilan netliği */}
                        <aside className="lg:sticky lg:top-[92px] lg:self-start" aria-label="Önizleme">
                            <p className="mb-3 text-[13px] text-gri-koyu">İlanlar listesinde böyle görünecek</p>
                            <IlanKarti ilan={onizleme} onizleme />
                            <div className="mt-5 rounded-[20px] border border-white/[0.08] bg-white/[0.02] p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-[14px] font-semibold text-white">İlan netliği</p>
                                    <p className="rakam text-[13px] text-mor-soluk">
                                        {netlikSayisi}/{netlik.length}
                                    </p>
                                </div>
                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-valuemin={0} aria-valuemax={netlik.length} aria-valuenow={netlikSayisi} aria-label="İlan netliği">
                                    <div className="h-full rounded-full bg-gradient-to-r from-mor to-mor-soluk shadow-[0_0_12px_rgba(167,139,250,0.8)] transition-[width] duration-500 ease-(--ease-cekic)" style={{ width: `${(netlikSayisi / netlik.length) * 100}%` }} />
                                </div>
                                <ul className="mt-4 flex flex-col gap-2 text-[13.5px]">
                                    {netlik.map((m) => (
                                        <li key={m.ad} className={`flex items-center gap-2.5 ${m.tamam ? 'text-white' : 'text-gri-koyu'}`}>
                                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${m.tamam ? 'bg-mor text-white' : 'border border-white/20'}`} aria-hidden>
                                                {m.tamam && (
                                                    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                                                        <path d="m3 6.2 2 1.9L9 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </span>
                                            <span>
                                                {m.ad}
                                                <span className="sr-only">{m.tamam ? ': tamam' : ': eksik'}</span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default IlanVer
