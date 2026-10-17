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

// Saf biçim ve doğrulama yardımcıları ayrı modülde (ağa ve React'a bağımlı değil, testlerde
// doğrudan içe aktarılır); burada aynen dışa aktarılır, mevcut içe aktarmalar değişmez.
export * from './mesajBicimi.js'

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
