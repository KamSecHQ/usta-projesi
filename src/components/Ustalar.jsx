import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import UstaCard from './UstaCard'

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((k) => k[0].toUpperCase())
        .join("")
}

function Ustalar() {
    const [ustalar, setUstalar] = useState([])
    const [yukleniyor, setYukleniyor] = useState(true)

    useEffect(() => {
        async function veriGetir() {
            const { data, error } = await supabase
                .from('profiller')
                .select('*')
                .eq('rol', 'yazilimci')
                .eq('onayli', true)
                .not('unvan', 'is', null)
                .order('created_at', { ascending: false })
                .limit(3)

            if (!error) setUstalar(data)
            setYukleniyor(false)
        }
        veriGetir()
    }, [])

    return (
        <section id="ustalar" className="relative bg-[#0D2626] py-24 px-6">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

            <div className="max-w-5xl mx-auto">

                <span className="text-[#C97D3C] text-sm tracking-widest uppercase font-mono">
                    Öne Çıkanlar
                </span>
                <h2 className="text-[#F3ECE1] text-3xl font-bold mt-3 mb-12">
                    Ustalarımızdan örnekler
                </h2>
                <Link to="/ustalar" className="text-[#C97D3C] text-sm hover:underline mb-8 inline-block">
                    Tüm ustaları gör →
                </Link>

                {yukleniyor ? (
                    <p className="text-[#9FC2BC] text-sm">Yükleniyor...</p>
                ) : ustalar.length === 0 ? (
                    <p className="text-[#9FC2BC] text-sm">
                        Henüz profilini tamamlamış bir usta yok — ilk sen ol!
                    </p>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {ustalar.map((usta) => (
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
        </section>
    )
}

export default Ustalar
