import { useState, useEffect, useCallback, useId, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import { butceGoster, butceyeGore, zamanFarki, tl, teknolojiUyumu, aramaIcinKatla, tamamlananIsSayisiGetir, kidemRozetiHesapla } from '../ustaYardimcilari'
import { useBildirim } from '../components/bildirim/bildirimBaglami'
import { HapLink, Ok } from '../components/uzay/Hareket'
import MesajlasDugmesi from '../components/MesajlasDugmesi'
import { aciklamayiAyir } from '../components/ilan/ilanSablonlari'
import { KapiSayfasi } from '../components/hesap/GirisKapisi'
import { ozetle } from '../paylasimEtiketleri'

const TEKLIF_DURUMU = { beklemede: 'Beklemede', kabul_edildi: 'Kabul edildi', reddedildi: 'Reddedildi' }
const MESAJ_ONERI = 80

// Geliştirmede giriş yapmadan teklif formunu görmek için: /is-ilanlari/:id?onizleme=yazilimci (gönderim kapalı)
const ONIZLEME = import.meta.env.DEV && new URLSearchParams(window.location.search).get('onizleme') === 'yazilimci'

function Kutu({ children, className = '' }) {
    return <div className={`rounded-[22px] border border-white/[0.08] bg-[#08080D] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${className}`}>{children}</div>
}

function TeklifFormu({ ilan, kullaniciId, onGonderildi }) {
    const bildir = useBildirim()
    const kok = useId()
    const [mesaj, setMesaj] = useState('')
    const [tutar, setTutar] = useState('')
    const [gonderiliyor, setGonderiliyor] = useState(false)
    const [hata, setHata] = useState('')
    const sayi = tutar === '' ? null : Number(tutar)
    const konum = butceyeGore(sayi, ilan.butce_min, ilan.butce_max)

    async function gonder(e) {
        e.preventDefault()
        if (mesaj.trim().length < 20) {
            setHata('Teklifini en az bir iki cümleyle anlat: yaklaşımın ve neden sen.')
            return
        }
        if (sayi !== null && sayi < 0) {
            setHata('Tutar eksi olamaz.')
            return
        }
        setHata('')
        if (ONIZLEME) {
            bildir('Önizleme modunda teklif gönderilmez.')
            return
        }
        setGonderiliyor(true)
        const { error } = await supabase.from('teklifler').insert({
            ilan_id: ilan.id,
            yazilimci_id: kullaniciId,
            mesaj: mesaj.trim(),
            teklif_tutari: sayi,
        })
        setGonderiliyor(false)
        if (error) {
            bildir('Teklif gönderilemedi. Tekrar dene.', { tur: 'hata' })
            return
        }
        bildir('Teklifin gönderildi. İş veren kabul ederse mesajlaşma açılır.', { tur: 'basari', sure: 4500 })
        onGonderildi()
    }

    return (
        <form onSubmit={gonder} noValidate className="flex flex-col gap-5">
            <div>
                <label htmlFor={`${kok}-tutar`} className="alan-etiket">
                    Teklif tutarın (₺, toplam)
                </label>
                <input
                    id={`${kok}-tutar`}
                    className="alan rakam"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="500"
                    value={tutar}
                    onChange={(e) => setTutar(e.target.value)}
                    placeholder="İsteğe bağlı"
                />
                <p className="alan-ipucu rakam" aria-live="polite">
                    {sayi ? (
                        <>
                            {tl(sayi)}
                            {konum && <span className={konum.yon > 0 ? 'text-[#FCA5A5]' : 'text-[#86EFAC]'}> · bütçeye göre {konum.metin.toLocaleLowerCase('tr-TR')}</span>}
                        </>
                    ) : (
                        'Tutar vermezsen iş veren mesajlaşmada sorar.'
                    )}
                </p>
            </div>
            <div>
                <label htmlFor={`${kok}-mesaj`} className="alan-etiket">
                    Teklifin
                </label>
                <textarea
                    id={`${kok}-mesaj`}
                    className="alan"
                    rows={6}
                    maxLength={2000}
                    value={mesaj}
                    onChange={(e) => setMesaj(e.target.value)}
                    placeholder={'Nasıl yaklaşırsın, benzer hangi işi yaptın, ne zaman teslim edersin?'}
                    aria-invalid={Boolean(hata)}
                    aria-describedby={`${kok}-mesaj-ipucu`}
                />
                <p id={`${kok}-mesaj-ipucu`} className={hata ? 'alan-hata' : 'alan-ipucu'} role={hata ? 'alert' : undefined}>
                    {hata || (
                        <>
                            <span className="rakam">{mesaj.trim().length}</span> karakter
                            {mesaj.trim().length < MESAJ_ONERI && ` · ${MESAJ_ONERI} karakteri geçen teklifler işi daha iyi anlatır`}
                        </>
                    )}
                </p>
            </div>
            <button type="submit" disabled={gonderiliyor} className="isik-hap isik-hap-birincil inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14.5px] font-semibold disabled:opacity-60">
                {gonderiliyor ? 'Gönderiliyor…' : 'Teklifi gönder'} {!gonderiliyor && <Ok />}
            </button>
            <p className="text-[12.5px] leading-relaxed text-gri-koyu">Ödeme Kalfahane üzerinden yapılmaz. Teklifin kabul edilirse iş verenle mesajlaşma açılır; şartları orada netleştirirsiniz.</p>
        </form>
    )
}

function IlanDetay() {
    const { id } = useParams()
    const oturum = useAuth()
    const user = oturum.user || (ONIZLEME ? { id: 'onizleme' } : null)
    const [ilan, setIlan] = useState(null)
    const [isVeren, setIsVeren] = useState(null)
    const [isVerenTamamlanan, setIsVerenTamamlanan] = useState(0)
    const [profil, setProfil] = useState(null)
    const [kendiTeklifim, setKendiTeklifim] = useState(null)
    const [yukleniyor, setYukleniyor] = useState(true)
    const [bulunamadi, setBulunamadi] = useState(false)

    useSayfaBasligi(ilan ? ilan.baslik : 'İş ilanı', ilan?.aciklama ? ozetle(ilan.aciklama) : undefined)

    const veriGetir = useCallback(async () => {
        const { data: ilanData, error } = await supabase.from('ilanlar').select('*').eq('id', id).single()
        if (error || !ilanData) {
            setBulunamadi(true)
            setYukleniyor(false)
            return
        }
        setIlan(ilanData)

        const isVerenSorgusu = supabase.from('profiller').select('id, ad_soyad, unvan, avatar_url').eq('id', ilanData.is_veren_id).single()
        // İş verenin kıdemi: herkese açık tamamlanan iş sayısı (kabul edilmiş teklifli, tamamlanmış ilanları)
        tamamlananIsSayisiGetir(supabase, ilanData.is_veren_id).then(setIsVerenTamamlanan)
        if (ONIZLEME && !oturum.user) {
            const { data: isVerenData } = await isVerenSorgusu
            setIsVeren(isVerenData)
            setProfil({ rol: 'yazilimci', teknolojiler: ['React', 'Next.js', 'Python'] })
            setYukleniyor(false)
            return
        }
        const [{ data: isVerenData }, profilSonuc, teklifSonuc] = await Promise.all([
            isVerenSorgusu,
            oturum.user ? supabase.from('profiller').select('rol, teknolojiler').eq('id', oturum.user.id).single() : Promise.resolve({ data: null }),
            oturum.user ? supabase.from('teklifler').select('*').eq('ilan_id', id).eq('yazilimci_id', oturum.user.id).maybeSingle() : Promise.resolve({ data: null }),
        ])
        setIsVeren(isVerenData)
        setProfil(profilSonuc.data)
        setKendiTeklifim(teklifSonuc.data)
        setYukleniyor(false)
    }, [id, oturum.user])

    useEffect(() => {
        veriGetir()
    }, [veriGetir])

    const parcalar = useMemo(() => aciklamayiAyir(ilan?.aciklama), [ilan])

    if (yukleniyor) {
        return (
            <div className="uzay relative min-h-screen px-4 pt-24 sm:px-8" role="status" aria-label="Yükleniyor">
                <div className="mx-auto grid max-w-[1180px] animate-pulse gap-10 motion-reduce:animate-none lg:grid-cols-[1fr_380px]">
                    <div className="space-y-4">
                        <div className="h-12 w-3/4 rounded-2xl bg-white/[0.05]" />
                        <div className="h-64 rounded-[22px] bg-white/[0.04]" />
                    </div>
                    <div className="h-80 rounded-[22px] bg-white/[0.04]" />
                </div>
            </div>
        )
    }

    if (bulunamadi) {
        return (
            <KapiSayfasi ikon="ilanlar" baslik="İlan bulunamadı" metin="İlan kaldırılmış ya da bağlantı hatalı olabilir. Açık ilanlara göz atabilirsin." eylem={<HapLink to="/is-ilanlari">Açık ilanlar</HapLink>} />
        )
    }

    const teknolojiler = ilan.gerekli_teknolojiler || []
    const butce = butceGoster(ilan.butce_min, ilan.butce_max)
    const kendiIlaniMi = user && ilan.is_veren_id === user.id
    const yazilimci = profil?.rol === 'yazilimci'
    const bildigim = new Set((profil?.teknolojiler || []).map(aramaIcinKatla))
    const uyum = yazilimci ? teknolojiUyumu(teknolojiler, profil.teknolojiler) : null

    let eylem
    if (kendiIlaniMi) {
        eylem = (
            <>
                <p className="text-[15px] text-white">Bu senin ilanın.</p>
                <p className="mt-1 text-[14px] text-gri">Gelen teklifleri İlanlarım’da yan yana karşılaştırabilirsin.</p>
                <div className="mt-5">
                    <HapLink to="/ilanlarim">Teklifleri gör</HapLink>
                </div>
            </>
        )
    } else if (!user) {
        eylem = (
            <>
                <p className="text-[15px] text-white">Bu işe teklif vermek için giriş yap.</p>
                <p className="mt-1 text-[14px] text-gri">Yazılımcı hesabın yoksa birkaç dakikada açabilirsin.</p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                    <HapLink to="/giris">Giriş yap</HapLink>
                    <HapLink to="/hesap-olustur?rol=yazilimci" tur="cam">
                        Usta olarak katıl
                    </HapLink>
                </div>
            </>
        )
    } else if (!yazilimci) {
        eylem = <p className="text-[14.5px] text-gri">Teklif vermek için yazılımcı hesabı gerekiyor. Bu hesap iş veren olarak kayıtlı.</p>
    } else if (kendiTeklifim) {
        const durumRengi = kendiTeklifim.durum === 'kabul_edildi' ? 'bg-[#4ADE80]/12 text-[#86EFAC]' : kendiTeklifim.durum === 'reddedildi' ? 'bg-red-400/10 text-[#FCA5A5]' : 'bg-white/[0.06] text-gri'
        eylem = (
            <>
                <div className="flex items-center justify-between gap-3">
                    <p className="text-[15px] font-semibold text-white">Teklifin gönderildi</p>
                    <span className={`uz-etiket ${durumRengi}`}>{TEKLIF_DURUMU[kendiTeklifim.durum]}</span>
                </div>
                {kendiTeklifim.teklif_tutari && <p className="rakam mt-3 text-[20px] font-medium text-mor-soluk">{tl(kendiTeklifim.teklif_tutari)}</p>}
                {kendiTeklifim.mesaj && <p className="mt-2 line-clamp-4 whitespace-pre-line text-[14px] leading-relaxed text-gri">{kendiTeklifim.mesaj}</p>}
                <div className="mt-5">
                    <MesajlasDugmesi teklifId={kendiTeklifim.id} className="isik isik-mor rounded-full px-4 py-2 text-[13px] font-semibold">
                        İş verenle mesajlaş
                    </MesajlasDugmesi>
                </div>
            </>
        )
    } else if (ilan.durum !== 'acik') {
        eylem = <p className="text-[14.5px] text-gri">Bu ilan artık teklif kabul etmiyor.</p>
    } else {
        eylem = (
            <>
                <h2 className="mb-5 text-[18px] font-semibold tracking-[-0.01em] text-white">Teklif ver</h2>
                <TeklifFormu ilan={ilan} kullaniciId={user.id} onGonderildi={veriGetir} />
            </>
        )
    }

    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />
            <section className="px-4 pb-28 pt-12 sm:px-8 lg:pt-16">
                <div className="mx-auto max-w-[1180px]">
                    <Link to="/is-ilanlari" className="inline-flex items-center gap-2 text-[14px] text-gri hover:text-white">
                        <span className="inline-flex rotate-180">
                            <Ok />
                        </span>
                        İş ilanları
                    </Link>

                    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
                        <article>
                            <div className="flex flex-wrap items-center gap-2 text-[13.5px] text-gri">
                                {ilan.durum !== 'acik' && <span className="uz-etiket">{ilan.durum === 'tamamlandi' ? 'Tamamlandı' : 'Kapalı'}</span>}
                                <time dateTime={ilan.created_at}>{zamanFarki(ilan.created_at)} açıldı</time>
                                {isVeren?.ad_soyad && (
                                    <>
                                        <span aria-hidden>·</span>
                                        <span>
                                            İlan sahibi <span className="text-white">{isVeren.ad_soyad}</span>
                                        </span>
                                        {isVerenTamamlanan > 0 && (
                                            <span className="uz-etiket" title={`${isVerenTamamlanan} tamamlanmış iş birliği`}>
                                                <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: kidemRozetiHesapla('is-veren', isVerenTamamlanan).renk }} />
                                                {kidemRozetiHesapla('is-veren', isVerenTamamlanan).etiket}
                                                <span className="rakam text-gri">· {isVerenTamamlanan} tamamlanan iş</span>
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                            <h1 className="mt-4 text-balance font-pjs text-[clamp(2rem,4vw,3.1rem)] font-medium leading-[1.08] tracking-[-0.03em] text-white">{ilan.baslik}</h1>

                            {parcalar.giris && <p className="mt-6 max-w-[68ch] whitespace-pre-line text-[17px] font-light leading-[1.7] text-[#D4D4D8]">{parcalar.giris}</p>}

                            {parcalar.bolumler.length > 0 && (
                                <div className="mt-10 flex flex-col gap-7 border-t border-white/[0.08] pt-8">
                                    {parcalar.bolumler.map((b, i) => (
                                        <section key={i} className="max-w-[68ch]">
                                            {b.baslik && <h2 className="text-[15.5px] font-semibold text-white">{b.baslik}</h2>}
                                            <p className={`whitespace-pre-line text-[15.5px] leading-[1.7] text-gri ${b.baslik ? 'mt-2' : ''}`}>{b.metin}</p>
                                        </section>
                                    ))}
                                </div>
                            )}

                            {teknolojiler.length > 0 && (
                                <div className="mt-10 border-t border-white/[0.08] pt-8">
                                    <h2 className="text-[15.5px] font-semibold text-white">Gereken teknolojiler</h2>
                                    <ul className="mt-4 flex flex-wrap gap-2">
                                        {teknolojiler.map((t) => {
                                            const biliyor = yazilimci && bildigim.has(aramaIcinKatla(t))
                                            return (
                                                <li key={t} className={`uz-etiket h-8 px-3 font-kod text-[12.5px] ${biliyor ? 'bg-mor/25 text-white' : ''}`}>
                                                    {biliyor && (
                                                        <svg viewBox="0 0 12 12" className="h-3 w-3 text-mor-acik" fill="none" aria-hidden>
                                                            <path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                    {t}
                                                    {biliyor && <span className="sr-only"> (profilinde var)</span>}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            )}
                        </article>

                        <aside className="flex flex-col gap-4 lg:sticky lg:top-[92px] lg:self-start">
                            <Kutu>
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
                                    <div className="col-span-2">
                                        <dt className="text-[13px] text-gri-koyu">Bütçe</dt>
                                        <dd className="rakam mt-1 text-[26px] font-medium tracking-[-0.02em] text-mor-soluk">{butce || 'Teklife açık'}</dd>
                                    </div>
                                    {parcalar.teslim && (
                                        <div>
                                            <dt className="text-[13px] text-gri-koyu">Teslim beklentisi</dt>
                                            <dd className="mt-1 text-[15px] text-white">{parcalar.teslim}</dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt className="text-[13px] text-gri-koyu">Teknoloji</dt>
                                        <dd className="rakam mt-1 text-[15px] text-white">{teknolojiler.length ? `${teknolojiler.length} teknoloji` : 'Ustaya bırakıldı'}</dd>
                                    </div>
                                </dl>
                                {uyum && uyum.toplam > 0 && (
                                    <div className="mt-6 border-t border-white/[0.07] pt-5">
                                        <p className="text-[14px] text-white">
                                            İstenen <span className="rakam">{uyum.toplam}</span> teknolojiden <span className="rakam text-mor-soluk">{uyum.eslesen}</span> tanesi profilinde var
                                        </p>
                                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]" aria-hidden>
                                            <div className="h-full rounded-full bg-gradient-to-r from-mor to-mor-soluk" style={{ width: `${(uyum.eslesen / uyum.toplam) * 100}%` }} />
                                        </div>
                                    </div>
                                )}
                                {user && !kendiIlaniMi && yazilimci && !kendiTeklifim && (
                                    <div className="mt-6 border-t border-white/[0.07] pt-5">
                                        <MesajlasDugmesi karsiId={ilan.is_veren_id} ilanId={ilan.id} className="isik isik-cam rounded-full px-4 py-2 text-[13px] font-medium">
                                            Teklif vermeden soru sor
                                        </MesajlasDugmesi>
                                    </div>
                                )}
                            </Kutu>
                            <Kutu>{eylem}</Kutu>
                        </aside>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default IlanDetay
