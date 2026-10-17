// Blog içeriği düz metin olarak yazılır; birkaç basit işaret biçime dönüşür:
//   "## Başlık" ara başlık, "### Başlık" küçük başlık, "- madde" liste,
//   "1. madde" numaralı liste, "> alıntı" alıntı, boş satır yeni paragraf,
//   **kalın** vurgu, http(s) bağlantıları tıklanabilir.
// Çıktı React öğeleriyle kurulur; ham HTML yorumlanmaz.

export function bloklaraAyir(metin) {
    const satirlar = (metin || '').replace(/\r\n?/g, '\n').split('\n')
    const bloklar = []
    let paragraf = []
    let liste = null

    const paragrafiKapat = () => {
        if (paragraf.length) bloklar.push({ tur: 'p', satirlar: paragraf })
        paragraf = []
    }
    const listeyiKapat = () => {
        if (liste) bloklar.push(liste)
        liste = null
    }

    for (const ham of satirlar) {
        const satir = ham.trimEnd()
        const bos = satir.trim() === ''
        const madde = satir.match(/^\s*[-*•]\s+(.*)$/)
        const sirali = satir.match(/^\s*\d+[.)]\s+(.*)$/)

        if (bos) {
            paragrafiKapat()
            listeyiKapat()
        } else if (/^###\s+/.test(satir)) {
            paragrafiKapat()
            listeyiKapat()
            bloklar.push({ tur: 'h3', metin: satir.replace(/^###\s+/, '') })
        } else if (/^##\s+/.test(satir)) {
            paragrafiKapat()
            listeyiKapat()
            bloklar.push({ tur: 'h2', metin: satir.replace(/^##\s+/, '') })
        } else if (/^>\s?/.test(satir)) {
            paragrafiKapat()
            listeyiKapat()
            const onceki = bloklar[bloklar.length - 1]
            const icerik = satir.replace(/^>\s?/, '')
            if (onceki?.tur === 'alinti') onceki.satirlar.push(icerik)
            else bloklar.push({ tur: 'alinti', satirlar: [icerik] })
        } else if (madde || sirali) {
            paragrafiKapat()
            const tur = madde ? 'ul' : 'ol'
            if (liste && liste.tur !== tur) listeyiKapat()
            if (!liste) liste = { tur, maddeler: [] }
            liste.maddeler.push((madde || sirali)[1])
        } else {
            listeyiKapat()
            paragraf.push(satir)
        }
    }
    paragrafiKapat()
    listeyiKapat()
    return bloklar
}

export function okumaSuresi(metin) {
    const kelime = (metin || '').trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.round(kelime / 200))
}

export function basliktanKimlik(metin) {
    return metin
        .toLocaleLowerCase('tr-TR')
        .replace(/[çğıöşü]/g, (h) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[h])
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}
