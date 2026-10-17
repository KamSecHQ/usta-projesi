import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useBildirim, useOnay } from '../components/bildirim/bildirimBaglami'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import { baslangicHarfleri } from '../mesajlasma'
import { Alan } from '../components/form/Alan'
import { SonucYok } from '../components/liste/ListeAraclari'
import { HapLink, Ok } from '../components/uzay/Hareket'

const kart = 'rounded-[22px] border border-white/[0.08] bg-[#08080D] p-6 sm:p-7'

function KisiAvatar({ profil }) {
    return profil?.avatar_url ? (
        <img src={profil.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full border border-white/[0.1] object-cover" />
    ) : (
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] text-[12.5px] font-semibold text-[#050505]">
            {baslangicHarfleri(profil?.ad_soyad)}
        </span>
    )
}

function KisiSatiri({ profil, alt, rozet, children }) {
    return (
        <li className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
                <KisiAvatar profil={profil} />
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="truncate text-[14.5px] text-white">{profil?.ad_soyad || 'İsimsiz yazılımcı'}</span>
                        {rozet}
                    </div>
                    {alt && <p className="truncate text-[13px] text-gri-koyu">{alt}</p>}
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">{children}</div>
        </li>
    )
}

const AJANS_ADIMLARI = [
    ['Ajans moduna geç', 'Profil sayfan ajans olarak görünür; istediğin an bireysel moda dönebilirsin.'],
    ['Ekibini davet et', 'Yalnızca onaylı yazılımcı hesapları davet edilebilir.'],
    ['Kabul edenler profilinde görünür', 'Davet edilen kişi kabul etmeden ekibinde listelenmez.'],
]

const kucukDugme = 'rounded-full px-3 py-1.5 text-[13px] font-medium text-gri transition-colors hover:bg-white/[0.06] hover:text-white'

function AjansYonetimi() {
    useSayfaBasligi('Ajansım', 'Ajans profilini yönet: ekibine onaylı yazılımcıları davet et, portföyünde birlikte görünün.')
    const { user, yukleniyor: authYukleniyor } = useAuth()
    const bildir = useBildirim()
    const onayla = useOnay()

    const [profil, setProfil] = useState(null)
    const [davetler, setDavetler] = useState([])
    const [yukleniyor, setYukleniyor] = useState(true)
    const [gecisYapiliyor, setGecisYapiliyor] = useState(false)

    const [aramaMetni, setAramaMetni] = useState('')
    const [aramaSonuclari, setAramaSonuclari] = useState([])
    const [aramaYapildi, setAramaYapildi] = useState(false)
    const [rolAciklamasi, setRolAciklamasi] = useState('')
    const [davetGonderiliyor, setDavetGonderiliyor] = useState(false)
    const [hata, setHata] = useState('')
    // Yazarken sırayla giden aramalardan yalnızca en sonuncusunun yanıtı kullanılır
    const sonArama = useRef(0)

    const veriGetir = useCallback(async () => {
        if (!user) return
        const { data: profilData } = await supabase.from('profiller').select('*').eq('id', user.id).single()
        setProfil(profilData)

        if (profilData?.profil_tipi === 'ajans') {
            const { data } = await supabase
                .from('ajans_davetleri')
                .select('*, profiller!ajans_davetleri_davet_edilen_id_fkey(ad_soyad, unvan, avatar_url)')
                .eq('ajans_id', user.id)
                .order('created_at', { ascending: false })
            setDavetler(data || [])
        }
        setYukleniyor(false)
    }, [user])

    useEffect(() => {
        if (user) veriGetir()
    }, [user, veriGetir])

    async function ajansModunaGec() {
        setGecisYapiliyor(true)
        const { error } = await supabase.from('profiller').update({ profil_tipi: 'ajans' }).eq('id', user.id)
        setGecisYapiliyor(false)
        if (error) bildir('Ajans moduna geçilemedi. Tekrar dene.', { tur: 'hata' })
        else bildir('Ajans profilin açıldı', { tur: 'basari' })
        veriGetir()
    }

    async function bireyselModaDon() {
        const evet = await onayla({
            baslik: 'Bireysel moda dönülsün mü?',
            metin: 'Ajans profilin herkese açık görünmeyecek. Üyelerin ve davetlerin silinmez; istediğinde yeniden ajans moduna geçebilirsin.',
            onay: 'Bireysel moda dön',
        })
        if (!evet) return
        const { error } = await supabase.from('profiller').update({ profil_tipi: 'bireysel' }).eq('id', user.id)
        if (error) bildir('Mod değiştirilemedi. Tekrar dene.', { tur: 'hata' })
        else bildir('Bireysel moda dönüldü', { tur: 'basari' })
        veriGetir()
    }

    async function ustaAra(metin) {
        setAramaMetni(metin)
        setHata('')
        const sira = ++sonArama.current
        if (metin.trim().length < 2) {
            setAramaSonuclari([])
            setAramaYapildi(false)
            return
        }
        const { data } = await supabase
            .from('profiller')
            .select('id, ad_soyad, unvan, avatar_url')
            .eq('rol', 'yazilimci')
            .eq('onayli', true)
            .neq('id', user.id)
            .ilike('ad_soyad', `%${metin.trim()}%`)
            .limit(6)
        if (sira !== sonArama.current) return
        setAramaSonuclari(data || [])
        setAramaYapildi(true)
    }

    async function davetGonder(kisi) {
        setDavetGonderiliyor(true)
        setHata('')
        const { error } = await supabase.from('ajans_davetleri').insert({
            ajans_id: user.id,
            davet_edilen_id: kisi.id,
            rol_aciklamasi: rolAciklamasi.trim() || null,
        })
        setDavetGonderiliyor(false)
        if (error) {
            setHata(error.code === '23505' ? 'Bu kişiye zaten davet gönderilmiş. Reddettiyse aşağıdan daveti kaldırıp yeniden gönderebilirsin.' : 'Davet gönderilemedi. Tekrar dene.')
            return
        }
        bildir(`${kisi.ad_soyad || 'Yazılımcı'} davet edildi`, { tur: 'basari' })
        sonArama.current++
        setAramaMetni('')
        setAramaSonuclari([])
        setAramaYapildi(false)
        setRolAciklamasi('')
        veriGetir()
    }

    async function davetiKaldir(davet, reddedildi) {
        const { error } = await supabase.from('ajans_davetleri').delete().eq('id', davet.id)
        if (error) bildir('Davet kaldırılamadı. Tekrar dene.', { tur: 'hata' })
        else bildir(reddedildi ? 'Davet kaldırıldı; yeniden davet edebilirsin' : 'Davet iptal edildi')
        veriGetir()
    }

    async function uyeCikar(davetId) {
        const evet = await onayla({
            baslik: 'Üye ajanstan çıkarılsın mı?',
            metin: 'Kişi ajans sayfanda görünmeyecek. Yeniden eklemek için tekrar davet göndermen gerekir.',
            onay: 'Üyeyi çıkar',
            tehlike: true,
        })
        if (!evet) return
        const { error } = await supabase.from('ajans_davetleri').delete().eq('id', davetId)
        if (error) bildir('Üye çıkarılamadı. Tekrar dene.', { tur: 'hata' })
        else bildir('Üye ajanstan çıkarıldı', { tur: 'basari' })
        veriGetir()
    }

    if (authYukleniyor) {
        return <div className="min-h-screen bg-black" role="status" aria-label="Yükleniyor" />
    }

    if (!user) {
        return (
            <div className="uzay flex min-h-screen items-center px-4">
                <SonucYok BaslikEtiketi="h1" baslik="Ajansını buradan yönetirsin" metin="Ekibini davet etmek ve ajans profilini açmak için giriş yap." eylem={<HapLink to="/giris">Giriş yap</HapLink>} />
            </div>
        )
    }

    if (yukleniyor) {
        return <div className="min-h-screen bg-black" role="status" aria-label="Yükleniyor" />
    }

    if (profil?.rol !== 'yazilimci') {
        return (
            <div className="uzay flex min-h-screen items-center px-4">
                <SonucYok BaslikEtiketi="h1" baslik="Ajans profili yazılımcılar için" metin="İş veren hesaplarında ajans profili yok. Ekip arıyorsan ustaları inceleyip ilan verebilirsin." eylem={<HapLink to="/ustalar">Ustalara göz at</HapLink>} />
            </div>
        )
    }

    const uyeler = davetler.filter((d) => d.durum === 'kabul_edildi')
    const bekleyenler = davetler.filter((d) => d.durum === 'beklemede')
    const reddedenler = davetler.filter((d) => d.durum === 'reddedildi')
    const davetliIdler = new Set(davetler.map((d) => d.davet_edilen_id))

    if (profil?.profil_tipi !== 'ajans') {
        return (
            <div className="uzay min-h-screen px-4 pb-24 pt-14 sm:px-8 lg:pt-20">
                <div className="uz-yildizlar" aria-hidden />
                <div className="relative mx-auto max-w-[760px]">
                    <h1 className="font-pjs text-[clamp(2.2rem,4.6vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white">Ajans profili</h1>
                    <p className="mt-3 max-w-[56ch] text-[16px] font-light leading-relaxed text-gri">2–5 kişilik bir ekiple mi çalışıyorsun? Profilini ajans olarak göster; ekibindeki gerçek yazılımcı hesaplarını davet et, portföyünde birlikte görünün.</p>
                    <ol className="mt-10 flex flex-col gap-3">
                        {AJANS_ADIMLARI.map(([baslik, metin], i) => (
                            <li key={baslik} className={`${kart} flex gap-4`}>
                                <span aria-hidden className="font-kod flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-mor/40 bg-mor/10 text-[13px] text-mor-soluk">
                                    {i + 1}
                                </span>
                                <div>
                                    <h2 className="text-[15.5px] font-medium text-white">{baslik}</h2>
                                    <p className="mt-1 text-[14px] leading-relaxed text-gri">{metin}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                    <div className="mt-10 flex flex-wrap gap-2.5">
                        <button type="button" onClick={ajansModunaGec} disabled={gecisYapiliyor} className="isik-hap isik-hap-birincil inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold disabled:opacity-60">
                            {gecisYapiliyor ? 'Geçiliyor…' : 'Ajans moduna geç'} {!gecisYapiliyor && <Ok />}
                        </button>
                        <Link to="/profilim" className="isik isik-cam rounded-full px-5 py-3 text-[14.5px] font-medium">
                            Profilime dön
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="uzay min-h-screen px-4 pb-24 pt-14 sm:px-8 lg:pt-20">
            <div className="uz-yildizlar" aria-hidden />
            <div className="relative mx-auto max-w-[760px]">
                <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <h1 className="font-pjs text-[clamp(2.2rem,4.6vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white">Ajansım</h1>
                        <p className="mt-3 text-[16px] font-light text-gri">Ekibini davet et, portföyünde birlikte görünün.</p>
                    </div>
                    <Link to={`/ustalar/${user.id}`} className="isik isik-cam inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium">
                        Ajans sayfamı gör <Ok />
                    </Link>
                </header>

                <div className="flex flex-col gap-6">
                    <section aria-labelledby="ajans-davet" className={kart}>
                        <h2 id="ajans-davet" className="mb-1 text-[17px] font-medium tracking-[-0.01em] text-white">
                            Üye davet et
                        </h2>
                        <p className="mb-5 text-[14px] text-gri">Yalnızca onaylı yazılımcı hesapları listelenir. Davet, kişi kabul edince ekibinde görünür.</p>
                        <div className="flex flex-col gap-5">
                            <Alan etiket="Ekipteki rolü" istege ipucu="Davet ettiğin kişinin yanında görünür. Örn. Backend geliştirici">
                                {(p) => <input {...p} className="alan" value={rolAciklamasi} onChange={(e) => setRolAciklamasi(e.target.value)} maxLength={60} autoComplete="off" />}
                            </Alan>
                            <Alan etiket="Yazılımcı ara" ipucu="En az 2 harf yaz." hata={hata}>
                                {(p) => <input {...p} type="search" className="alan" value={aramaMetni} onChange={(e) => ustaAra(e.target.value)} autoComplete="off" spellCheck={false} />}
                            </Alan>
                        </div>
                        <p className="sr-only" role="status" aria-live="polite">
                            {aramaYapildi ? (aramaSonuclari.length ? `${aramaSonuclari.length} yazılımcı bulundu` : 'Eşleşen onaylı yazılımcı yok') : ''}
                        </p>
                        {aramaYapildi && (
                            <div className="mt-4">
                                {aramaSonuclari.length === 0 ? (
                                    <p className="rounded-2xl border border-dashed border-white/[0.1] px-4 py-4 text-[14px] text-gri">“{aramaMetni.trim()}” adıyla onaylı bir yazılımcı bulunamadı. Kişinin profilinin onaylı olduğundan emin ol.</p>
                                ) : (
                                    <ul className="flex flex-col gap-2" aria-label="Arama sonuçları">
                                        {aramaSonuclari.map((k) => (
                                            <KisiSatiri key={k.id} profil={k} alt={k.unvan}>
                                                {davetliIdler.has(k.id) ? (
                                                    <span className="px-3 text-[13px] text-gri-koyu">Davet edildi</span>
                                                ) : (
                                                    <button type="button" onClick={() => davetGonder(k)} disabled={davetGonderiliyor} className="isik-hap isik-hap-birincil rounded-full px-4 py-1.5 text-[13px] font-semibold disabled:opacity-60">
                                                        Davet et<span className="sr-only">: {k.ad_soyad}</span>
                                                    </button>
                                                )}
                                            </KisiSatiri>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </section>

                    {(bekleyenler.length > 0 || reddedenler.length > 0) && (
                        <section aria-labelledby="ajans-bekleyen" className={kart}>
                            <h2 id="ajans-bekleyen" className="mb-5 text-[17px] font-medium tracking-[-0.01em] text-white">
                                Gönderilen davetler
                            </h2>
                            <ul className="flex flex-col gap-2">
                                {[...bekleyenler, ...reddedenler].map((d) => {
                                    const reddedildi = d.durum === 'reddedildi'
                                    return (
                                        <KisiSatiri
                                            key={d.id}
                                            profil={d.profiller}
                                            alt={d.rol_aciklamasi}
                                            rozet={<span className={`uz-etiket text-[11px] ${reddedildi ? 'text-red-300' : ''}`}>{reddedildi ? 'Reddetti' : 'Yanıt bekleniyor'}</span>}
                                        >
                                            <button type="button" onClick={() => davetiKaldir(d, reddedildi)} className={kucukDugme}>
                                                {reddedildi ? 'Kaldır' : 'İptal et'}
                                                <span className="sr-only">: {d.profiller?.ad_soyad}</span>
                                            </button>
                                        </KisiSatiri>
                                    )
                                })}
                            </ul>
                        </section>
                    )}

                    <section aria-labelledby="ajans-ekip" className={kart}>
                        <h2 id="ajans-ekip" className="mb-5 text-[17px] font-medium tracking-[-0.01em] text-white">
                            Ekip <span className="font-normal text-gri-koyu">· {uyeler.length} kişi</span>
                        </h2>
                        {uyeler.length === 0 ? (
                            <p className="text-[14px] leading-relaxed text-gri">Henüz daveti kabul eden yok. Kabul edenler burada ve ajans sayfanda listelenir.</p>
                        ) : (
                            <ul className="flex flex-col gap-2">
                                {uyeler.map((u) => (
                                    <KisiSatiri key={u.id} profil={u.profiller} alt={u.rol_aciklamasi || u.profiller?.unvan}>
                                        <Link to={`/ustalar/${u.davet_edilen_id}`} className={kucukDugme}>
                                            Profil<span className="sr-only">: {u.profiller?.ad_soyad}</span>
                                        </Link>
                                        <button type="button" onClick={() => uyeCikar(u.id)} className={`${kucukDugme} hover:text-red-300`}>
                                            Çıkar<span className="sr-only">: {u.profiller?.ad_soyad}</span>
                                        </button>
                                    </KisiSatiri>
                                ))}
                            </ul>
                        )}
                    </section>

                    <div className="flex justify-end">
                        <button type="button" onClick={bireyselModaDon} className="text-[13px] text-gri-koyu transition-colors hover:text-red-300">
                            Bireysel moda dön
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AjansYonetimi
