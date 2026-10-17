import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from './supabaseClient'

// Giriş yapmış kullanıcının rolü ('yazilimci' | 'is-veren'): kayıt davetlerinin yerine role
// uygun eylemleri koymak için. Aynı oturumda kullanıcı başına tek sorgu; söz önbellekte durur.
const onbellek = new Map()

// Yalnızca geliştirmede: ?rol-onizleme=yazilimci | is-veren | uye ile üye hâli giriş yapmadan görülür
const ONIZLEME = import.meta.env.DEV && typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('rol-onizleme') : null

function rolGetir(id) {
    if (!onbellek.has(id)) {
        onbellek.set(
            id,
            supabase
                .from('profiller')
                .select('rol')
                .eq('id', id)
                .maybeSingle()
                .then(
                    ({ data }) => data?.rol ?? null,
                    () => null
                )
        )
    }
    return onbellek.get(id)
}

// { girisli, rol, hazir }: hazir, ziyaretçi için oturum okununca, üye için rol gelince true olur.
// Hazır olmadan eylem düğmeleri çizilmez; ziyaretçi davetinin üyeye bir an görünmesi önlenir.
export function useProfilRolu() {
    const { user, yukleniyor } = useAuth()
    const [sonuc, setSonuc] = useState({ id: null, rol: null })

    useEffect(() => {
        if (!user) return
        let iptal = false
        rolGetir(user.id).then((rol) => {
            if (!iptal) setSonuc({ id: user.id, rol })
        })
        return () => {
            iptal = true
        }
    }, [user])

    if (ONIZLEME) return { girisli: true, rol: ONIZLEME === 'uye' ? null : ONIZLEME, hazir: true }
    if (!user) return { girisli: false, rol: null, hazir: !yukleniyor }
    const rolGeldi = sonuc.id === user.id
    return { girisli: true, rol: rolGeldi ? sonuc.rol : null, hazir: rolGeldi }
}

// Üyeye gösterilecek iki ana eylem: önce birincil, sonra cam düğme
export function uyeEylemleri(rol) {
    if (rol === 'yazilimci') {
        return [
            { ad: 'Açık ilanlara göz at', to: '/is-ilanlari' },
            { ad: 'Panelime git', to: '/panel' },
        ]
    }
    if (rol === 'is-veren') {
        return [
            { ad: 'İlan ver', to: '/ilan-ver' },
            { ad: 'Ustalara göz at', to: '/ustalar' },
        ]
    }
    return [
        { ad: 'Panelime git', to: '/panel' },
        { ad: 'Ustalara göz at', to: '/ustalar' },
    ]
}
