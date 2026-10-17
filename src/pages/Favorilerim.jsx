import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import UstaIcazeti, { IskeletIcazet } from '../components/usta/UstaIcazeti'
import FavoriButonu from '../components/FavoriButonu'
import { SonucYok } from '../components/liste/ListeAraclari'
import { Sahne, HapLink } from '../components/uzay/Hareket'
import { USTA_ALANLARI, kartVerisiniTamamla } from '../ustaVerisi'
import GirisKapisi from '../components/hesap/GirisKapisi'

function Favorilerim() {
    useSayfaBasligi('Favorilerim')
    const { user, yukleniyor: authYukleniyor } = useAuth()
    const [ustalar, setUstalar] = useState([])
    const [projeler, setProjeler] = useState({})
    const [yukleniyor, setYukleniyor] = useState(true)

    useEffect(() => {
        let iptal = false
        async function veriGetir() {
            const { data, error } = await supabase
                .from('favoriler')
                .select(`usta_id, profiller!favoriler_usta_id_fkey(${USTA_ALANLARI})`)
                .eq('kullanici_id', user.id)
                .order('created_at', { ascending: false })
            if (iptal) return
            const liste = !error && data ? data.map((f) => f.profiller).filter(Boolean) : []
            const kart = await kartVerisiniTamamla(supabase, liste)
            if (iptal) return
            setUstalar(kart.ustalar)
            setProjeler(kart.projeler)
            setYukleniyor(false)
        }
        if (user) veriGetir()
        return () => {
            iptal = true
        }
    }, [user])

    if (authYukleniyor) {
        return <div className="uzay min-h-screen" role="status" aria-label="Yükleniyor"><div className="uz-yildizlar" aria-hidden /></div>
    }

    if (!user) {
        return (
            <GirisKapisi ikon="kalp" baslik="Favorilerin burada toplanır" metin="Beğendiğin ustaları kaydet, sonra yan yana karşılaştır. Bunun için hesabına giriş yap." />
        )
    }

    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />
            <section className="px-4 pb-28 pt-14 sm:px-8 lg:pt-20">
                <div className="mx-auto max-w-[1240px]">
                    <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
                        <div>
                            <h1 className="font-pjs text-[clamp(2.2rem,4.4vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white">Favorilerim</h1>
                            <p className="mt-3 text-[16px] font-light text-gri">Kaydettiğin ustalar. Kalbe yeniden basarak listeden çıkarabilirsin.</p>
                        </div>
                        <Link to="/ustalar" className="text-[14px] font-medium text-mor-soluk hover:text-white">
                            Tüm ustalara göz at
                        </Link>
                    </header>

                    <Sahne className="mt-10" esik={0.01}>
                        {yukleniyor ? (
                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                <IskeletIcazet />
                                <IskeletIcazet />
                                <IskeletIcazet />
                            </div>
                        ) : ustalar.length === 0 ? (
                            <SonucYok
                                baslik="Henüz favori eklemedin"
                                metin="Ustalar sayfasında beğendiğin profilin kalbine dokun; burada seni bekler."
                                eylem={<HapLink to="/ustalar">Ustalara göz at</HapLink>}
                            />
                        ) : (
                            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {ustalar.map((usta, i) => (
                                    <li key={usta.id}>
                                        <UstaIcazeti usta={usta} projeler={projeler[usta.id] || []} sira={Math.min(i, 5)} favori={<FavoriButonu ustaId={usta.id} boyut="kucuk" baslangic />} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Sahne>
                </div>
            </section>
        </div>
    )
}

export default Favorilerim
