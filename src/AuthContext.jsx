import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [yukleniyor, setYukleniyor] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setYukleniyor(false)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    // Çevrimiçi göstergesi için "son görülme" nabzı: kullanıcı giriş
    // yapmışken belirli aralıklarla profilinin son_gorulme alanını günceller.
    useEffect(() => {
        if (!user) return

        function nabizAt() {
            supabase.from('profiller').update({ son_gorulme: new Date().toISOString() }).eq('id', user.id)
        }

        nabizAt()
        const aralik = setInterval(nabizAt, 4 * 60 * 1000)
        return () => clearInterval(aralik)
    }, [user])

    return (
        <AuthContext.Provider value={{ user, yukleniyor }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
