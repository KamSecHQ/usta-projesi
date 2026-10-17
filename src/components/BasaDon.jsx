import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Yeni bir sayfaya geçince pencere başa döner; geri/ileri gezinmede tarayıcının konumu korunur.
// Sayfa içi bağlantılar (#bolum) kendi kaydırmalarını yapar.
export default function BasaDon() {
    const { pathname, hash } = useLocation()
    const tur = useNavigationType()

    useEffect(() => {
        if (tur === 'POP' || hash) return
        window.scrollTo(0, 0)
    }, [pathname, hash, tur])

    return null
}
