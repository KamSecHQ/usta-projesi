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

const DIL_RENKLERI = {
    javascript: '#F1E05A', typescript: '#3178C6', react: '#61DAFB',
    'react.js': '#61DAFB', 'react native': '#61DAFB', node: '#3C873A',
    'node.js': '#3C873A', python: '#3572A5', php: '#4F5D95',
    java: '#B07219', css: '#563D7C', html: '#E34C26',
    vue: '#41B883', 'vue.js': '#41B883', go: '#00ADD8', golang: '#00ADD8',
    ruby: '#701516', 'c#': '#178600', swift: '#FFAC45', kotlin: '#A97BFF',
    rust: '#DEA584', postgresql: '#336791', sql: '#336791', mongodb: '#4DB33D',
    tailwind: '#38BDF8', 'tailwind css': '#38BDF8', 'next.js': '#F3ECE1',
    next: '#F3ECE1', docker: '#2496ED', aws: '#FF9900', flutter: '#02569B',
    supabase: '#3ECF8E', firebase: '#FFCA28',
}

export function dilRengi(isim) {
    const anahtar = (isim || '').toLowerCase().trim()
    if (DIL_RENKLERI[anahtar]) return DIL_RENKLERI[anahtar]
    let hash = 0
    for (let i = 0; i < anahtar.length; i++) hash = anahtar.charCodeAt(i) + ((hash << 5) - hash)
    return `hsl(${Math.abs(hash) % 360}, 55%, 55%)`
}

export function zamanFarki(tarihStr) {
    if (!tarihStr) return ""
    const farkMs = new Date() - new Date(tarihStr)
    const gun = Math.floor(farkMs / (1000 * 60 * 60 * 24))
    if (gun <= 0) return "bugün"
    if (gun === 1) return "dün"
    if (gun < 30) return `${gun} gün önce`
    const ay = Math.floor(gun / 30)
    if (ay < 12) return `${ay} ay önce`
    return `${Math.floor(ay / 12)} yıl önce`
}
