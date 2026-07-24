import { useEffect } from 'react'

function useSayfaBasligi(baslik) {
    useEffect(() => {
        const eskiBaslik = document.title
        document.title = baslik ? `${baslik} — USTA` : "USTA — Türkiye'nin Yazılım Çarşısı"
        return () => { document.title = eskiBaslik }
    }, [baslik])
}

export default useSayfaBasligi
