import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'

function ProfilDuzenle() {
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
    const [teknolojiler, setTeknolojiler] = useState("")

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
                setTeknolojiler((data.teknolojiler || []).join(", "))
            }
            setYukleniyor(false)
        }
        if (user) profilGetir()
    }, [user])

    async function kaydet(e) {
        e.preventDefault()
        setKaydediliyor(true)
        setHata("")
        setKaydedildi(false)

        const teknolojiDizisi = teknolojiler
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)

        const { error } = await supabase
            .from('profiller')
            .update({
                ad_soyad: adSoyad,
                unvan,
                bio,
                github_url: githubUrl,
                konum,
                teknolojiler: teknolojiDizisi,
            })
            .eq('id', user.id)

        setKaydediliyor(false)
        if (error) {
            setHata(error.message)
        } else {
            setKaydedildi(true)
        }
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

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-lg mx-auto">
                <Link to="/" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1]">
                    ← Anasayfaya dön
                </Link>
                <h1 className="text-[#F3ECE1] text-3xl font-bold mt-6 mb-2">
                    Profilimi Düzenle
                </h1>
                <p className="text-[#9FC2BC] mb-8 text-sm">
                    Buradaki bilgiler "Ustalar" listesinde herkese açık görünecek.
                </p>

                <form onSubmit={kaydet} className="flex flex-col gap-4">
                    <div>
                        <label className="text-[#9FC2BC] text-sm block mb-1">Ad Soyad</label>
                        <input
                            type="text"
                            value={adSoyad}
                            onChange={(e) => setAdSoyad(e.target.value)}
                            placeholder="Emirhan Baydere"
                            className="w-full bg-[#123434] border border-[#21504E] rounded px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]"
                        />
                    </div>
                    <div>
                        <label className="text-[#9FC2BC] text-sm block mb-1">Unvan</label>
                        <input
                            type="text"
                            value={unvan}
                            onChange={(e) => setUnvan(e.target.value)}
                            placeholder="Frontend Geliştirici"
                            className="w-full bg-[#123434] border border-[#21504E] rounded px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]"
                        />
                    </div>
                    <div>
                        <label className="text-[#9FC2BC] text-sm block mb-1">Hakkında</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            placeholder="Neler yaptığını, hangi projelerde çalıştığını kısaca anlat..."
                            className="w-full bg-[#123434] border border-[#21504E] rounded px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C] resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-[#9FC2BC] text-sm block mb-1">Teknolojiler (virgülle ayır)</label>
                        <input
                            type="text"
                            value={teknolojiler}
                            onChange={(e) => setTeknolojiler(e.target.value)}
                            placeholder="React, Node.js, PostgreSQL"
                            className="w-full bg-[#123434] border border-[#21504E] rounded px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]"
                        />
                    </div>
                    <div>
                        <label className="text-[#9FC2BC] text-sm block mb-1">GitHub Linki</label>
                        <input
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/kullaniciadi"
                            className="w-full bg-[#123434] border border-[#21504E] rounded px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]"
                        />
                    </div>
                    <div>
                        <label className="text-[#9FC2BC] text-sm block mb-1">Konum</label>
                        <input
                            type="text"
                            value={konum}
                            onChange={(e) => setKonum(e.target.value)}
                            placeholder="İstanbul"
                            className="w-full bg-[#123434] border border-[#21504E] rounded px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]"
                        />
                    </div>

                    {hata && <p className="text-red-400 text-sm">{hata}</p>}
                    {kaydedildi && <p className="text-[#E3B776] text-sm">Profil kaydedildi!</p>}

                    <button
                        type="submit"
                        disabled={kaydediliyor}
                        className="bg-[#C97D3C] text-[#0D2626] font-semibold px-6 py-3 rounded mt-2 disabled:opacity-50"
                    >
                        {kaydediliyor ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ProfilDuzenle
