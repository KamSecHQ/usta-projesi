import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import { cevrimiciMi as sonGorulmedenCevrimici } from '../ustaYardimcilari'
import { OKUNDU_OLAYI, bildirimSesi, kanalAc } from '../mesajlasma'
import KonusmaListesi from '../components/mesaj/KonusmaListesi'
import Sohbet from '../components/mesaj/Sohbet'
import BaglamPaneli from '../components/mesaj/BaglamPaneli'
import Ikon from '../components/mesaj/Ikon'
import '../components/mesaj/mesaj.css'
import { mesajOnizlemesi } from './mesajOnizleme'
import GirisKapisi from '../components/hesap/GirisKapisi'

const PROFIL = 'id, ad_soyad, unvan, rol, avatar_url, son_gorulme, konum, musaitlik'
const KONUSMA_SORGUSU = `id, katilimci_1, katilimci_2, ilan_id, teklif_id, son_mesaj_at, son_mesaj_onizleme, son_gonderen_id, created_at,
    k1:profiller!konusmalar_katilimci_1_fkey(${PROFIL}),
    k2:profiller!konusmalar_katilimci_2_fkey(${PROFIL}),
    ilan:ilanlar!konusmalar_ilan_id_fkey(id, baslik, durum, butce_min, butce_max),
    teklif:teklifler!konusmalar_teklif_id_fkey(id, teklif_tutari, durum, mesaj),
    durumlar:konusma_durumu(kullanici_id, son_okuma, sabitlendi, arsivlendi, sessiz)`
const MESAJ_SORGUSU = '*, mesaj_tepkileri(kullanici_id, emoji)'
const SAYFA = 50
const BOS_DURUM = { son_okuma: null, sabitlendi: false, arsivlendi: false, sessiz: false }
const PANEL_ANAHTARI = 'kalfahane:mesaj-paneli'

const DURUM_BILDIRIMI = {
    sabitlendi: { true: 'Konuşma sabitlendi', false: 'Sabitleme kaldırıldı' },
    sessiz: { true: 'Bu konuşma sessize alındı', false: 'Bildirimler açıldı' },
    arsivlendi: { true: 'Konuşma arşivlendi', false: 'Arşivden çıkarıldı' },
}

function hazirla(k, benId) {
    const benBirinci = k.katilimci_1 === benId
    const durumlar = k.durumlar || []
    return {
        ...k,
        karsiId: benBirinci ? k.katilimci_2 : k.katilimci_1,
        karsi: benBirinci ? k.k2 : k.k1,
        ben: { ...BOS_DURUM, ...durumlar.find((d) => d.kullanici_id === benId) },
        karsiDurum: durumlar.find((d) => d.kullanici_id !== benId) || null,
    }
}

function mesajHazirla(m) {
    const { mesaj_tepkileri, ...geri } = m
    return { ...geri, tepkiler: mesaj_tepkileri ?? geri.tepkiler ?? [] }
}

function zamanSirala(liste) {
    return [...liste].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
}

// Aynı mesaj ikinci kez gelirse (realtime + insert yanıtı) yerinde güncelle
function siraliEkle(liste, m) {
    if (liste.some((x) => x.id === m.id)) {
        return liste.map((x) => (x.id === m.id ? { ...m, tepkiler: m.silindi ? [] : x.tepkiler } : x))
    }
    const son = liste[liste.length - 1]
    const yeni = [...liste, m]
    return son && new Date(m.created_at) < new Date(son.created_at) ? zamanSirala(yeni) : yeni
}

function birlestir(yuklenen, mevcut) {
    const idler = new Set(yuklenen.map((m) => m.id))
    return zamanSirala([...yuklenen, ...mevcut.filter((m) => !idler.has(m.id))])
}

function anahtarSil(nesne, anahtar) {
    if (!(anahtar in nesne)) return nesne
    const kopya = { ...nesne }
    delete kopya[anahtar]
    return kopya
}

function enGec(a, b) {
    if (!a) return b
    if (!b) return a
    return new Date(a) >= new Date(b) ? a : b
}

function useMedya(sorgu) {
    const [eslesir, setEslesir] = useState(() => window.matchMedia(sorgu).matches)
    useEffect(() => {
        const mq = window.matchMedia(sorgu)
        const degisti = () => setEslesir(mq.matches)
        mq.addEventListener('change', degisti)
        return () => mq.removeEventListener('change', degisti)
    }, [sorgu])
    return eslesir
}

function BosSahne({ rol }) {
    const isVeren = rol === 'is-veren'
    return (
        <div className="msj-sahne flex-1 flex items-center justify-center px-8">
            <div className="max-w-[520px] text-center flex flex-col items-center">
                <div className="relative w-[176px] h-[176px]" aria-hidden="true">
                    <span className="absolute inset-0 rounded-full border border-white/[0.07]" />
                    <span className="absolute inset-[28px] rounded-full border border-white/[0.09]" />
                    <span className="msj-yorunge absolute inset-0">
                        <span className="absolute -top-1 left-1/2 -ml-1 w-2 h-2 rounded-full bg-[#C4B5FD] shadow-[0_0_14px_3px_rgba(167,139,250,0.7)]" />
                    </span>
                    <span className="msj-yorunge-ters absolute inset-[28px]">
                        <span className="absolute top-1/2 -right-[3px] -mt-[3px] w-1.5 h-1.5 rounded-full bg-[#86EFAC] shadow-[0_0_12px_2px_rgba(74,222,128,0.6)]" />
                    </span>
                    <span className="absolute inset-[56px] rounded-[22px] flex items-center justify-center bg-gradient-to-b from-white/[0.1] to-white/[0.03] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_18px_40px_-16px_rgba(139,92,246,0.9)] text-[#DDD6FE]">
                        <Ikon ad="mesaj" className="w-7 h-7" kalinlik={1.4} />
                    </span>
                </div>
                <h2 className="mt-8 text-[30px] leading-[1.1] font-extrabold tracking-[-0.035em] text-balance">Konuşmalar burada buluşur</h2>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[#A1A1AA] text-pretty">
                    Soldan bir konuşma seç ya da yeni birini başlat. Kalfahane şimdilik ödemeye aracılık etmiyor: sizi buluşturur, anlaşmayı burada yazılı netleştirirsiniz, ödemeyi kendi aranızda yaparsınız.
                </p>
                <div className="mt-7 flex items-center gap-3 text-[13px] text-[#D4D4D8]">
                    {[['ara', 'Bul'], ['mesaj', 'Konuş'], ['anlasma', 'Anlaş']].map(([ikon, ad], i) => (
                        <Fragment key={ad}>
                            {i > 0 && <span className="w-8 h-px bg-gradient-to-r from-white/[0.05] via-white/25 to-white/[0.05]" />}
                            <span className="inline-flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full border border-white/[0.1] bg-white/[0.04] flex items-center justify-center text-[#C4B5FD]">
                                    <Ikon ad={ikon} className="w-4 h-4" />
                                </span>
                                {ad}
                            </span>
                        </Fragment>
                    ))}
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                    <Link to={isVeren ? '/ustalar' : '/is-ilanlari'} className="isik isik-birincil inline-flex items-center rounded-full h-10 px-5 text-sm font-semibold">
                        {isVeren ? 'Usta bul' : 'İş ilanlarına bak'}
                    </Link>
                    <Link to={isVeren ? '/ilanlarim' : '/tekliflerim'} className="isik isik-cam inline-flex items-center rounded-full h-10 px-5 text-sm">
                        {isVeren ? 'İlanlarım' : 'Tekliflerim'}
                    </Link>
                </div>
            </div>
        </div>
    )
}

function Mesajlar() {
    const { id: aktifId } = useParams()
    const { user: gercekKullanici, yukleniyor: authYukleniyor } = useAuth()
    // Geliştirmede ?onizleme=yazilimci|is-veren ile örnek veriyle ekran görülebilir (canlıda yok)
    const [onizleme] = useState(() => (import.meta.env.DEV
        ? mesajOnizlemesi(new URLSearchParams(window.location.search).get('onizleme'))
        : null))
    const ornek = gercekKullanici ? null : onizleme
    const user = gercekKullanici || ornek?.user || null
    const benId = user?.id
    const ornekRef = useRef(ornek)
    ornekRef.current = ornek

    const [konusmalar, setKonusmalar] = useState([])
    const [listeYukleniyor, setListeYukleniyor] = useState(true)
    const [listeHata, setListeHata] = useState('')
    const [okunmamis, setOkunmamis] = useState({})
    const [benimProfil, setBenimProfil] = useState(null)
    const [akis, setAkis] = useState({ id: null, liste: [], yukleniyor: false, dahaVar: false, eskiYukleniyor: false })
    const [bulunamadi, setBulunamadi] = useState(false)
    const [yaziyor, setYaziyor] = useState({})
    const [cevrimiciler, setCevrimiciler] = useState(() => new Set())
    const [toast, setToast] = useState(null)
    const [iletisimIstegi, setIletisimIstegi] = useState(0)

    const genis = useMedya('(min-width: 1280px)')
    const [panelTercih, setPanelTercih] = useState(() => {
        try {
            return localStorage.getItem(PANEL_ANAHTARI) !== 'kapali'
        } catch {
            return true
        }
    })
    const [cekmece, setCekmece] = useState(false)
    const panelAcik = genis ? panelTercih : cekmece

    const kokRef = useRef(null)
    const [ust, setUst] = useState(0)
    const aktifRef = useRef(aktifId)
    const konusmalarRef = useRef(konusmalar)
    const akisRef = useRef(akis)
    const genisRef = useRef(genis)
    const yeniIdler = useRef(new Set())
    const yaziyorKanal = useRef(null)
    const yaziyorZaman = useRef({})
    const sonYaziyorBildirimi = useRef(0)
    aktifRef.current = aktifId
    konusmalarRef.current = konusmalar
    akisRef.current = akis
    genisRef.current = genis

    const aktif = konusmalar.find((k) => k.id === aktifId) || null
    const toplamOkunmamis = Object.values(okunmamis).reduce((a, b) => a + b, 0)
    useSayfaBasligi(toplamOkunmamis ? `(${toplamOkunmamis}) Mesajlar` : 'Mesajlar')

    // Sayfa, gezinme çubuğunun altında kalan tüm ekranı kaplar; pencere kaymaz.
    useLayoutEffect(() => {
        window.scrollTo(0, 0)
        const olc = () => {
            const el = kokRef.current
            if (el) setUst(Math.round(el.getBoundingClientRect().top + window.scrollY))
        }
        olc()
        window.addEventListener('resize', olc)
        const ro = new ResizeObserver(olc)
        const kok = document.getElementById('root')
        if (kok) ro.observe(kok)
        return () => {
            window.removeEventListener('resize', olc)
            ro.disconnect()
        }
    }, [])

    useEffect(() => {
        setCekmece(false)
    }, [aktifId])

    const bildir = useCallback((metin, hata = false) => setToast({ metin, hata, an: Date.now() }), [])
    useEffect(() => {
        if (!toast) return
        const t = setTimeout(() => setToast(null), 2600)
        return () => clearTimeout(t)
    }, [toast])

    // --- Veri --------------------------------------------------------------
    const sayilariUygula = useCallback((data) => {
        if (data) setOkunmamis(Object.fromEntries(data.map((r) => [r.konusma_id, r.sayi])))
    }, [])

    const listeyiGetir = useCallback(async () => {
        if (!benId) return
        if (ornekRef.current) {
            setKonusmalar(ornekRef.current.konusmalar.map((k) => hazirla(k, benId)))
            setOkunmamis(ornekRef.current.okunmamis)
            setListeYukleniyor(false)
            return
        }
        const [liste, sayilar] = await Promise.all([
            supabase.from('konusmalar').select(KONUSMA_SORGUSU).order('son_mesaj_at', { ascending: false }).limit(200),
            supabase.rpc('okunmamis_sayilari'),
        ])
        if (liste.error) {
            setListeHata('Konuşmalar yüklenemedi. Bağlantını kontrol edip tekrar dene.')
        } else {
            setListeHata('')
            setKonusmalar(liste.data.map((k) => hazirla(k, benId)))
        }
        sayilariUygula(sayilar.data)
        setListeYukleniyor(false)
    }, [benId, sayilariUygula])

    const sayilariTazele = useMemo(() => {
        let zamanlayici
        return () => {
            clearTimeout(zamanlayici)
            zamanlayici = setTimeout(async () => {
                if (ornekRef.current) return
                const { data } = await supabase.rpc('okunmamis_sayilari')
                sayilariUygula(data)
            }, 300)
        }
    }, [sayilariUygula])

    useEffect(() => {
        if (!benId) return
        listeyiGetir()
        if (ornekRef.current) {
            setBenimProfil(ornekRef.current.profil)
            return
        }
        Promise.all([
            supabase.from('profiller').select('id, ad_soyad, rol').eq('id', benId).single(),
            supabase.from('profil_iletisim').select('telefon').eq('id', benId).maybeSingle(),
        ]).then(([profil, iletisim]) => {
            if (profil.data) setBenimProfil({ ...profil.data, telefon: iletisim.data?.telefon || null })
        })
    }, [benId, listeyiGetir])

    // Listede olmayan konuşma (yeni açılmış ya da arşiv sınırı dışında)
    const aktifVar = Boolean(aktif)
    useEffect(() => {
        setBulunamadi(false)
        if (!benId || !aktifId || listeYukleniyor || aktifVar) return
        if (ornekRef.current) {
            setBulunamadi(true)
            return
        }
        let iptal = false
        supabase.from('konusmalar').select(KONUSMA_SORGUSU).eq('id', aktifId).maybeSingle().then(({ data }) => {
            if (iptal) return
            if (data) setKonusmalar((l) => (l.some((k) => k.id === data.id) ? l : [hazirla(data, benId), ...l]))
            else setBulunamadi(true)
        })
        return () => {
            iptal = true
        }
    }, [benId, aktifId, listeYukleniyor, aktifVar])

    // Aktif konuşmanın mesajları
    useEffect(() => {
        if (!benId || !aktifId) return
        let iptal = false
        yeniIdler.current = new Set()
        if (ornekRef.current) {
            const liste = (ornekRef.current.mesajlar[aktifId] || []).map(mesajHazirla)
            setAkis({ id: aktifId, liste, yukleniyor: false, dahaVar: false, eskiYukleniyor: false })
            return
        }
        setAkis({ id: aktifId, liste: [], yukleniyor: true, dahaVar: false, eskiYukleniyor: false })
        supabase.from('mesajlar').select(MESAJ_SORGUSU).eq('konusma_id', aktifId)
            .order('created_at', { ascending: false }).limit(SAYFA)
            .then(({ data, error }) => {
                if (iptal) return
                setAkis((a) => (a.id !== aktifId ? a : {
                    ...a,
                    yukleniyor: false,
                    liste: error ? a.liste : birlestir(data.map(mesajHazirla), a.liste),
                    dahaVar: !error && data.length === SAYFA,
                }))
            })
        return () => {
            iptal = true
        }
    }, [benId, aktifId])

    const eskileriGetir = useCallback(async () => {
        const a = akisRef.current
        if (!a.id || a.eskiYukleniyor || !a.dahaVar || !a.liste.length) return
        setAkis((x) => ({ ...x, eskiYukleniyor: true }))
        const enEski = (a.liste.find((m) => !m.gecici) || a.liste[0]).created_at
        const { data, error } = await supabase.from('mesajlar').select(MESAJ_SORGUSU).eq('konusma_id', a.id)
            .lt('created_at', enEski).order('created_at', { ascending: false }).limit(SAYFA)
        setAkis((x) => (x.id !== a.id ? x : {
            ...x,
            eskiYukleniyor: false,
            dahaVar: !error && data.length === SAYFA,
            liste: error ? x.liste : birlestir(data.map(mesajHazirla), x.liste),
        }))
    }, [])

    // Sekmeye dönünce: realtime arka planda kopmuş olabilir, son durumu çek
    useEffect(() => {
        if (!benId) return
        async function tazele() {
            if (document.visibilityState !== 'visible' || ornekRef.current) return
            listeyiGetir()
            const id = aktifRef.current
            if (!id) return
            const { data } = await supabase.from('mesajlar').select(MESAJ_SORGUSU).eq('konusma_id', id)
                .order('created_at', { ascending: false }).limit(SAYFA)
            if (data) setAkis((a) => (a.id === id ? { ...a, liste: birlestir(data.map(mesajHazirla), a.liste) } : a))
        }
        document.addEventListener('visibilitychange', tazele)
        return () => document.removeEventListener('visibilitychange', tazele)
    }, [benId, listeyiGetir])

    // --- Okundu --------------------------------------------------------------
    const okunduIsaretle = useCallback(async (konusmaId, zaman) => {
        const k = konusmalarRef.current.find((x) => x.id === konusmaId)
        if (!k || !zaman) return
        if (k.ben.son_okuma && new Date(k.ben.son_okuma) >= new Date(zaman)) return
        setKonusmalar((l) => l.map((x) => (x.id === konusmaId ? { ...x, ben: { ...x.ben, son_okuma: zaman } } : x)))
        setOkunmamis((o) => anahtarSil(o, konusmaId))
        if (ornekRef.current) return
        await supabase.from('konusma_durumu').upsert(
            { konusma_id: konusmaId, kullanici_id: benId, son_okuma: zaman },
            { onConflict: 'konusma_id,kullanici_id' }
        )
        window.dispatchEvent(new Event(OKUNDU_OLAYI))
    }, [benId])

    useEffect(() => {
        if (authYukleniyor || !aktifId || !aktifVar || akis.id !== aktifId || akis.yukleniyor) return
        let sonGercek = null
        for (let i = akis.liste.length - 1; i >= 0; i--) {
            if (!akis.liste[i].gecici) {
                sonGercek = akis.liste[i]
                break
            }
        }
        if (!sonGercek) return
        // Okuma zamanı sunucu saatinden alınır; istemci saatindeki kayma okundu bilgisini bozmasın
        const isaretle = () => document.visibilityState === 'visible' && okunduIsaretle(aktifId, sonGercek.created_at)
        isaretle()
        document.addEventListener('visibilitychange', isaretle)
        return () => document.removeEventListener('visibilitychange', isaretle)
    }, [authYukleniyor, aktifId, aktifVar, akis, okunduIsaretle])

    // --- Realtime: mesajlar, konuşmalar, okuma durumları, tepkiler ------------
    useEffect(() => {
        if (!benId || ornekRef.current) return

        function mesajOlayi(p) {
            if (p.eventType === 'INSERT') {
                const m = mesajHazirla(p.new)
                const gelen = m.gonderen_id !== benId
                if (gelen) {
                    yeniIdler.current.add(m.id)
                    setYaziyor((y) => anahtarSil(y, m.konusma_id))
                }
                setAkis((a) => (a.id === m.konusma_id ? { ...a, liste: siraliEkle(a.liste, m) } : a))
                const k = konusmalarRef.current.find((x) => x.id === m.konusma_id)
                if (!k) {
                    listeyiGetir()
                    return
                }
                setKonusmalar((l) => l.map((x) => (x.id !== m.konusma_id ? x : {
                    ...x,
                    son_mesaj_at: m.created_at,
                    son_mesaj_onizleme: m.tur === 'iletisim' ? 'İletişim bilgisi paylaşıldı' : m.icerik.slice(0, 160),
                    son_gonderen_id: m.gonderen_id,
                })))
                if (gelen) {
                    const goruyor = aktifRef.current === m.konusma_id && document.visibilityState === 'visible'
                    if (!goruyor) {
                        sayilariTazele()
                        if (!k.ben.sessiz) bildirimSesi()
                    }
                }
            } else if (p.eventType === 'UPDATE') {
                const m = mesajHazirla(p.new)
                setAkis((a) => (a.id === m.konusma_id && a.liste.some((x) => x.id === m.id)
                    ? { ...a, liste: siraliEkle(a.liste, m) }
                    : a))
            }
        }

        function konusmaOlayi(p) {
            if (p.eventType !== 'UPDATE') {
                if (p.eventType === 'INSERT') listeyiGetir()
                return
            }
            const y = p.new
            const k = konusmalarRef.current.find((x) => x.id === y.id)
            if (!k || y.teklif_id !== k.teklif_id || y.ilan_id !== k.ilan_id) {
                listeyiGetir()
                return
            }
            setKonusmalar((l) => l.map((x) => (x.id !== y.id ? x : {
                ...x,
                son_mesaj_at: y.son_mesaj_at,
                son_mesaj_onizleme: y.son_mesaj_onizleme,
                son_gonderen_id: y.son_gonderen_id,
            })))
        }

        function durumOlayi(p) {
            const d = p.new
            if (!d?.konusma_id) return
            setKonusmalar((l) => l.map((x) => {
                if (x.id !== d.konusma_id) return x
                if (d.kullanici_id === benId) return { ...x, ben: { ...x.ben, ...d, son_okuma: enGec(x.ben.son_okuma, d.son_okuma) } }
                return { ...x, karsiDurum: { ...d, son_okuma: enGec(x.karsiDurum?.son_okuma, d.son_okuma) } }
            }))
            if (d.kullanici_id === benId) sayilariTazele()
        }

        function tepkiOlayi(p) {
            if (p.eventType === 'INSERT') {
                const t = p.new
                setAkis((a) => (!a.liste.some((m) => m.id === t.mesaj_id) ? a : {
                    ...a,
                    liste: a.liste.map((m) => (m.id !== t.mesaj_id || m.tepkiler.some((r) => r.kullanici_id === t.kullanici_id && r.emoji === t.emoji)
                        ? m
                        : { ...m, tepkiler: [...m.tepkiler, { kullanici_id: t.kullanici_id, emoji: t.emoji }] })),
                }))
            } else if (p.eventType === 'DELETE') {
                const t = p.old
                if (!t?.mesaj_id) return
                setAkis((a) => (!a.liste.some((m) => m.id === t.mesaj_id) ? a : {
                    ...a,
                    liste: a.liste.map((m) => (m.id !== t.mesaj_id ? m : {
                        ...m,
                        tepkiler: m.tepkiler.filter((r) => !(r.kullanici_id === t.kullanici_id && r.emoji === t.emoji)),
                    })),
                }))
            }
        }

        return kanalAc(`mesajlar-sayfa-${benId}`, (k) => k
            .on('postgres_changes', { event: '*', schema: 'public', table: 'mesajlar' }, mesajOlayi)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'konusmalar' }, konusmaOlayi)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'konusma_durumu' }, durumOlayi)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'mesaj_tepkileri' }, tepkiOlayi))
    }, [benId, listeyiGetir, sayilariTazele])

    // Yazıyor sinyali: konuşmaya özel yayın kanalı
    useEffect(() => {
        if (!benId || !aktifId || ornekRef.current) return
        const konusmaId = aktifId
        const zamanlar = yaziyorZaman.current
        const kapat = kanalAc(`yaziyor-${konusmaId}`, (k) => k.on('broadcast', { event: 'yaziyor' }, ({ payload }) => {
            if (!payload?.id || payload.id === benId) return
            setYaziyor((y) => (y[konusmaId] ? y : { ...y, [konusmaId]: true }))
            clearTimeout(zamanlar[konusmaId])
            zamanlar[konusmaId] = setTimeout(() => setYaziyor((y) => anahtarSil(y, konusmaId)), 4000)
        }))
        yaziyorKanal.current = kapat
        return () => {
            kapat()
            clearTimeout(zamanlar[konusmaId])
            yaziyorKanal.current = null
            setYaziyor((y) => anahtarSil(y, konusmaId))
        }
    }, [benId, aktifId])

    const yaziyorBildir = useCallback(() => {
        const simdi = Date.now()
        if (simdi - sonYaziyorBildirimi.current < 2500) return
        sonYaziyorBildirimi.current = simdi
        const kanal = yaziyorKanal.current?.kanal()
        if (kanal?.state === 'joined') kanal.send({ type: 'broadcast', event: 'yaziyor', payload: { id: benId } })
    }, [benId])

    // Çevrimiçi göstergesi: anlık presence + son görülme nabzı
    useEffect(() => {
        if (!benId) return
        if (ornekRef.current) {
            setCevrimiciler(new Set(ornekRef.current.cevrimici))
            return
        }
        return kanalAc('kalfahane-cevrimici', (k) => k.on('presence', { event: 'sync' }, () => {
            setCevrimiciler(new Set(Object.keys(k.presenceState())))
        }), {
            ayarlar: { config: { presence: { key: benId } } },
            abone: (durum, k) => {
                if (durum === 'SUBSCRIBED') k.track({ at: Date.now() })
            },
        })
    }, [benId])

    const cevrimiciMi = useCallback(
        (p) => Boolean(p && (cevrimiciler.has(p.id) || sonGorulmedenCevrimici(p.son_gorulme))),
        [cevrimiciler]
    )

    // --- Eylemler --------------------------------------------------------------
    // Örnek modda karşı tarafı canlandırır: okur, yazar, yanıtlar
    const ornekGonder = useCallback((konusmaId, geciciId, tur, icerik) => {
        const o = ornekRef.current
        const zaman = new Date().toISOString()
        setTimeout(() => {
            setAkis((a) => ({ ...a, liste: a.liste.map((m) => (m.id === geciciId ? { ...m, gecici: undefined, created_at: zaman } : m)) }))
            setKonusmalar((l) => l.map((k) => (k.id !== konusmaId ? k : {
                ...k,
                son_mesaj_at: zaman,
                son_mesaj_onizleme: tur === 'iletisim' ? 'İletişim bilgisi paylaşıldı' : icerik.slice(0, 160),
                son_gonderen_id: benId,
            })))
        }, 350)
        const karsi = konusmalarRef.current.find((k) => k.id === konusmaId)
        if (!karsi) return
        setTimeout(() => {
            setKonusmalar((l) => l.map((k) => (k.id === konusmaId ? { ...k, karsiDurum: { ...k.karsiDurum, son_okuma: new Date().toISOString() } } : k)))
            setYaziyor((y) => ({ ...y, [konusmaId]: true }))
        }, 1200)
        setTimeout(() => {
            const yanit = o.otomatikYanitlar[Math.floor(Math.random() * o.otomatikYanitlar.length)]
            const id = `ornek-${Date.now()}`
            const m = { id, konusma_id: konusmaId, gonderen_id: karsi.karsiId, tur: 'metin', icerik: yanit, ek: null, silindi: false, created_at: new Date().toISOString(), tepkiler: [] }
            yeniIdler.current.add(id)
            setYaziyor((y) => anahtarSil(y, konusmaId))
            setAkis((a) => (a.id === konusmaId ? { ...a, liste: siraliEkle(a.liste, m) } : a))
            setKonusmalar((l) => l.map((k) => (k.id !== konusmaId ? k : { ...k, son_mesaj_at: m.created_at, son_mesaj_onizleme: yanit, son_gonderen_id: karsi.karsiId })))
            if (aktifRef.current !== konusmaId) setOkunmamis((u) => ({ ...u, [konusmaId]: (u[konusmaId] || 0) + 1 }))
        }, 3600)
    }, [benId])

    const gonder = useCallback(async ({ tur = 'metin', icerik = '', ek = null }) => {
        const konusmaId = aktifRef.current
        if (!konusmaId || !benId) return
        const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : null
        const geciciId = uuid || `gecici-${Date.now()}`
        const gecici = {
            id: geciciId, konusma_id: konusmaId, gonderen_id: benId, tur, icerik, ek,
            silindi: false, created_at: new Date().toISOString(), tepkiler: [], gecici: 'gidiyor',
        }
        yeniIdler.current.add(geciciId)
        setAkis((a) => (a.id === konusmaId ? { ...a, liste: [...a.liste, gecici] } : a))

        if (ornekRef.current) {
            ornekGonder(konusmaId, geciciId, tur, icerik)
            return
        }

        const satir = { konusma_id: konusmaId, tur, icerik, ek }
        if (uuid) satir.id = uuid
        const { data, error } = await supabase.from('mesajlar').insert(satir).select('*').single()
        if (error) {
            setAkis((a) => (a.id === konusmaId
                ? { ...a, liste: a.liste.map((m) => (m.id === geciciId ? { ...m, gecici: 'hata' } : m)) }
                : a))
            return
        }
        yeniIdler.current.add(data.id)
        setAkis((a) => (a.id === konusmaId
            ? { ...a, liste: siraliEkle(a.liste.filter((m) => m.id !== geciciId || m.id === data.id), mesajHazirla(data)) }
            : a))
        setKonusmalar((l) => l.map((k) => (k.id !== konusmaId ? k : {
            ...k,
            son_mesaj_at: data.created_at,
            son_mesaj_onizleme: tur === 'iletisim' ? 'İletişim bilgisi paylaşıldı' : icerik.slice(0, 160),
            son_gonderen_id: benId,
            ben: { ...k.ben, son_okuma: enGec(k.ben.son_okuma, data.created_at) },
        })))
    }, [benId, ornekGonder])

    const yenidenGonder = useCallback((m) => {
        setAkis((a) => ({ ...a, liste: a.liste.filter((x) => x.id !== m.id) }))
        gonder({ tur: m.tur, icerik: m.icerik, ek: m.ek })
    }, [gonder])

    const sil = useCallback(async (m) => {
        const onceki = m
        setAkis((a) => ({ ...a, liste: a.liste.map((x) => (x.id === m.id ? { ...x, silindi: true, icerik: '', ek: null, tepkiler: [] } : x)) }))
        if (ornekRef.current) return
        const { error } = await supabase.rpc('mesaj_sil', { p_mesaj: m.id })
        if (error) {
            setAkis((a) => ({ ...a, liste: a.liste.map((x) => (x.id === m.id ? onceki : x)) }))
            bildir('Mesaj silinemedi. Tekrar dene.', true)
        }
    }, [bildir])

    const tepkiDegistir = useCallback(async (m, emoji) => {
        const guncelle = (fn) => setAkis((a) => ({ ...a, liste: a.liste.map((x) => (x.id === m.id ? { ...x, tepkiler: fn(x.tepkiler) } : x)) }))
        const benimki = (r) => r.kullanici_id === benId && r.emoji === emoji
        if (ornekRef.current) {
            guncelle((t) => (t.some(benimki) ? t.filter((r) => !benimki(r)) : [...t, { kullanici_id: benId, emoji }]))
            return
        }
        if (m.tepkiler.some(benimki)) {
            guncelle((t) => t.filter((r) => !benimki(r)))
            const { error } = await supabase.from('mesaj_tepkileri').delete().match({ mesaj_id: m.id, kullanici_id: benId, emoji })
            if (error) guncelle((t) => [...t, { kullanici_id: benId, emoji }])
        } else {
            guncelle((t) => [...t, { kullanici_id: benId, emoji }])
            const { error } = await supabase.from('mesaj_tepkileri').insert({ mesaj_id: m.id, emoji })
            if (error && error.code !== '23505') guncelle((t) => t.filter((r) => !benimki(r)))
        }
    }, [benId])

    const durumDegistir = useCallback(async (konusmaId, alan, deger) => {
        const uygula = (v) => setKonusmalar((l) => l.map((x) => (x.id === konusmaId ? { ...x, ben: { ...x.ben, [alan]: v } } : x)))
        uygula(deger)
        if (ornekRef.current) {
            bildir(DURUM_BILDIRIMI[alan][deger])
            return
        }
        const { error } = await supabase.from('konusma_durumu').upsert(
            { konusma_id: konusmaId, kullanici_id: benId, [alan]: deger },
            { onConflict: 'konusma_id,kullanici_id' }
        )
        if (error) {
            uygula(!deger)
            bildir('Ayar kaydedilemedi. Tekrar dene.', true)
        } else {
            bildir(DURUM_BILDIRIMI[alan][deger])
        }
    }, [benId, bildir])

    const aktifDurumDegistir = useCallback((alan, deger) => {
        if (aktifRef.current) durumDegistir(aktifRef.current, alan, deger)
    }, [durumDegistir])

    const panelDegistir = useCallback(() => {
        if (genisRef.current) {
            setPanelTercih((p) => {
                try {
                    localStorage.setItem(PANEL_ANAHTARI, p ? 'kapali' : 'acik')
                } catch {
                    // tercih yalnızca bu oturumda tutulur
                }
                return !p
            })
        } else {
            setCekmece((c) => !c)
        }
    }, [])

    const panelAc = useCallback(() => {
        if (genisRef.current) setPanelTercih(true)
        else setCekmece(true)
    }, [])

    const iletisimPaylas = useCallback(() => {
        setCekmece(false)
        setIletisimIstegi((n) => n + 1)
    }, [])

    // --- Görünüm ---------------------------------------------------------------
    const aktifMesajlar = aktif && akis.id === aktif.id ? akis.liste : []

    // Ziyaretçi: mesajlaşma düzeni yerine ortak giriş kartı (giriş sonrası buraya döner)
    if (!authYukleniyor && !user) {
        return <GirisKapisi ikon="mesaj" baslik="Mesajların seni bekliyor" metin="Ustalarla ve iş verenlerle konuşmak, teklifleri netleştirmek için hesabına giriş yap." />
    }

    let icerik
    if (authYukleniyor) {
        icerik = <div className="msj-sahne flex-1" role="status" aria-label="Yükleniyor" />
    } else {
        const panelIcerigi = aktif && (
            <BaglamPaneli
                key={aktif.id}
                konusma={aktif}
                mesajlar={aktifMesajlar}
                benId={benId}
                cevrimici={cevrimiciMi(aktif.karsi)}
                durumDegistir={aktifDurumDegistir}
                iletisimPaylas={iletisimPaylas}
                kapat={panelDegistir}
            />
        )
        icerik = (
            <>
                <aside className={`${aktifId ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-[340px] xl:w-[360px] shrink-0 border-r border-white/[0.07] bg-[#050507]`}>
                    <KonusmaListesi
                        konusmalar={konusmalar}
                        aktifId={aktifId}
                        benId={benId}
                        okunmamis={okunmamis}
                        cevrimiciMi={cevrimiciMi}
                        yaziyorId={aktifId && yaziyor[aktifId] ? aktifId : null}
                        yukleniyor={listeYukleniyor}
                        hata={listeHata}
                        yenile={listeyiGetir}
                    />
                </aside>

                <main className={`${aktifId ? 'flex' : 'hidden lg:flex'} flex-1 min-w-0 flex-col`}>
                    {!aktifId ? (
                        <BosSahne rol={benimProfil?.rol} />
                    ) : aktif ? (
                        <Sohbet
                            key={aktif.id}
                            konusma={aktif}
                            mesajlar={aktifMesajlar}
                            yukleniyor={akis.id !== aktif.id || akis.yukleniyor}
                            dahaVar={akis.dahaVar}
                            eskiYukleniyor={akis.eskiYukleniyor}
                            eskileriGetir={eskileriGetir}
                            benId={benId}
                            benimProfil={benimProfil}
                            eposta={user.email}
                            cevrimici={cevrimiciMi(aktif.karsi)}
                            yaziyor={Boolean(yaziyor[aktif.id])}
                            yeniIdler={yeniIdler}
                            iletisimIstegi={iletisimIstegi}
                            gonder={gonder}
                            yenidenGonder={yenidenGonder}
                            sil={sil}
                            tepkiDegistir={tepkiDegistir}
                            durumDegistir={aktifDurumDegistir}
                            yaziyorBildir={yaziyorBildir}
                            panelDegistir={panelDegistir}
                            panelAc={panelAc}
                            panelAcik={panelAcik}
                        />
                    ) : bulunamadi ? (
                        <div className="msj-sahne flex-1 flex items-center justify-center px-6">
                            <div className="max-w-sm text-center">
                                <h2 className="text-[22px] font-extrabold tracking-[-0.025em]">Bu konuşma bulunamadı</h2>
                                <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">Bağlantı hatalı olabilir ya da bu konuşmaya erişimin yok.</p>
                                <Link to="/mesajlar" className="isik isik-cam mt-6 inline-flex items-center gap-2 rounded-full h-10 px-5 text-sm">
                                    <Ikon ad="geri" className="w-4 h-4" /> Konuşmalara dön
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="msj-sahne flex-1 flex items-center justify-center text-sm text-[#A1A1AA]">Konuşma açılıyor…</div>
                    )}
                </main>

                {aktif && genis && panelTercih && (
                    <aside className="w-[340px] shrink-0 border-l border-white/[0.07] bg-[#050507]">{panelIcerigi}</aside>
                )}
                {aktif && !genis && cekmece && (
                    <>
                        <div className="msj-perde absolute inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setCekmece(false)} aria-hidden="true" />
                        <aside className="msj-cekmece absolute right-0 top-0 bottom-0 z-50 w-[min(92vw,360px)] border-l border-white/[0.08] bg-[#07070A]">
                            {panelIcerigi}
                        </aside>
                    </>
                )}

                {toast && (
                    <div className="absolute left-1/2 bottom-28 z-[60] -translate-x-1/2 pointer-events-none">
                        <p className="msj-acilir rounded-full px-4 h-10 inline-flex items-center gap-2 text-[13px] text-[#E4E4E7] whitespace-nowrap" role="status">
                            <Ikon ad={toast.hata ? 'uyari' : 'tik'} className={`w-4 h-4 ${toast.hata ? 'text-[#FCA5A5]' : 'text-[#86EFAC]'}`} kalinlik={2} /> {toast.metin}
                        </p>
                    </div>
                )}
            </>
        )
    }

    return (
        <div ref={kokRef} className="msj-kok relative flex overflow-hidden bg-black" style={{ height: `calc(100dvh - ${ust}px)` }}>
            {icerik}
        </div>
    )
}

export default Mesajlar
