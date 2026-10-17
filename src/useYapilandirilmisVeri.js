import { useEffect } from 'react'

// JSON-LD verisini sayfanın <head>'ine yazar; veri değişince ya da sayfadan çıkınca kaldırır.
// Üreticiler src/yapilandirilmisVeri.js'te.
export default function useYapilandirilmisVeri(veri) {
    const metin = veri ? JSON.stringify(veri) : null
    useEffect(() => {
        if (!metin) return
        const etiket = document.createElement('script')
        etiket.type = 'application/ld+json'
        etiket.textContent = metin
        document.head.appendChild(etiket)
        return () => etiket.remove()
    }, [metin])
}
