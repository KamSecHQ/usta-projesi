import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import ProjeKarti from '../components/ProjeKarti'
import { IskeletProjeKarti } from '../components/Iskelet'
import { musaitlikBilgisi, ucretAraligiGoster, videoEmbedUrl } from '../ustaYardimcilari'
import Ikon from '../components/mesaj/Ikon'
import { profilGucuMaddeleri, profilGucuYuzdesi } from '../profilGucu'
import { Alan } from '../components/form/Alan'
import TeknolojiSecici from '../components/ilan/TeknolojiSecici'
import { Ok } from '../components/uzay/Hareket'

const ONE_CIKAN_LIMIT = 3

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad.split(" ").filter(Boolean).slice(0, 2).map((k) => k[0].toUpperCase()).join("")
}

function ProjeFormu({ baslangic, oneCikanSayisi, gonderiliyor, onKaydet, onIptal, gonderMetni }) {
    const [baslik, setBaslik] = useState(baslangic?.baslik || "")
    const [aciklama, setAciklama] = useState(baslangic?.aciklama || "")
    const [link, setLink] = useState(baslangic?.link || "")
    const [teknolojiler, setTeknolojiler] = useState(baslangic?.teknolojiler || [])
    const [kapakUrl, setKapakUrl] = useState(baslangic?.kapak_gorseli_url || "")
    const [rol, setRol] = useState(baslangic?.rol || "")
    const [problem, setProblem] = useState(baslangic?.problem || "")
    const [cozum, setCozum] = useState(baslangic?.cozum || "")
    const [sonuc, setSonuc] = useState(baslangic?.sonuc || "")
    const [oneCikan, setOneCikan] = useState(baslangic?.one_cikan || false)
    const [hata, setHata] = useState("")

    const oneCikanEngelli = !oneCikan && oneCikanSayisi >= ONE_CIKAN_LIMIT

    function gonder(e) {
        e.preventDefault()
        if (!baslik.trim()) {
            setHata("Projeye bir başlık ver.")
            return
        }
        setHata("")
        onKaydet({
            baslik: baslik.trim(),
            aciklama: aciklama.trim() || null,
            link: link.trim() || null,
            teknolojiler,
            kapak_gorseli_url: kapakUrl.trim() || null,
            rol: rol.trim() || null,
            problem: problem.trim() || null,
            cozum: cozum.trim() || null,
            sonuc: sonuc.trim() || null,
            one_cikan: oneCikan,
        })
    }

    return (
        <form onSubmit={gonder} noValidate className="flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <Alan etiket="Proje başlığı" hata={hata}>
                {(p) => <input {...p} className="alan" value={baslik} onChange={(e) => setBaslik(e.target.value)} maxLength={90} placeholder="örn. Kafe için online sipariş sitesi" />}
            </Alan>
            <Alan etiket="Kısa özet" istege ipucu="Kartlarda iki satır görünür.">
                {(p) => <textarea {...p} className="alan" rows={2} maxLength={300} value={aciklama} onChange={(e) => setAciklama(e.target.value)} />}
            </Alan>
            <div className="grid gap-5 sm:grid-cols-2">
                <Alan etiket="Canlı proje bağlantısı" istege>
                    {(p) => <input {...p} type="url" inputMode="url" className="alan" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />}
                </Alan>
                <Alan etiket="Bu projedeki rolün" istege>
                    {(p) => <input {...p} className="alan" value={rol} onChange={(e) => setRol(e.target.value)} placeholder="örn. Tek geliştirici" />}
                </Alan>
            </div>
            <Alan etiket="Kapak görseli bağlantısı" istege ipucu="Usta kartının ve profilinin vitrini bu görselden gelir; yatay (16:9) görseller en iyi durur.">
                {(p) => <input {...p} type="url" inputMode="url" className="alan" value={kapakUrl} onChange={(e) => setKapakUrl(e.target.value)} placeholder="https://" />}
            </Alan>
            <TeknolojiSecici etiket="Kullanılan teknolojiler" deger={teknolojiler} degisti={setTeknolojiler} />

            <fieldset className="flex flex-col gap-5 border-t border-white/[0.07] pt-5">
                <legend className="sr-only">Vaka çalışması</legend>
                <div aria-hidden>
                    <p className="alan-etiket mb-1">Vaka çalışması</p>
                    <p className="text-[13px] text-gri-koyu">Üçü de doldurulursa proje sayfasında Problem, Çözüm, Sonuç olarak anlatılır.</p>
                </div>
                <Alan etiket="Problem" istege>
                    {(p) => <textarea {...p} className="alan" rows={2} value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Müşteri ya da kullanıcı hangi sorunu yaşıyordu?" />}
                </Alan>
                <Alan etiket="Çözüm" istege>
                    {(p) => <textarea {...p} className="alan" rows={2} value={cozum} onChange={(e) => setCozum(e.target.value)} placeholder="Nasıl bir yaklaşımla çözdün?" />}
                </Alan>
                <Alan etiket="Sonuç" istege>
                    {(p) => <textarea {...p} className="alan" rows={2} value={sonuc} onChange={(e) => setSonuc(e.target.value)} placeholder="Ölçülebilir bir etki oldu mu? (örn. yükleme süresi %40 azaldı)" />}
                </Alan>
            </fieldset>

            <label className="flex items-start gap-2.5 text-[14px] text-gri">
                <input type="checkbox" checked={oneCikan} disabled={oneCikanEngelli} onChange={(e) => setOneCikan(e.target.checked)} className="mt-0.5 h-4 w-4" />
                <span>
                    Öne çıkan iş olarak sabitle (en fazla {ONE_CIKAN_LIMIT})
                    {oneCikanEngelli && <span className="block text-[12.5px] text-gri-koyu">Yeni birini sabitlemek için önce birinin sabitini kaldır.</span>}
                </span>
            </label>

            <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={gonderiliyor} className="isik isik-birincil rounded-full px-5 py-2.5 text-[14px] font-semibold disabled:opacity-50">
                    {gonderiliyor ? "Kaydediliyor…" : gonderMetni}
                </button>
                {onIptal && (
                    <button type="button" onClick={onIptal} className="isik isik-cam rounded-full px-5 py-2.5 text-[14px] font-medium">
                        Vazgeç
                    </button>
                )}
            </div>
        </form>
    )
}

function ProfilDuzenle() {
    useSayfaBasligi('Profilimi Düzenle')

    const { user, yukleniyor: authYukleniyor } = useAuth()
    const konumBilgisi = useLocation()
    const [profilRol, setProfilRol] = useState('yazilimci')
    const [yukleniyor, setYukleniyor] = useState(true)
    const [kaydediliyor, setKaydediliyor] = useState(false)
    const [kaydedildi, setKaydedildi] = useState(false)
    const [hata, setHata] = useState("")

    const [adSoyad, setAdSoyad] = useState("")
    const [unvan, setUnvan] = useState("")
    const [bio, setBio] = useState("")
    const [githubUrl, setGithubUrl] = useState("")
    const [konum, setKonum] = useState("")
    const [teknolojiler, setTeknolojiler] = useState([])

    const [telefon, setTelefon] = useState("")
    const [telefonDogrulandi, setTelefonDogrulandi] = useState(false)
    const [musaitlik, setMusaitlik] = useState("musait")
    const [musaitlikNotu, setMusaitlikNotu] = useState("")
    const [ucretMin, setUcretMin] = useState("")
    const [ucretMax, setUcretMax] = useState("")
    const [videoUrl, setVideoUrl] = useState("")

    const [projeler, setProjeler] = useState([])
    const [projelerYukleniyor, setProjelerYukleniyor] = useState(true)
    const [yeniProjeAcik, setYeniProjeAcik] = useState(false)
    const [projeGonderiliyor, setProjeGonderiliyor] = useState(false)
    const [duzenlenenId, setDuzenlenenId] = useState(null)

    useEffect(() => {
        async function profilGetir() {
            if (!user) return
            const { data, error } = await supabase
                .from('profiller')
                .select('*')
                .eq('id', user.id)
                .single()

            // Telefon herkese açık profilde değil; yalnızca sahibinin okuyabildiği tabloda
            const { data: iletisim } = await supabase
                .from('profil_iletisim')
                .select('telefon')
                .eq('id', user.id)
                .maybeSingle()
            setTelefon(iletisim?.telefon || "")

            if (!error && data) {
                setProfilRol(data.rol || 'yazilimci')
                setAdSoyad(data.ad_soyad || "")
                setUnvan(data.unvan || "")
                setBio(data.bio || "")
                setGithubUrl(data.github_url || "")
                setKonum(data.konum || "")
                setTeknolojiler(data.teknolojiler || [])
                setTelefonDogrulandi(!!data.telefon_dogrulandi)
                setMusaitlik(data.musaitlik || "musait")
                setMusaitlikNotu(data.musaitlik_notu || "")
                setUcretMin(data.saatlik_ucret_min ?? "")
                setUcretMax(data.saatlik_ucret_max ?? "")
                setVideoUrl(data.video_url || "")
            }
            setYukleniyor(false)
        }
        if (user) profilGetir()
    }, [user])

    // Panelden ya da profil gücü listesinden gelen #bolum: o bölüme kaydırır, kısa bir ışıkla
    // vurgular ve ilk alanına odaklanır
    const bolumeGit = useCallback((kimlik) => {
        const el = document.getElementById(kimlik)
        if (!el) return
        const azalt = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        el.scrollIntoView({ behavior: azalt ? 'auto' : 'smooth', block: 'start' })
        el.classList.remove('bolum-vurgu')
        void el.offsetWidth
        el.classList.add('bolum-vurgu')
        setTimeout(() => el.classList.remove('bolum-vurgu'), 1800)
        const alan = el.querySelector('input, textarea, select, button')
        setTimeout(() => alan?.focus({ preventScroll: true }), azalt ? 0 : 450)
    }, [])

    useEffect(() => {
        const kimlik = konumBilgisi.hash.slice(1)
        if (!yukleniyor && kimlik) requestAnimationFrame(() => bolumeGit(kimlik))
    }, [yukleniyor, konumBilgisi.hash, bolumeGit])

    const projeleriGetir = useCallback(async () => {
        if (!user) return
        const { data, error } = await supabase
            .from('projeler')
            .select('*')
            .eq('kullanici_id', user.id)
            .order('created_at', { ascending: false })

        if (!error) setProjeler(data)
        setProjelerYukleniyor(false)
    }, [user])

    useEffect(() => {
        if (user) projeleriGetir()
    }, [user, projeleriGetir])



    async function kaydet(e) {
        e.preventDefault()
        setKaydediliyor(true)
        setHata("")
        setKaydedildi(false)

        const { error } = await supabase
            .from('profiller')
            .update({
                ad_soyad: adSoyad,
                unvan,
                bio,
                github_url: githubUrl,
                konum,
                teknolojiler,
                musaitlik,
                musaitlik_notu: musaitlik === 'kismi_musait' ? musaitlikNotu : null,
                saatlik_ucret_min: ucretMin === "" ? null : Number(ucretMin),
                saatlik_ucret_max: ucretMax === "" ? null : Number(ucretMax),
                video_url: videoUrl || null,
            })
            .eq('id', user.id)

        const { error: telefonHatasi } = await supabase
            .from('profil_iletisim')
            .upsert({ id: user.id, telefon: telefon.trim() || null, updated_at: new Date().toISOString() })

        setKaydediliyor(false)
        if (error || telefonHatasi) {
            setHata((error || telefonHatasi).message)
        } else {
            setKaydedildi(true)
            setTimeout(() => setKaydedildi(false), 3000)
        }
    }

    async function projeEkle(veriler) {
        setProjeGonderiliyor(true)
        const { error } = await supabase
            .from('projeler')
            .insert({ kullanici_id: user.id, ...veriler })

        setProjeGonderiliyor(false)
        if (!error) {
            setYeniProjeAcik(false)
            projeleriGetir()
        }
    }

    async function projeGuncelle(id, veriler) {
        setProjeGonderiliyor(true)
        const { error } = await supabase
            .from('projeler')
            .update(veriler)
            .eq('id', id)

        setProjeGonderiliyor(false)
        if (!error) {
            setDuzenlenenId(null)
            projeleriGetir()
        }
    }

    async function projeSil(id) {
        await supabase.from('projeler').delete().eq('id', id)
        setProjeler(projeler.filter((p) => p.id !== id))
    }

    if (authYukleniyor || yukleniyor) {
        return <div className="min-h-screen bg-[#000000] flex items-center justify-center text-[#A1A1AA]">Yükleniyor...</div>
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-center px-6">
                <p className="text-[#A1A1AA] mb-4">Profilini düzenlemek için giriş yapmalısın.</p>
                <Link to="/giris" className="text-[#A78BFA] hover:underline">Giriş yap</Link>
            </div>
        )
    }

    const musaitlikSecenekleri = [
        { deger: 'musait', ad: 'Müsait' },
        { deger: 'kismi_musait', ad: 'Kısmi Müsait' },
        { deger: 'musait_degil', ad: 'Müsait Değil' },
    ]
    const gomulVideo = videoEmbedUrl(videoUrl)
    const onizlemeUcret = ucretAraligiGoster(ucretMin || null, ucretMax || null)
    const onizlemeMusaitlik = musaitlikBilgisi(musaitlik)
    const oneCikanSayisi = projeler.filter((p) => p.one_cikan).length
    // Profil gücü kaydetmeden önce de formdaki değerlerle anlık hesaplanır (panelle aynı maddeler)
    const gucMaddeleri = profilGucuMaddeleri(
        { rol: profilRol, ad_soyad: adSoyad, unvan, bio, teknolojiler, github_url: githubUrl, konum, saatlik_ucret_min: ucretMin, saatlik_ucret_max: ucretMax },
        { projeSayisi: projeler.length, telefon }
    )
    const guc = profilGucuYuzdesi(gucMaddeleri)

    return (
        <div className="uzay min-h-screen px-4 pb-24 pt-14 sm:px-8 lg:pt-20">
            <div className="uz-yildizlar" aria-hidden />
            <div className="relative mx-auto max-w-6xl">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <h1 className="font-pjs text-[clamp(2.2rem,4.6vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white">Profilimi düzenle</h1>
                        <p className="mt-3 text-[16px] font-light text-gri">Buradaki bilgiler herkese açık profil sayfanda görünür; telefonun hariç.</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        <Link to="/ajansim" className="isik isik-cam rounded-full px-5 py-2.5 text-[14px] font-medium">
                            Ajansım
                        </Link>
                        <Link to={`/ustalar/${user.id}`} className="isik isik-cam inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium">
                            Profilimi gör <Ok />
                        </Link>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[1fr_380px] gap-8">

                    {/* SOL: Form */}
                    <div className="flex flex-col gap-6">

                        {/* Temel Bilgiler */}
                        <div id="temel" className="scroll-mt-24 rounded-[22px] border border-white/[0.08] bg-[#08080D] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-7">
                            <h2 className="mb-6 text-[19px] font-medium tracking-[-0.01em] text-white">Temel bilgiler</h2>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Alan etiket="Ad soyad">
                                    {(p) => <input {...p} className="alan" autoComplete="name" value={adSoyad} onChange={(e) => setAdSoyad(e.target.value)} />}
                                </Alan>
                                <Alan etiket="Unvan" ipucu="Listede adının altında görünür.">
                                    {(p) => <input {...p} className="alan" autoComplete="organization-title" value={unvan} onChange={(e) => setUnvan(e.target.value)} placeholder="örn. Frontend Geliştirici" />}
                                </Alan>
                                <Alan etiket="Konum" istege>
                                    {(p) => <input {...p} className="alan" autoComplete="address-level2" value={konum} onChange={(e) => setKonum(e.target.value)} placeholder="örn. İstanbul" />}
                                </Alan>
                                <Alan etiket="GitHub bağlantısı" istege>
                                    {(p) => <input {...p} type="url" inputMode="url" className="alan" autoComplete="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/kullaniciadi" />}
                                </Alan>
                                <div className="sm:col-span-2">
                                    <Alan
                                        etiket="Telefon"
                                        istege
                                        ipucu={telefon ? (telefonDogrulandi ? 'Doğrulandı. Herkese açık değildir; yalnızca sen ve yönetici görür.' : 'Doğrulama yönetici incelemesinde. Herkese açık değildir.') : 'Herkese açık değildir; yalnızca sen ve yönetici görür.'}
                                    >
                                        {(p) => <input {...p} type="tel" inputMode="tel" className="alan" autoComplete="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="0555 555 55 55" />}
                                    </Alan>
                                </div>
                            </div>
                        </div>

                        {/* Hakkımda */}
                        <div id="hakkimda" className="scroll-mt-24 rounded-[22px] border border-white/[0.08] bg-[#08080D] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-7">
                            <h2 className="mb-6 text-[19px] font-medium tracking-[-0.01em] text-white">Hakkımda</h2>
                            <Alan etiket="Kendini anlat" ipucu={`Profilinin girişinde görünür. ${bio.trim().length} karakter.`}>
                                {(p) => <textarea {...p} className="alan" rows={5} maxLength={1200} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Neyi iyi yaparsın, hangi işlerde çalıştın, nasıl çalışırsın?" />}
                            </Alan>
                        </div>

                        {/* Teknolojiler - chip input */}
                        <div id="teknolojiler" className="scroll-mt-24 rounded-[22px] border border-white/[0.08] bg-[#08080D] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-7">
                            <h2 className="mb-6 text-[19px] font-medium tracking-[-0.01em] text-white">Teknolojiler</h2>
                            <TeknolojiSecici etiket="Bildiğin teknolojiler" deger={teknolojiler} degisti={setTeknolojiler} enCok={15} ipucu="İlanlardaki teknoloji uyumu buradan hesaplanır. Enter ya da virgülle ekle." />
                        </div>

                        {/* Müsaitlik */}
                        <div id="musaitlik" className="scroll-mt-24 rounded-[22px] border border-white/[0.08] bg-[#08080D] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-7">
                            <h2 className="mb-6 text-[19px] font-medium tracking-[-0.01em] text-white">Müsaitlik</h2>
                            <div role="radiogroup" aria-label="Müsaitlik durumu" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                {musaitlikSecenekleri.map((s) => {
                                    const bilgi = musaitlikBilgisi(s.deger)
                                    return (
                                        <button key={s.deger} type="button" role="radio" aria-checked={musaitlik === s.deger} onClick={() => setMusaitlik(s.deger)} className="secim-kart flex-row items-center gap-2.5">
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: bilgi.renk }} aria-hidden />
                                            <span className="text-[14.5px] font-medium text-white">{s.ad}</span>
                                        </button>
                                    )
                                })}
                            </div>
                            {musaitlik === 'kismi_musait' && (
                                <div className="mt-5">
                                    <Alan etiket="Ne zaman müsait olursun?" istege>
                                        {(p) => <input {...p} className="alan" value={musaitlikNotu} onChange={(e) => setMusaitlikNotu(e.target.value)} placeholder="örn. 2 hafta sonra tam zamanlı" />}
                                    </Alan>
                                </div>
                            )}
                        </div>

                        {/* Ücret Aralığı */}
                        <div id="ucret" className="scroll-mt-24 rounded-[22px] border border-white/[0.08] bg-[#08080D] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-7">
                            <h2 className="text-[19px] font-medium tracking-[-0.01em] text-white">Saatlik ücret aralığı</h2>
                            <p className="mb-6 mt-1 text-[14px] text-gri">İsteğe bağlı; beklentileri baştan netleştirir.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <Alan etiket="En az (₺)">
                                    {(p) => <input {...p} type="number" inputMode="numeric" min="0" step="50" className="alan rakam" value={ucretMin} onChange={(e) => setUcretMin(e.target.value)} placeholder="300" />}
                                </Alan>
                                <Alan etiket="En çok (₺)">
                                    {(p) => <input {...p} type="number" inputMode="numeric" min="0" step="50" className="alan rakam" value={ucretMax} onChange={(e) => setUcretMax(e.target.value)} placeholder="600" />}
                                </Alan>
                            </div>
                        </div>

                        {/* Tanıtım Videosu */}
                        <div id="video" className="scroll-mt-24 rounded-[22px] border border-white/[0.08] bg-[#08080D] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-7">
                            <h2 className="mb-6 text-[19px] font-medium tracking-[-0.01em] text-white">Tanıtım videosu</h2>
                            <Alan etiket="YouTube ya da Loom bağlantısı" istege ipucu="Bir iki dakikalık bir tanıtım, iş verenin seni tanımasını kolaylaştırır.">
                                {(p) => <input {...p} type="url" inputMode="url" className="alan" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=…" />}
                            </Alan>
                            {videoUrl && !gomulVideo && (
                                <p className="text-[#A1A1AA]/60 text-xs mt-2">
                                    Bu link doğrudan gömülemiyor, portföyünde tıklanabilir link olarak gösterilecek.
                                </p>
                            )}
                            {gomulVideo && (
                                <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-white/[0.08]">
                                    <iframe
                                        src={gomulVideo}
                                        title="Tanıtım videosu önizleme"
                                        className="w-full h-full"
                                        allowFullScreen
                                    />
                                </div>
                            )}
                        </div>

                        {hata && (
                            <p className="alan-hata" role="alert">
                                {hata}
                            </p>
                        )}
                        {kaydedildi && <p className="inline-flex items-center gap-1.5 text-[#C4B5FD] text-sm" role="status"><Ikon ad="tik" className="inline h-3.5 w-3.5" kalinlik={2.2} /> Profil kaydedildi</p>}

                        <button
                            onClick={kaydet}
                            disabled={kaydediliyor}
                            className="isik isik-birincil bg-[#FDFDFD] text-[#050505] font-semibold px-6 py-3 rounded-full disabled:opacity-50 hover:bg-[#FFFFFF] transition-all duration-300 self-start"
                        >
                            {kaydediliyor ? "Kaydediliyor..." : "Profili Kaydet"}
                        </button>

                        {/* Projelerim */}
                        <div id="projeler" className="scroll-mt-24 rounded-[22px] border border-white/[0.08] bg-[#08080D] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-7 mt-4">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-[#FFFFFF] font-semibold">Projelerim</h2>
                                {!yeniProjeAcik && (
                                    <button
                                        onClick={() => setYeniProjeAcik(true)}
                                        className="text-[#A78BFA] text-sm hover:underline"
                                    >
                                        + Proje Ekle
                                    </button>
                                )}
                            </div>
                            <p className="text-[#A1A1AA] text-sm mb-5">Portföyünde öne çıkacak çalışmalarını ekle.</p>

                            {yeniProjeAcik && (
                                <div className="mb-6">
                                    <ProjeFormu
                                        oneCikanSayisi={oneCikanSayisi}
                                        gonderiliyor={projeGonderiliyor}
                                        onKaydet={projeEkle}
                                        onIptal={() => setYeniProjeAcik(false)}
                                        gonderMetni="Projeyi Kaydet"
                                    />
                                </div>
                            )}

                            {projelerYukleniyor ? (
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <IskeletProjeKarti />
                                    <IskeletProjeKarti />
                                </div>
                            ) : projeler.length === 0 ? (
                                <p className="text-[#A1A1AA] text-sm">Henüz proje eklemedin.</p>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {projeler.map((p) => (
                                        duzenlenenId === p.id ? (
                                            <div key={p.id} className="sm:col-span-2">
                                                <ProjeFormu
                                                                baslangic={p}
                                                    oneCikanSayisi={projeler.filter((x) => x.one_cikan && x.id !== p.id).length}
                                                    gonderiliyor={projeGonderiliyor}
                                                    onKaydet={(veriler) => projeGuncelle(p.id, veriler)}
                                                    onIptal={() => setDuzenlenenId(null)}
                                                    gonderMetni="Değişiklikleri Kaydet"
                                                />
                                            </div>
                                        ) : (
                                            <ProjeKarti
                                                key={p.id}
                                                proje={p}
                                                aksiyon={
                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={() => setDuzenlenenId(p.id)}
                                                            className="text-[#A1A1AA] hover:text-[#FFFFFF] text-xs transition-colors"
                                                        >
                                                            Düzenle
                                                        </button>
                                                        <button
                                                            onClick={() => projeSil(p.id)}
                                                            className="text-[#A1A1AA] hover:text-red-300 text-xs transition-colors"
                                                        >
                                                            Sil
                                                        </button>
                                                    </div>
                                                }
                                            />
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SAĞ: Profil gücü ve canlı önizleme */}
                    <div className="lg:sticky lg:top-24 h-fit">
                        <div className="mb-6 rounded-2xl border border-white/[0.08] bg-[#08080D] p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-[15px] font-semibold text-white">Profil gücü</p>
                                <p className="rakam text-[14px] text-mor-soluk">%{guc}</p>
                            </div>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={guc} aria-label="Profil gücü">
                                <div className={`h-full rounded-full transition-[width] duration-500 ${guc === 100 ? 'bg-[#4ADE80]' : 'bg-gradient-to-r from-[#8B5CF6] to-[#C4B5FD] shadow-[0_0_12px_rgba(167,139,250,0.8)]'}`} style={{ width: `${guc}%` }} />
                            </div>
                            {guc === 100 ? (
                                <p className="mt-3 text-[13px] text-gri">Profilin eksiksiz; iş verenler seni tüm bilgilerinle görür. Kaydetmeyi unutma.</p>
                            ) : (
                                <ul className="mt-4 flex flex-col gap-1">
                                    {gucMaddeleri.map((m) => (
                                        <li key={m.anahtar}>
                                            {m.dolu ? (
                                                <span className="flex items-center gap-2.5 px-2 py-1.5 text-[13.5px] text-gri">
                                                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6] text-white" aria-hidden>
                                                        <Ikon ad="tik" className="h-2.5 w-2.5" kalinlik={2.6} />
                                                    </span>
                                                    {m.etiket}
                                                    <span className="sr-only">: tamam</span>
                                                </span>
                                            ) : (
                                                <button type="button" onClick={() => bolumeGit(m.bolum)} className="group flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13.5px] text-white hover:bg-white/[0.04]">
                                                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-white/25" aria-hidden />
                                                    <span className="min-w-0 flex-1">
                                                        {m.etiket}
                                                        {m.ipucu && <span className="block text-[12px] text-gri-koyu">{m.ipucu}</span>}
                                                    </span>
                                                    <span className="text-[12.5px] font-medium text-[#C4B5FD] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Ekle</span>
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <p className="text-[#A1A1AA] text-xs uppercase tracking-wider font-mono mb-3">Canlı Önizleme</p>
                        <div className="isik-kutu bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] flex items-center justify-center text-[#050505] font-bold text-lg">
                                        {baslangicHarfleri(adSoyad)}
                                    </div>
                                    <span
                                        className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0D0D13]"
                                        style={{ backgroundColor: onizlemeMusaitlik.renk }}
                                        title={onizlemeMusaitlik.etiket}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[#FFFFFF] font-semibold truncate">{adSoyad || "İsim Soyisim"}</div>
                                    <div className="text-[#A1A1AA] text-sm truncate">{unvan || "Unvan"}</div>
                                    {konum && <div className="text-[#A1A1AA]/60 text-xs mt-0.5">{konum}</div>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <span
                                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                                    style={{ color: onizlemeMusaitlik.renk, backgroundColor: `${onizlemeMusaitlik.renk}1A` }}
                                >
                                    {onizlemeMusaitlik.etiket}
                                </span>
                                {telefon && telefonDogrulandi && (
                                    <span className="text-[#4ADE80] text-xs font-medium px-2.5 py-1 rounded-full bg-[#4ADE80]/10">
                                        <Ikon ad="tik" className="inline h-3.5 w-3.5" kalinlik={2.2} /> Kimlik Doğrulandı
                                    </span>
                                )}
                            </div>

                            <p className="text-[#A1A1AA] text-sm mb-4 line-clamp-4">
                                {bio || "Hakkında yazın buraya yansıyacak..."}
                            </p>

                            {onizlemeUcret && (
                                <p className="text-[#C4B5FD] text-sm font-medium mb-4">{onizlemeUcret}</p>
                            )}

                            <div className="flex gap-2 flex-wrap mb-4">
                                {teknolojiler.length === 0 ? (
                                    <span className="text-gri-koyu text-xs">Henüz teknoloji eklenmedi</span>
                                ) : teknolojiler.map((t) => (
                                    <span key={t} className="text-[#A1A1AA] text-xs border border-white/[0.1] px-2 py-1 rounded-full font-mono">{t}</span>
                                ))}
                            </div>
                            <div className="h-px bg-white/[0.08] mb-4" />
                            <div className="text-[#A1A1AA] text-xs font-mono">
                                {projeler.length} proje eklendi
                                {oneCikanSayisi > 0 && ` · ${oneCikanSayisi} öne çıkan`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilDuzenle
