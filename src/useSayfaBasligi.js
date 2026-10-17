import { useEffect } from 'react'

const SITE = 'https://www.kalfahane.com'
const VARSAYILAN_BASLIK = "Kalfahane — Türkiye'nin Yazılım Çarşısı"
const VARSAYILAN_ACIKLAMA =
    'Doğrulanmış Türk yazılımcılarla işletmeleri bir araya getiren pazaryeri. Portföyünü oluştur, ihtiyacın olan ustayı bul.'

function metaAyarla(secici, olustur, deger) {
    let el = document.head.querySelector(secici)
    if (!el) {
        el = olustur()
        document.head.appendChild(el)
    }
    const onceki = el.getAttribute(el.tagName === 'LINK' ? 'href' : 'content')
    el.setAttribute(el.tagName === 'LINK' ? 'href' : 'content', deger)
    return onceki
}

const meta = (ad, ozellik = false) => () => {
    const el = document.createElement('meta')
    el.setAttribute(ozellik ? 'property' : 'name', ad)
    return el
}

// Sayfa başlığı, açıklaması ve kanonik adresi. Paylaşım önizlemeleri ve arama sonuçları
// bu bilgileri okur. Sayfadan çıkınca önceki değerler geri yüklenir.
function useSayfaBasligi(baslik, aciklama) {
    useEffect(() => {
        const tamBaslik = baslik ? `${baslik} — Kalfahane` : VARSAYILAN_BASLIK
        const metin = aciklama || VARSAYILAN_ACIKLAMA
        const adres = SITE + window.location.pathname

        const eskiBaslik = document.title
        document.title = tamBaslik
        const eskiler = [
            ['meta[name="description"]', metaAyarla('meta[name="description"]', meta('description'), metin)],
            ['meta[property="og:title"]', metaAyarla('meta[property="og:title"]', meta('og:title', true), tamBaslik)],
            ['meta[property="og:description"]', metaAyarla('meta[property="og:description"]', meta('og:description', true), metin)],
            ['meta[property="og:url"]', metaAyarla('meta[property="og:url"]', meta('og:url', true), adres)],
            [
                'link[rel="canonical"]',
                metaAyarla(
                    'link[rel="canonical"]',
                    () => Object.assign(document.createElement('link'), { rel: 'canonical' }),
                    adres
                ),
            ],
        ]
        return () => {
            document.title = eskiBaslik
            for (const [secici, deger] of eskiler) {
                const el = document.head.querySelector(secici)
                if (el && deger != null) el.setAttribute(el.tagName === 'LINK' ? 'href' : 'content', deger)
            }
        }
    }, [baslik, aciklama])
}

export default useSayfaBasligi
