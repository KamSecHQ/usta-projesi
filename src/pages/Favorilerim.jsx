import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import UstaCard from '../components/UstaCard'
import { IskeletUstaKarti } from '../components/Iskelet'

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad.split(" ").filter(Boolean).slice(0, 2).map((k) => k[0].toUpperCase()).join("")
}

function Favorilerim() {
    useSayfaBasligi('Favorilerim')
    const { user, yukleniyor: authYukleniyor } = useAuth()
    const [ustalar, setUstalar] = useState([])
    const [yukleniyor, setYukleniyor] = useState(true)

    useEffect(() => {
        async function veriGetir() {
            if (!user) return
            const { data, error } = await supabase
                .from('favoriler')
                .select('usta_id, profiller!favoriler_usta_id_fkey(*)')
                .eq('kullanici_id', user.id)
                .order('created_at', { ascending: false })

            if (!error && data) {
                setUstalar(data.map((f) => f.profiller).filter(Boolean))
            }
            setYukleniyor(false)
        }
        if (user) veriGetir()
    }, [user])

    if (authYukleniyor) {
        return <div className="min-h-screen bg-[#0D2626] flex items-center justify-center text-[#9FC2BC]">Yükleniyor...</div>
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0D2626] flex flex-col items-center justify-center text-center px-6">
                <p className="text-[#9FC2BC] mb-4">Favorilerini görmek için giriş yapmalısın.</p>
                <Link to="/giris" className="text-[#C97D3C] hover:underline">Giriş yap</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-5xl mx-auto">
                <Link to="/ustalar" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">
                    ← Tüm ustalara dön
                </Link>
                <h1 className="text-[#F3ECE1] text-3xl font-bold mt-6 mb-2">Favorilerim</h1>
                <p className="text-[#9FC2BC] text-sm mb-10">Kaydettiğin ustalar burada listelenir.</p>

                {yukleniyor ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        <IskeletUstaKarti />
                        <IskeletUstaKarti />
                        <IskeletUstaKarti />
                    </div>
                ) : ustalar.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-[#9FC2BC] mb-4">Henüz favori eklemedin.</p>
                        <Link to="/ustalar" className="text-[#C97D3C] hover:underline text-sm">
                            Ustalara göz at →
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {ustalar.map((usta) => (
                            <Link to={`/ustalar/${usta.id}`} key={usta.id}>
                                <UstaCard
                                    id={usta.id}
                                    initials={baslangicHarfleri(usta.ad_soyad)}
                                    name={usta.ad_soyad || "İsimsiz Usta"}
                                    role={usta.unvan}
                                    desc={usta.bio}
                                    tags={usta.teknolojiler}
                                    onayli={usta.onayli}
                                    musaitlik={usta.musaitlik}
                                    sonGorulme={usta.son_gorulme}
                                    ucretMin={usta.saatlik_ucret_min}
                                    ucretMax={usta.saatlik_ucret_max}
                                />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Favorilerim
