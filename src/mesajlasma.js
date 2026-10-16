import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

// Kalfahane mesajlaşma yardımcıları. Ödeme sistemi olmadığı için taraflar
// burada buluşup anlaşmayı ve ödemeyi kendi aralarında netleştirir.

export const MESAJ_SINIRI = 4000
export const TEPKILER = ['👍', '❤️', '🙌', '✅', '😂', '🔥']
export const OKUNDU_OLAYI = 'kalfahane:okundu'

export async function konusmaBaslat(karsiId, ilanId = null) {
    const { data, error } = await supabase.rpc('konusma_baslat', { p_karsi: karsiId, p_ilan: ilanId })
    if (error) throw error
    return data
}

export async function teklifKonusmasiAc(teklifId) {
    const { data, error } = await supabase.rpc('teklif_konusmasi_ac', { p_teklif: teklifId })
    if (error) throw error
    return data
}

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

// --- Realtime kanalları -----------------------------------------------------
// Aynı adlı kanal kapanırken yeniden açılırsa (StrictMode, hızlı sayfa geçişi)
// supabase kapanmakta olan eski örneği döndürür. Kapanışı bekleyip temiz bir
// kanal açıyoruz. Kullanım: useEffect(() => kanalAc(ad, (k) => k.on(...)), [ad])
const kapanislar = new Map()

export function kanalAc(ad, kur, { ayarlar, abone } = {}) {
    let kanal = null
    let iptal = false
    const bekle = kapanislar.get(ad) || Promise.resolve()
    bekle.then(() => {
        if (iptal) return
        const k = kur(supabase.channel(ad, ayarlar))
        kanal = k
        k.subscribe((durum) => abone?.(durum, k))
    })
    const kapat = () => {
        iptal = true
        if (!kanal) return
        const giden = kanal
        kanal = null
        const p = supabase.removeChannel(giden).catch(() => {}).finally(() => {
            if (kapanislar.get(ad) === p) kapanislar.delete(ad)
        })
        kapanislar.set(ad, p)
    }
    kapat.kanal = () => kanal
    return kapat
}

// --- Bildirim sesi ----------------------------------------------------------
// Dosya indirmeden, Web Audio ile kısa ve yumuşak iki notalı bir sinyal.
let sesBaglami = null
export function bildirimSesi() {
    try {
        sesBaglami ||= new (window.AudioContext || window.webkitAudioContext)()
        const ctx = sesBaglami
        if (ctx.state === 'suspended') ctx.resume()
        const t = ctx.currentTime
        ;[[880, 0], [1320, 0.09]].forEach(([frekans, gecikme]) => {
            const osc = ctx.createOscillator()
            const kazanc = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.value = frekans
            kazanc.gain.setValueAtTime(0.0001, t + gecikme)
            kazanc.gain.exponentialRampToValueAtTime(0.07, t + gecikme + 0.02)
            kazanc.gain.exponentialRampToValueAtTime(0.0001, t + gecikme + 0.32)
            osc.connect(kazanc).connect(ctx.destination)
            osc.start(t + gecikme)
            osc.stop(t + gecikme + 0.35)
        })
    } catch {
        // Ses çalınamazsa sessiz geç
    }
}

// --- Okunmamış sayısı (navbar rozeti + anlık bildirim) ----------------------

export function useOkunmamis(kullaniciId) {
    const [sayilar, setSayilar] = useState({})
    const [gelen, setGelen] = useState(null)

    useEffect(() => {
        if (!kullaniciId) {
            setSayilar({})
            return
        }
        let iptal = false
        let zamanlayici
        async function getir() {
            const { data } = await supabase.rpc('okunmamis_sayilari')
            if (!iptal && data) setSayilar(Object.fromEntries(data.map((r) => [r.konusma_id, r.sayi])))
        }
        const geciktir = () => {
            clearTimeout(zamanlayici)
            zamanlayici = setTimeout(getir, 300)
        }
        getir()

        const kapat = kanalAc(`okunmamis-${kullaniciId}`, (k) =>
            k
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mesajlar' }, (p) => {
                    geciktir()
                    if (p.new.gonderen_id !== kullaniciId) setGelen({ ...p.new, alindi: Date.now() })
                })
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'konusma_durumu', filter: `kullanici_id=eq.${kullaniciId}` }, geciktir)
        )
        window.addEventListener(OKUNDU_OLAYI, geciktir)
        // Sekmeye geri dönünce tazele (realtime arka planda kopmuş olabilir)
        const gorunur = () => document.visibilityState === 'visible' && geciktir()
        document.addEventListener('visibilitychange', gorunur)

        return () => {
            iptal = true
            clearTimeout(zamanlayici)
            kapat()
            window.removeEventListener(OKUNDU_OLAYI, geciktir)
            document.removeEventListener('visibilitychange', gorunur)
        }
    }, [kullaniciId])

    const toplam = Object.values(sayilar).reduce((a, b) => a + b, 0)
    return { toplam, sayilar, gelen }
}
