import { useState, useEffect } from 'react'
import { Sahne, SatirBaslik, HapLink } from './uzay/Hareket'
import { supabase } from '../supabaseClient'
import UstaIcazeti, { BosTezgah, IskeletIcazet } from './usta/UstaIcazeti'
import { USTA_ALANLARI, kartVerisiniTamamla } from '../ustaVerisi'
import { useAuth } from '../AuthContext'
import { useProfilRolu } from '../profilRolu'

const KART_SAYISI = 3

function Ustalar() {
    const [ustalar, setUstalar] = useState([])
    const [projeler, setProjeler] = useState({})
    const [yukleniyor, setYukleniyor] = useState(true)

    useEffect(() => {
        let iptal = false
        async function veriGetir() {
            const { data, error } = await supabase
                .from('profiller')
                .select(USTA_ALANLARI)
                .eq('rol', 'yazilimci')
                .eq('onayli', true)
                .not('unvan', 'is', null)
                .order('created_at', { ascending: false })
                .limit(KART_SAYISI)
            if (iptal) return
            if (error || !data) {
                setYukleniyor(false)
                return
            }

            const kart = await kartVerisiniTamamla(supabase, data)
            if (iptal) return
            setUstalar(kart.ustalar)
            setProjeler(kart.projeler)
            setYukleniyor(false)
        }
        veriGetir()
        return () => {
            iptal = true
        }
    }, [])

    const bosYer = Math.max(0, KART_SAYISI - ustalar.length)

    // İkinci düğme: ziyaretçiye katılma daveti, üyeye kendi rolündeki sıradaki adım
    const { user } = useAuth()
    const { girisli, rol, hazir } = useProfilRolu()
    let ikinciEylem = null
    if (hazir && !girisli) ikinciEylem = { ad: 'Usta olarak katıl', to: '/hesap-olustur?rol=yazilimci' }
    else if (hazir && rol === 'yazilimci') ikinciEylem = { ad: 'Herkese açık profilim', to: user ? `/ustalar/${user.id}` : '/profilim' }
    else if (hazir && rol === 'is-veren') ikinciEylem = { ad: 'İlan ver', to: '/ilan-ver' }

    return (
        <Sahne as="section" id="ustalar" className="uz-ufuk px-4 py-28 sm:px-8 lg:py-36">
            <div className="mx-auto max-w-[1100px] text-center">
                <SatirBaslik
                    satirlar={['İşini teslim edeceğin', 'ustalar burada.']}
                    className="font-pjs text-[clamp(2.4rem,5.6vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.025em] text-white"
                />
                <p className="uz-sub mx-auto mt-5 max-w-[44ch] text-[17px] font-light leading-[1.6] text-gri" style={{ '--d': '0.25s' }}>
                    Platformun ayrıca incelediği, onaylı profiller. Portföylerine, kıdemlerine ve önceki işlerine bak.
                </p>
            </div>

            <div className="mx-auto mt-14 max-w-[1240px]">
                {yukleniyor ? (
                    <div className="grid gap-5 md:grid-cols-3">
                        <IskeletIcazet />
                        <IskeletIcazet />
                        <IskeletIcazet />
                    </div>
                ) : ustalar.length === 0 ? (
                    <BosTezgah sira={0} genis />
                ) : (
                    <ul className="grid gap-5 md:grid-cols-3">
                        {ustalar.map((usta, i) => (
                            <li key={usta.id}>
                                <UstaIcazeti usta={usta} projeler={projeler[usta.id] || []} sira={i} />
                            </li>
                        ))}
                        {Array.from({ length: bosYer }, (_, i) => (
                            <li key={`bos-${i}`} className={i > 0 ? 'hidden md:block' : ''}>
                                <BosTezgah sira={ustalar.length + i} tur={i === bosYer - 1 && bosYer > 1 ? 'isVeren' : 'usta'} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-2.5">
                <HapLink to="/ustalar" className="uz-otur" gecikme={0.45}>Tüm ustaları gör</HapLink>
                {ikinciEylem && (
                    <HapLink to={ikinciEylem.to} tur="cam" className="uz-otur" gecikme={0.52}>{ikinciEylem.ad}</HapLink>
                )}
            </div>
        </Sahne>
    )
}

export default Ustalar
