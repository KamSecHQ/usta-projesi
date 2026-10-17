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

// Türk lirası, binlik ayraçla: 12500 → "₺12.500"
export function tl(tutar) {
    return `₺${Number(tutar).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`
}

export function ucretAraligiGoster(min, max) {
    if (!min && !max) return null
    if (min && max) return `${tl(min)} – ${tl(max)} / saat`
    if (min) return `${tl(min)}+ / saat`
    return `En çok ${tl(max)} / saat`
}

// İlan bütçesi (toplam iş bedeli)
export function butceGoster(min, max) {
    if (!min && !max) return null
    if (min && max) return min === max ? tl(min) : `${tl(min)} – ${tl(max)}`
    if (min) return `${tl(min)}+`
    return `En çok ${tl(max)}`
}

// YouTube ya da Loom linkini iframe embed adresine çevirir.
// Desteklenmeyen bir link ise null döner (o zaman düz link olarak gösterilir).
export function videoEmbedUrl(url) {
    if (!url) return null
    try {
        const u = new URL(url)
        if (u.hostname.includes('youtube.com')) {
            const id = u.searchParams.get('v')
            return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
        }
        if (u.hostname === 'youtu.be') {
            const id = u.pathname.slice(1)
            return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
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
// KIDEM ROZETİ SİSTEMİ
// Tamamen gerçek veriye dayalı: sahte bir sayı değil, ilanlar/teklifler
// tablolarındaki "tamamlandı" durumundaki gerçek iş birliği sayısı üzerinden
// hesaplanır. Usta ↔ Kalfa ↔ Çırak hiyerarşisi markanın hikayesiyle örtüşüyor.

const KIDEM_ROZETLERI_YAZILIMCI = [
    { min: 10, etiket: 'Kıdemli Usta', renk: '#FFD76A' },
    { min: 3, etiket: 'Usta', renk: '#C97D3C' },
    { min: 1, etiket: 'Kalfa', renk: '#E3B776' },
    { min: 0, etiket: 'Çırak', renk: '#9CA3AF' },
]

const KIDEM_ROZETLERI_ISVEREN = [
    { min: 5, etiket: 'Kıdemli İş Veren', renk: '#FFD76A' },
    { min: 1, etiket: 'Güvenilir İş Veren', renk: '#E3B776' },
    { min: 0, etiket: 'Yeni İş Veren', renk: '#9CA3AF' },
]

export function kidemRozetiHesapla(rol, tamamlananSayisi) {
    const liste = rol === 'is-veren' ? KIDEM_ROZETLERI_ISVEREN : KIDEM_ROZETLERI_YAZILIMCI
    return liste.find((r) => tamamlananSayisi >= r.min) || liste[liste.length - 1]
}
// Bir sonraki kıdem rozetine kaç tamamlanmış iş kaldığını hesaplar.
// Zaten en üst seviyedeyse null döner.
export function sonrakiKidemHesapla(rol, tamamlananSayisi) {
    const liste = rol === 'is-veren' ? KIDEM_ROZETLERI_ISVEREN : KIDEM_ROZETLERI_YAZILIMCI
    const artanSirali = [...liste].sort((a, b) => a.min - b.min)
    for (const seviye of artanSirali) {
        if (tamamlananSayisi < seviye.min) {
            return { etiket: seviye.etiket, kalan: seviye.min - tamamlananSayisi, renk: seviye.renk }
        }
    }
    return null
}


// Tamamlanan iş birliği sayısı herkese açık veritabanı fonksiyonundan gelir
// (tamamlanan_is_sayilari, faz 69). Teklifleri yalnızca taraflar okuyabildiği için
// istemcide hesaplanınca ziyaretçi herkesi "Çırak" görüyordu.
// Tamamlanan iş = kabul edilmiş teklifi olan ve ilanı "tamamlandı" olan iş birliği
// (yazılımcı için kabul edilen teklifleri, iş veren için kabul ettiği teklifli ilanları).
// Dönüş: { [kullaniciId]: sayi }. Tek çağrıda en fazla 200 kişi.
export async function tamamlananIsSayilariGetir(supabase, idler) {
    const benzersiz = [...new Set((idler || []).filter(Boolean))].slice(0, 200)
    if (!benzersiz.length) return {}
    const { data, error } = await supabase.rpc('tamamlanan_is_sayilari', { p_kullanicilar: benzersiz })
    if (error || !data) return {}
    return Object.fromEntries(data.map((r) => [r.kullanici_id, r.sayi]))
}

export async function tamamlananIsSayisiGetir(supabase, kullaniciId) {
    const sayilar = await tamamlananIsSayilariGetir(supabase, [kullaniciId])
    return sayilar[kullaniciId] || 0
}
// Blog başlığından URL-dostu bir slug üretir (Türkçe karakterleri de dönüştürür).
export function slugOlustur(metin) {
    const turkceHaritasi = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i', Ç: 'c', Ğ: 'g', Ö: 'o', Ş: 's', Ü: 'u' }
    return metin
        .split('').map((h) => turkceHaritasi[h] || h).join('')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

// Arama için katlama: büyük/küçük harf ve Türkçe harf farkları (İ/I/ı/i, ş/s, ğ/g, ü/u, ö/o, ç/c)
// yok sayılır. "ios", "İOS" ve "IOS" aynı sonucu bulur.
const KATLAMA = { ı: 'i', ş: 's', ğ: 'g', ü: 'u', ö: 'o', ç: 'c', â: 'a', î: 'i', û: 'u' }
export function aramaIcinKatla(metin) {
    return (metin || '').toLocaleLowerCase('tr-TR').replace(/[ışğüöçâîû]/g, (h) => KATLAMA[h])
}

// Listelerdeki en sık etiketler (teknolojiler): filtre çipleri gerçek veriden gelir.
// Yazımı farklı aynı etiketler ("React", "react") tek çipte toplanır; en sık yazım gösterilir.
export function sikEtiketler(diziler, adet = 10) {
    const sayac = new Map()
    for (const dizi of diziler) {
        for (const ham of new Set(dizi || [])) {
            const ad = String(ham).trim()
            const anahtar = aramaIcinKatla(ad)
            if (!anahtar) continue
            const kayit = sayac.get(anahtar) || { ad, sayi: 0 }
            kayit.sayi++
            sayac.set(anahtar, kayit)
        }
    }
    return [...sayac.values()].sort((a, b) => b.sayi - a.sayi || a.ad.localeCompare(b.ad, 'tr')).slice(0, adet)
}

// İlanın istediği teknolojilerden kaçı ustanın teknolojilerinde var (yazım farkları yok sayılır)
export function teknolojiUyumu(istenen, bilinen) {
    const ilan = [...new Set((istenen || []).map(aramaIcinKatla).filter(Boolean))]
    const usta = new Set((bilinen || []).map(aramaIcinKatla))
    const eslesen = ilan.filter((t) => usta.has(t)).length
    return { eslesen, toplam: ilan.length }
}

// Bir tutarın ilan bütçesine göre yeri: { metin: "Aralıkta" | "%12 altında" | "%20 üstünde", yon: -1 | 0 | 1 }
export function butceyeGore(tutar, min, max) {
    if (!tutar || (!min && !max)) return null
    if (min && tutar < min) return { metin: `%${Math.round(((min - tutar) / min) * 100)} altında`, yon: -1 }
    if (max && tutar > max) return { metin: `%${Math.round(((tutar - max) / max) * 100)} üstünde`, yon: 1 }
    return { metin: 'Aralıkta', yon: 0 }
}
