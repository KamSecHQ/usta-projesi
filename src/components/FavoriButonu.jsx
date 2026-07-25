import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'

function FavoriButonu({ ustaId, boyut = "normal" }) {
    const { user } = useAuth()
    const [favoriMi, setFavoriMi] = useState(false)
    const [yukleniyor, setYukleniyor] = useState(false)
    const [kontrolEdildi, setKontrolEdildi] = useState(false)

    useEffect(() => {
        async function kontrolEt() {
            if (!user || user.id === ustaId) {
                setKontrolEdildi(true)
                return
            }
            const { data } = await supabase
                .from('favoriler')
                .select('id')
                .eq('kullanici_id', user.id)
                .eq('usta_id', ustaId)
                .maybeSingle()

            setFavoriMi(!!data)
            setKontrolEdildi(true)
        }
        kontrolEt()
    }, [user, ustaId])

    async function tikla(e) {
        e.preventDefault()
        e.stopPropagation()
        if (!user || yukleniyor) return

        setYukleniyor(true)
        if (favoriMi) {
            await supabase.from('favoriler').delete().eq('kullanici_id', user.id).eq('usta_id', ustaId)
            setFavoriMi(false)
        } else {
            await supabase.from('favoriler').insert({ kullanici_id: user.id, usta_id: ustaId })
            setFavoriMi(true)
        }
        setYukleniyor(false)
    }

    // Kendi profilinde ya da giriş yapılmamışsa gösterme.
    if (!user || user.id === ustaId || !kontrolEdildi) return null

    const boyutSinifi = boyut === "kucuk" ? "w-8 h-8" : "w-10 h-10"

    return (
        <button
            onClick={tikla}
            disabled={yukleniyor}
            className={`${boyutSinifi} flex items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] hover:border-[#C97D3C]/40 transition-all duration-300 shrink-0`}
            aria-label={favoriMi ? "Favorilerden çıkar" : "Favorilere ekle"}
            title={favoriMi ? "Favorilerden çıkar" : "Favorilere ekle"}
        >
            <svg
                viewBox="0 0 24 24"
                fill={favoriMi ? "#C97D3C" : "none"}
                stroke={favoriMi ? "#C97D3C" : "currentColor"}
                strokeWidth="1.5"
                className={`w-4.5 h-4.5 transition-colors duration-300 ${favoriMi ? "" : "text-[#9FC2BC]"}`}
            >
                <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.5 0 5.5 3.5 3.5 7.5C15 16.65 12 21 12 21z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    )
}

export default FavoriButonu
