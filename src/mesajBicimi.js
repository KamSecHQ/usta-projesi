// Mesajlaşmanın saf yardımcıları: zaman ve para biçimleri, iletişim kartı doğrulaması.
// Ağa, Supabase'e ya da React'a bağımlı değildir; birim testleri bu dosyayı doğrudan çalıştırır.
// Uygulama kodu bunları src/mesajlasma.js üzerinden içe aktarır.

export function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return '?'
    return adSoyad.split(' ').filter(Boolean).slice(0, 2).map((k) => k[0].toLocaleUpperCase('tr-TR')).join('')
}

// --- Güvenli bağlantı ve biçim yardımcıları -------------------------------

// Kullanıcı girdisinden yalnızca http(s) bağlantılarına izin ver
export function guvenliUrl(deger) {
    if (typeof deger !== 'string' || !deger.trim()) return ''
    const ham = deger.trim()
    try {
        const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(ham) ? ham : `https://${ham}`)
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : ''
    } catch {
        return ''
    }
}

export function epostaGecerli(deger) {
    return typeof deger === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deger.trim())
}

export function tutarGoster(tutar) {
    if (tutar === null || tutar === undefined || tutar === '') return ''
    const sayi = Number(tutar)
    return Number.isFinite(sayi) ? `₺${sayi.toLocaleString('tr-TR')}` : ''
}

// --- Zaman biçimleri -------------------------------------------------------

const GUN = 24 * 60 * 60 * 1000

function gunBasi(t) {
    const d = new Date(t)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
}

export function ayniGun(a, b) {
    return gunBasi(a) === gunBasi(b)
}

export function saatGoster(t) {
    return new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

// Konuşma listesi: "14:32", "Dün", "Pzt", "12 Eki"
export function kisaZaman(t) {
    if (!t) return ''
    const fark = Math.round((gunBasi(Date.now()) - gunBasi(t)) / GUN)
    if (fark <= 0) return saatGoster(t)
    if (fark === 1) return 'Dün'
    if (fark < 7) return new Date(t).toLocaleDateString('tr-TR', { weekday: 'short' })
    const d = new Date(t)
    const buYil = d.getFullYear() === new Date().getFullYear()
    return d.toLocaleDateString('tr-TR', buYil ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: '2-digit' })
}

// Sohbetteki gün ayracı: "Bugün", "Dün", "Perşembe", "12 Ekim 2025"
export function gunEtiketi(t) {
    const fark = Math.round((gunBasi(Date.now()) - gunBasi(t)) / GUN)
    if (fark <= 0) return 'Bugün'
    if (fark === 1) return 'Dün'
    if (fark < 7) return new Date(t).toLocaleDateString('tr-TR', { weekday: 'long' })
    const d = new Date(t)
    const buYil = d.getFullYear() === new Date().getFullYear()
    return d.toLocaleDateString('tr-TR', buYil ? { day: 'numeric', month: 'long' } : { day: 'numeric', month: 'long', year: 'numeric' })
}

export function sonGorulmeMetni(t) {
    if (!t) return 'Henüz çevrimiçi olmadı'
    const dk = Math.floor((Date.now() - new Date(t).getTime()) / 60000)
    if (dk < 6) return 'Çevrimiçi'
    if (dk < 60) return `${dk} dk önce görüldü`
    const sa = Math.floor(dk / 60)
    if (sa < 24) return `${sa} sa önce görüldü`
    return `${kisaZaman(t)} görüldü`
}
