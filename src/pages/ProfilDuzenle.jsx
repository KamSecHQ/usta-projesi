import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import ProjeKarti from '../components/ProjeKarti'
import { IskeletProjeKarti } from '../components/Iskelet'
import { musaitlikBilgisi, ucretAraligiGoster, videoEmbedUrl } from '../ustaYardimcilari'


function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad.split(" ").filter(Boolean).slice(0, 2).map((k) => k[0].toUpperCase()).join("")
}

function ProfilDuzenle() {
    useSayfaBasligi('Portföyümü Düzenle')

    const { user, yukleniyor: authYukleniyor } = useAuth()
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
    const [teknolojiGirdisi, setTeknolojiGirdisi] = useState("")

    // Faz 1 — profil zenginleştirme alanları
    const [telefon, setTelefon] = useState("")
    const [telefonDogrulandi, setTelefonDogrulandi] = useState(false)
    const [musaitlik, setMusaitlik] = useState("musait")
    const [musaitlikNotu, setMusaitlikNotu] = useState("")
    const [ucretMin, setUcretMin] = useState("")
    const [ucretMax, setUcretMax] = useState("")
    const [videoUrl, setVideoUrl] = useState("")

    const [projeler, setProjeler] = useState([])
    const [projelerYukleniyor, setProjelerYukleniyor] = useState(true)
    const [yeniProjeBaslik, setYeniProjeBaslik] = useState("")
    const [yeniProjeAciklama, setYeniProjeAciklama] = useState("")
    const [yeniProjeLink, setYeniProjeLink] = useState("")
    const [yeniProjeTeknoloji, setYeniProjeTeknoloji] = useState("")
    const [projeEkleniyor, setProjeEkleniyor] = useState(false)

    useEffect(() => {
        async function profilGetir() {
            if (!user) return
            const { data, error } = await supabase
                .from('profiller')
                .select('*')
                .eq('id', user.id)
                .single()

            if (!error && data) {
                setAdSoyad(data.ad_soyad || "")
                setUnvan(data.unvan || "")
                setBio(data.bio || "")
                setGithubUrl(data.github_url || "")
                setKonum(data.konum || "")
                setTeknolojiler(data.teknolojiler || [])
                setTelefon(data.telefon || "")
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

    useEffect(() => {
        async function projeleriGetir() {
            if (!user) return
            const { data, error } = await supabase
                .from('projeler')
                .select('*')
                .eq('kullanici_id', user.id)
                .order('created_at', { ascending: false })

            if (!error) setProjeler(data)
            setProjelerYukleniyor(false)
        }
        if (user) projeleriGetir()
    }, [user])

    function teknolojiEkle(e) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            const temiz = teknolojiGirdisi.trim()
            if (temiz && !teknolojiler.includes(temiz)) {
                setTeknolojiler([...teknolojiler, temiz])
            }
            setTeknolojiGirdisi("")
        } else if (e.key === "Backspace" && teknolojiGirdisi === "" && teknolojiler.length > 0) {
            setTeknolojiler(teknolojiler.slice(0, -1))
        }
    }

    function teknolojiSil(t) {
        setTeknolojiler(teknolojiler.filter((x) => x !== t))
    }

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
                telefon: telefon || null,
                musaitlik,
                musaitlik_notu: musaitlik === 'kismi_musait' ? musaitlikNotu : null,
                saatlik_ucret_min: ucretMin === "" ? null : Number(ucretMin),
                saatlik_ucret_max: ucretMax === "" ? null : Number(ucretMax),
                video_url: videoUrl || null,
            })
            .eq('id', user.id)

        setKaydediliyor(false)
        if (error) {
            setHata(error.message)
        } else {
            setKaydedildi(true)
            setTimeout(() => setKaydedildi(false), 3000)
        }
    }

    async function projeEkle(e) {
        e.preventDefault()
        if (!yeniProjeBaslik.trim()) return
        setProjeEkleniyor(true)

        const teknolojiDizisi = yeniProjeTeknoloji
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)

        const { data, error } = await supabase
            .from('projeler')
            .insert({
                kullanici_id: user.id,
                baslik: yeniProjeBaslik,
                aciklama: yeniProjeAciklama,
                link: yeniProjeLink,
                teknolojiler: teknolojiDizisi,
            })
            .select()
            .single()

        setProjeEkleniyor(false)
        if (!error && data) {
            setProjeler([data, ...projeler])
            setYeniProjeBaslik("")
            setYeniProjeAciklama("")
            setYeniProjeLink("")
            setYeniProjeTeknoloji("")
        }
    }

    async function projeSil(id) {
        await supabase.from('projeler').delete().eq('id', id)
        setProjeler(projeler.filter((p) => p.id !== id))
    }

    if (authYukleniyor || yukleniyor) {
        return <div className="min-h-screen bg-[#0D2626] flex items-center justify-center text-[#9FC2BC]">Yükleniyor...</div>
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0D2626] flex flex-col items-center justify-center text-center px-6">
                <p className="text-[#9FC2BC] mb-4">Profilini düzenlemek için giriş yapmalısın.</p>
                <Link to="/giris" className="text-[#C97D3C] hover:underline">Giriş yap</Link>
            </div>
        )
    }

    const inputClass = "w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]/60 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-[#9FC2BC]/40"
    const labelClass = "text-[#9FC2BC] text-xs uppercase tracking-wider font-mono block mb-2"
    const musaitlikSecenekleri = [
        { deger: 'musait', ad: 'Müsait' },
        { deger: 'kismi_musait', ad: 'Kısmi Müsait' },
        { deger: 'musait_degil', ad: 'Müsait Değil' },
    ]
    const gomulVideo = videoEmbedUrl(videoUrl)
    const onizlemeUcret = ucretAraligiGoster(ucretMin || null, ucretMax || null)
    const onizlemeMusaitlik = musaitlikBilgisi(musaitlik)

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-6xl mx-auto">
                <Link to="/" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">
                    ← Anasayfaya dön
                </Link>
                <div className="flex items-center justify-between mt-6 mb-10 flex-wrap gap-4">
                    <div>
                        <h1 className="text-[#F3ECE1] text-3xl font-bold">
                            Portföyümü Düzenle
                        </h1>
                        <p className="text-[#9FC2BC] text-sm mt-1">
                            Buradaki bilgiler herkese açık portföy sayfanda görünecek.
                        </p>
                    </div>
                    <Link
                        to={`/ustalar/${user.id}`}
                        className="bg-white/[0.05] backdrop-blur-md border border-white/[0.1] text-[#F3ECE1] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/[0.1] hover:border-[#C97D3C]/40 transition-all duration-300"
                    >
                        Portföyümü Görüntüle ↗
                    </Link>
                </div>

                <div className="grid lg:grid-cols-[1fr_380px] gap-8">
                    {/* SOL: Form */}
                    <div className="flex flex-col gap-6">

                        {/* Temel Bilgiler */}
                        <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6">
                            <h2 className="text-[#F3ECE1] font-semibold mb-5">Temel Bilgiler</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Ad Soyad</label>
                                    <input type="text" value={adSoyad} onChange={(e) => setAdSoyad(e.target.value)} placeholder="Emirhan Baydere" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Unvan</label>
                                    <input type="text" value={unvan} onChange={(e) => setUnvan(e.target.value)} placeholder="Frontend Geliştirici" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Konum</label>
                                    <input type="text" value={konum} onChange={(e) => setKonum(e.target.value)} placeholder="İstanbul" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>GitHub Linki</label>
                                    <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/kullaniciadi" className={inputClass} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>
                                        Telefon
                                        {telefon && (
                                            telefonDogrulandi ? (
                                                <span className="ml-2 normal-case text-[#4ADE80] text-xs">✓ Doğrulandı</span>
                                            ) : (
                                                <span className="ml-2 normal-case text-[#9FC2BC]/60 text-xs">Doğrulanmadı — yönetici incelemesi bekleniyor</span>
                                            )
                                        )}
                                    </label>
                                    <input type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="0555 555 55 55" className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* Hakkımda */}
                        <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6">
                            <h2 className="text-[#F3ECE1] font-semibold mb-5">Hakkımda</h2>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={5}
                                placeholder="Neler yaptığını, hangi projelerde çalıştığını kısaca anlat..."
                                className={inputClass + " resize-none"}
                            />
                        </div>

                        {/* Teknolojiler - chip input */}
                        <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6">
                            <h2 className="text-[#F3ECE1] font-semibold mb-5">Teknolojiler</h2>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {teknolojiler.map((t) => (
                                    <span key={t} className="flex items-center gap-1.5 bg-[#C97D3C]/10 border border-[#C97D3C]/30 text-[#E3B776] text-xs px-3 py-1.5 rounded-full font-mono">
                                        {t}
                                        <button type="button" onClick={() => teknolojiSil(t)} className="hover:text-red-300 transition-colors">×</button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={teknolojiGirdisi}
                                onChange={(e) => setTeknolojiGirdisi(e.target.value)}
                                onKeyDown={teknolojiEkle}
                                placeholder="Yaz, Enter'a bas: React, Node.js..."
                                className={inputClass}
                            />
                        </div>

                        {/* Müsaitlik */}
                        <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6">
                            <h2 className="text-[#F3ECE1] font-semibold mb-5">Müsaitlik Durumu</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                {musaitlikSecenekleri.map((s) => (
                                    <button
                                        key={s.deger}
                                        type="button"
                                        onClick={() => setMusaitlik(s.deger)}
                                        className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-300 ${musaitlik === s.deger
                                            ? "bg-[#C97D3C] text-[#0D2626] border-[#C97D3C]"
                                            : "bg-white/[0.03] text-[#9FC2BC] border-white/[0.1] hover:bg-white/[0.06]"
                                            }`}
                                    >
                                        {s.ad}
                                    </button>
                                ))}
                            </div>
                            {musaitlik === 'kismi_musait' && (
                                <input
                                    type="text"
                                    value={musaitlikNotu}
                                    onChange={(e) => setMusaitlikNotu(e.target.value)}
                                    placeholder="örn. 2 hafta sonra müsait"
                                    className={inputClass}
                                />
                            )}
                        </div>

                        {/* Ücret Aralığı */}
                        <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6">
                            <h2 className="text-[#F3ECE1] font-semibold mb-1">Saatlik Ücret Aralığı</h2>
                            <p className="text-[#9FC2BC] text-sm mb-5">İsteğe bağlı — beklentileri baştan netleştirir.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Min (₺)</label>
                                    <input type="number" min="0" value={ucretMin} onChange={(e) => setUcretMin(e.target.value)} placeholder="300" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Maks (₺)</label>
                                    <input type="number" min="0" value={ucretMax} onChange={(e) => setUcretMax(e.target.value)} placeholder="600" className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* Tanıtım Videosu */}
                        <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6">
                            <h2 className="text-[#F3ECE1] font-semibold mb-1">Tanıtım Videosu</h2>
                            <p className="text-[#9FC2BC] text-sm mb-5">YouTube ya da Loom linki — kendini kısaca tanıt.</p>
                            <input
                                type="url"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="https://youtube.com/watch?v=..."
                                className={inputClass}
                            />
                            {videoUrl && !gomulVideo && (
                                <p className="text-[#9FC2BC]/60 text-xs mt-2">
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

                        {hata && <p className="text-red-400 text-sm">{hata}</p>}
                        {kaydedildi && <p className="text-[#E3B776] text-sm">✓ Profil kaydedildi</p>}

                        <button
                            onClick={kaydet}
                            disabled={kaydediliyor}
                            className="bg-[#C97D3C] text-[#0D2626] font-semibold px-6 py-3 rounded-full disabled:opacity-50 hover:bg-[#E3B776] transition-all duration-300 self-start"
                        >
                            {kaydediliyor ? "Kaydediliyor..." : "Profili Kaydet"}
                        </button>

                        {/* Projelerim */}
                        <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 mt-4">
                            <h2 className="text-[#F3ECE1] font-semibold mb-1">Projelerim</h2>
                            <p className="text-[#9FC2BC] text-sm mb-5">Portföyünde öne çıkacak çalışmalarını ekle.</p>

                            <form onSubmit={projeEkle} className="flex flex-col gap-3 mb-6 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                                <input
                                    type="text"
                                    value={yeniProjeBaslik}
                                    onChange={(e) => setYeniProjeBaslik(e.target.value)}
                                    placeholder="Proje başlığı"
                                    className={inputClass}
                                />
                                <textarea
                                    value={yeniProjeAciklama}
                                    onChange={(e) => setYeniProjeAciklama(e.target.value)}
                                    rows={2}
                                    placeholder="Kısa açıklama"
                                    className={inputClass + " resize-none"}
                                />
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <input
                                        type="url"
                                        value={yeniProjeLink}
                                        onChange={(e) => setYeniProjeLink(e.target.value)}
                                        placeholder="Proje linki (isteğe bağlı)"
                                        className={inputClass}
                                    />
                                    <input
                                        type="text"
                                        value={yeniProjeTeknoloji}
                                        onChange={(e) => setYeniProjeTeknoloji(e.target.value)}
                                        placeholder="Teknolojiler (virgülle ayır)"
                                        className={inputClass}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={projeEkleniyor || !yeniProjeBaslik.trim()}
                                    className="bg-white/[0.05] border border-white/[0.1] text-[#F3ECE1] px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/[0.1] hover:border-[#C97D3C]/40 transition-all duration-300 disabled:opacity-40 self-start"
                                >
                                    {projeEkleniyor ? "Ekleniyor..." : "+ Proje Ekle"}
                                </button>
                            </form>

                            {projelerYukleniyor ? (
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <IskeletProjeKarti />
                                    <IskeletProjeKarti />
                                </div>
                            ) : projeler.length === 0 ? (
                                <p className="text-[#9FC2BC] text-sm">Henüz proje eklemedin.</p>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {projeler.map((p) => (
                                        <ProjeKarti
                                            key={p.id}
                                            proje={p}
                                            aksiyon={
                                                <button
                                                    onClick={() => projeSil(p.id)}
                                                    className="text-[#9FC2BC] hover:text-red-300 text-xs transition-colors"
                                                >
                                                    Sil
                                                </button>
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SAĞ: Canlı Önizleme */}
                    <div className="lg:sticky lg:top-24 h-fit">
                        <p className="text-[#9FC2BC] text-xs uppercase tracking-wider font-mono mb-3">Canlı Önizleme</p>
                        <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C97D3C] to-[#E3B776] flex items-center justify-center text-[#0D2626] font-bold text-lg">
                                        {baslangicHarfleri(adSoyad)}
                                    </div>
                                    <span
                                        className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#123434]"
                                        style={{ backgroundColor: onizlemeMusaitlik.renk }}
                                        title={onizlemeMusaitlik.etiket}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[#F3ECE1] font-semibold truncate">{adSoyad || "İsim Soyisim"}</div>
                                    <div className="text-[#9FC2BC] text-sm truncate">{unvan || "Unvan"}</div>
                                    {konum && <div className="text-[#9FC2BC]/60 text-xs mt-0.5">{konum}</div>}
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
                                        ✓ Kimlik Doğrulandı
                                    </span>
                                )}
                            </div>

                            <p className="text-[#9FC2BC] text-sm mb-4 line-clamp-4">
                                {bio || "Hakkında yazın buraya yansıyacak..."}
                            </p>

                            {onizlemeUcret && (
                                <p className="text-[#E3B776] text-sm font-medium mb-4">{onizlemeUcret}</p>
                            )}

                            <div className="flex gap-2 flex-wrap mb-4">
                                {teknolojiler.length === 0 ? (
                                    <span className="text-[#9FC2BC]/40 text-xs">Henüz teknoloji eklenmedi</span>
                                ) : teknolojiler.map((t) => (
                                    <span key={t} className="text-[#9FC2BC] text-xs border border-white/[0.1] px-2 py-1 rounded-full font-mono">{t}</span>
                                ))}
                            </div>
                            <div className="h-px bg-white/[0.08] mb-4" />
                            <div className="text-[#9FC2BC] text-xs font-mono">
                                {projeler.length} proje eklendi
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilDuzenle
