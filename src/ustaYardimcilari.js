export function cevrimiciMi(sonGorulme) {
    if (!sonGorulme) return false
    const farkDk = (new Date() - new Date(sonGorulme)) / 1000 / 60
    return farkDk < 6
}

export const MUSAITLIK_BILGISI = {
    musait: { renk: '#4ADE80', etiket: 'Müsait' },
    kismi_musait: { renk: '#E3B776', etiket: 'Kısmi Müsait' },
    musait_degil: { renk: '#9CA3AF', etiket: 'Müsait Değil' },
}

export function musaitlikBilgisi(durum) {
    return MUSAITLIK_BILGISI[durum] || MUSAITLIK_BILGISI.musait
}

export function ucretAraligiGoster(min, max) {
    if (!min && !max) return null
    if (min && max) return `₺${min} - ₺${max} / saat`
    if (min) return `₺${min}+ / saat`
    return `₺${max}'a kadar / saat`
}

// YouTube ya da Loom linkini iframe embed adresine çevirir.
// Desteklenmeyen bir link ise null döner (o zaman düz link olarak gösterilir).
export function videoEmbedUrl(url) {
    if (!url) return null
    try {
        const u = new URL(url)
        if (u.hostname.includes('youtube.com')) {
            const id = u.searchParams.get('v')
            return id ? `https://www.youtube.com/embed/${id}` : null
        }
        if (u.hostname === 'youtu.be') {
            const id = u.pathname.slice(1)
            return id ? `https://www.youtube.com/embed/${id}` : null
        }
        if (u.hostname.includes('loom.com')) {
            return url.replace('/share/', '/embed/')
        }
        return null
    } catch {
        return null
    }
}
