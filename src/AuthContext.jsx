import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [yukleniyor, setYukleniyor] = useState(true)
    // navigate her sayfa geçişinde yenilenebilir; oturum dinleyicisi bir kez kurulsun diye ref'te tutulur
    const navigate = useNavigate()
    const yonlendir = useRef(navigate)
    yonlendir.current = navigate

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setYukleniyor(false)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((olay, session) => {
            setUser(session?.user ?? null)
            // Şifre sıfırlama bağlantısından gelindi: yeni şifre sayfasına
            if (olay === 'PASSWORD_RECOVERY' && window.location.pathname !== '/sifre-yenile') yonlendir.current('/sifre-yenile')
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    // Çevrimiçi göstergesi için "son görülme" nabzı: kullanıcı giriş
    // yapmışken belirli aralıklarla profilinin son_gorulme alanını günceller.
    useEffect(() => {
        if (!user) return

        // Supabase sorguları tembeldir: then/await çağrılmadan istek gönderilmez
        function nabizAt() {
            supabase
                .from('profiller')
                .update({ son_gorulme: new Date().toISOString() })
                .eq('id', user.id)
                .then(() => {})
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
