import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import UstaCard from '../components/UstaCard'

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((k) => k[0].toUpperCase())
        .join("")
}

function TumUstalar() {
    const [arama, setArama] = useState("")
    const [ustalar, setUstalar] = useState([])
    const [yukleniyor, setYukleniyor] = useState(true)

    useEffect(() => {
        async function veriGetir() {
            const { data, error } = await supabase
                .from('profiller')
                .select('*')
                .eq('rol', 'yazilimci')
                .not('unvan', 'is', null)
                .order('created_at', { ascending: false })

            if (!error) setUstalar(data)
            setYukleniyor(false)
        }
        veriGetir()
    }, [])

    const filtrelenmis = ustalar.filter((u) => {
        const aramaKucuk = arama.toLowerCase()
        const teknolojiler = u.teknolojiler || []
        return (
            (u.ad_soyad || "").toLowerCase().includes(aramaKucuk) ||
            (u.unvan || "").toLowerCase().includes(aramaKucuk) ||
            teknolojiler.some((t) => t.toLowerCase().includes(aramaKucuk))
        )
    })

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-5xl mx-auto">
                <Link to="/" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1]">
                    ← Anasayfaya dön
                </Link>
                <h1 className="text-[#F3ECE1] text-3xl font-bold mt-6 mb-2">
                    Tüm Ustalar
                </h1>
                <p className="text-[#9FC2BC] mb-8">
                    İsim, uzmanlık ya da teknoloji ile ara.
                </p>

                <input
                    type="text"
                    value={arama}
                    onChange={(e) => setArama(e.target.value)}
                    placeholder="örn. React, Mobil..."
                    className="w-full max-w-md bg-[#123434] border border-[#21504E] rounded px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C] mb-10"
                />

                {yukleniyor ? (
                    <p className="text-[#9FC2BC]">Yükleniyor...</p>
                ) : filtrelenmis.length === 0 ? (
                    <p className="text-[#9FC2BC]">
                        {ustalar.length === 0
                            ? "Henüz profilini tamamlamış bir usta yok."
                            : "Aramanla eşleşen usta bulunamadı."}
                    </p>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {filtrelenmis.map((usta) => (
                            <Link to={`/ustalar/${usta.id}`} key={usta.id}>
                                <UstaCard
                                    initials={baslangicHarfleri(usta.ad_soyad)}
                                    name={usta.ad_soyad || "İsimsiz Usta"}
                                    role={usta.unvan}
                                    desc={usta.bio}
                                    tags={usta.teknolojiler}
                                    onayli={usta.onayli}
                                />
                            </Link>
                        ))}
                    </div>

                )}
            </div>
        </div>
    )
}

export default TumUstalar
