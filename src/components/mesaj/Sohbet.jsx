import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import Ikon from './Ikon'
import MesajSatiri, { SistemMesaji } from './MesajSatiri'
import IletisimPaylas from './IletisimPaylas'
import { MESAJ_SINIRI, ayniGun, gunEtiketi, sonGorulmeMetni } from '../../mesajlasma'

const BES_DK = 5 * 60 * 1000

const EMOJILER = ['😀', '😄', '😊', '🙂', '😉', '😍', '🤝', '👍', '👏', '🙌', '🙏', '💪', '🔥', '✨', '🚀', '💡', '✅', '❤️', '🎉', '😂', '🤔', '👀', '⏰', '📌']

const HAZIR_YANITLAR = {
    yazilimci: [
        'Merhaba, ilanınızı inceledim; birkaç sorum olacak.',
        'Ne zaman başlamamı istersiniz?',
        'Benzer bir projeden örnek paylaşabilirim.',
        'Kısa bir görüntülü görüşme yapalım mı?',
    ],
    'is-veren': [
        'Merhaba, teklifinizi inceledim.',
        'Daha önce benzer bir proje yaptınız mı?',
        'Ne zaman başlayabilirsiniz?',
        'Teslim süresini ve ödeme planını konuşalım mı?',
    ],
}

function taslakYaz(id, metin) {
    try {
        if (metin) localStorage.setItem(`kalfahane:taslak:${id}`, metin)
        else localStorage.removeItem(`kalfahane:taslak:${id}`)
    } catch {
        // Depolama kapalıysa taslak tutulmaz
    }
}

function taslakOku(id) {
    try {
        return localStorage.getItem(`kalfahane:taslak:${id}`) || ''
    } catch {
        return ''
    }
}

function grupla(a, b) {
    return Boolean(
        a && b && a.tur !== 'sistem' && b.tur !== 'sistem' &&
        a.gonderen_id === b.gonderen_id &&
        ayniGun(a.created_at, b.created_at) &&
        Math.abs(new Date(b.created_at) - new Date(a.created_at)) < BES_DK
    )
}

function ozet(m) {
    return m.tur === 'iletisim' ? 'İletişim bilgileri' : (m.icerik || '').slice(0, 140)
}

function IkonDugme({ ad, etiket, aktif, onClick, disabled, className = '' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={etiket}
            aria-label={etiket}
            aria-pressed={aktif === undefined ? undefined : aktif}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-35 ${aktif ? 'text-[#C4B5FD] bg-[#8B5CF6]/15' : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]'} ${className}`}
        >
            <Ikon ad={ad} className="w-[18px] h-[18px]" />
        </button>
    )
}

// Dışarı tıklayınca ya da Esc ile kapanan küçük açılır katman
function Acilir({ onKapat, className, children, etiket }) {
    const ref = useRef(null)
    useEffect(() => {
        function disari(e) {
            if (ref.current && !ref.current.contains(e.target) && !e.target.closest?.('[data-acilir-tetik]')) onKapat()
        }
        function tus(e) {
            if (e.key === 'Escape') onKapat()
        }
        document.addEventListener('mousedown', disari)
        document.addEventListener('keydown', tus)
        return () => {
            document.removeEventListener('mousedown', disari)
            document.removeEventListener('keydown', tus)
        }
    }, [onKapat])
    return <div ref={ref} role="dialog" aria-label={etiket} className={`msj-acilir absolute bottom-full mb-2 z-30 ${className}`}>{children}</div>
}

function Sohbet({
    konusma, mesajlar, yukleniyor, dahaVar, eskiYukleniyor, eskileriGetir,
    benId, benimProfil, eposta, cevrimici, yaziyor, yeniIdler, iletisimIstegi,
    gonder, yenidenGonder, sil, tepkiDegistir, durumDegistir, yaziyorBildir, panelDegistir, panelAc, panelAcik,
}) {
    const karsi = konusma.karsi
    const karsiAd = karsi?.ad_soyad || 'Kalfahane üyesi'
    const akisRef = useRef(null)
    const yaziciRef = useRef(null)
    const [metin, setMetin] = useState(() => taslakOku(konusma.id))
    const [yanitlanan, setYanitlanan] = useState(null)
    const [seciliId, setSeciliId] = useState(null)
    const [aramaAcik, setAramaAcik] = useState(false)
    const [aramaMetni, setAramaMetni] = useState('')
    const [aramaSira, setAramaSira] = useState(0)
    const [emojiAcik, setEmojiAcik] = useState(false)
    const [iletisimAcik, setIletisimAcik] = useState(false)
    const [hazirTercih, setHazirTercih] = useState(null)
    const [yeniSayisi, setYeniSayisi] = useState(0)
    const [uzakta, setUzakta] = useState(false)
    const [bilgi, setBilgi] = useState('')
    // Açılış anındaki okuma çizgisi: "Yeni mesajlar" ayracı okundu işaretlenince kaymasın
    const [acilisOkuma] = useState(() => konusma.ben?.son_okuma || null)
    const dokunmatik = useMemo(() => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches, [])
    const kaydirma = useRef({ ilk: null, son: null, yukseklik: 0, yuklendi: false })

    // Bağlam panelinden ya da kabul kartından gelen "iletişim paylaş" isteği
    const ilkIstek = useRef(iletisimIstegi)
    useEffect(() => {
        if (iletisimIstegi !== ilkIstek.current) {
            setEmojiAcik(false)
            setIletisimAcik(true)
        }
    }, [iletisimIstegi])

    useEffect(() => {
        const t = setTimeout(() => taslakYaz(konusma.id, metin), 300)
        return () => clearTimeout(t)
    }, [metin, konusma.id])

    useEffect(() => {
        if (!dokunmatik) yaziciRef.current?.focus()
    }, [dokunmatik])

    useLayoutEffect(() => {
        const el = yaziciRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 168)}px`
    }, [metin])

    useEffect(() => {
        if (!bilgi) return
        const t = setTimeout(() => setBilgi(''), 3800)
        return () => clearTimeout(t)
    }, [bilgi])

    // --- Kaydırma: ilk açılış, eski mesaj ekleme, yeni mesaj ----------------
    useLayoutEffect(() => {
        const el = akisRef.current
        if (!el || yukleniyor) return
        const d = kaydirma.current
        const ilk = mesajlar[0]?.id ?? null
        const son = mesajlar[mesajlar.length - 1]?.id ?? null
        if (!d.yuklendi) {
            const ayrac = el.querySelector('[data-yeni-ayrac]')
            el.scrollTop = ayrac ? Math.max(0, ayrac.offsetTop - 96) : el.scrollHeight
            d.yuklendi = true
        } else if (ilk !== d.ilk && son === d.son) {
            el.scrollTop += el.scrollHeight - d.yukseklik
        } else if (son && son !== d.son) {
            const yeni = mesajlar[mesajlar.length - 1]
            const alttaydi = d.yukseklik - el.scrollTop - el.clientHeight < 160
            if (yeni.gonderen_id === benId || alttaydi) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
            else setYeniSayisi((n) => n + 1)
        }
        d.ilk = ilk
        d.son = son
        d.yukseklik = el.scrollHeight
    }, [mesajlar, yukleniyor, benId])

    useEffect(() => {
        const el = akisRef.current
        if (yaziyor && el && el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
            requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }))
        }
    }, [yaziyor])

    function kaydirildi() {
        const el = akisRef.current
        if (!el) return
        const alttanUzaklik = el.scrollHeight - el.scrollTop - el.clientHeight
        if (el.scrollTop < 80 && dahaVar && !eskiYukleniyor && kaydirma.current.yuklendi) eskileriGetir()
        if (alttanUzaklik < 60 && yeniSayisi) setYeniSayisi(0)
        setUzakta(alttanUzaklik > 640)
    }

    function enAlta() {
        const el = akisRef.current
        el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
        setYeniSayisi(0)
    }

    // --- Mesaja git (arama, alıntı) --------------------------------------
    const mesajaGit = useCallback((id) => {
        const el = akisRef.current?.querySelector(`[data-mesaj-id="${id}"]`)
        if (!el) return false
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        el.classList.remove('msj-vurgu')
        void el.offsetWidth
        el.classList.add('msj-vurgu')
        setTimeout(() => el.classList.remove('msj-vurgu'), 1700)
        return true
    }, [])

    const alintiyaGit = useCallback((id) => {
        if (!mesajaGit(id)) setBilgi('Alıntılanan mesaj daha eskide. Yukarı kaydırıp önceki mesajları yükle.')
    }, [mesajaGit])

    const eslesmeler = useMemo(() => {
        const q = aramaMetni.trim().toLocaleLowerCase('tr-TR')
        if (q.length < 2) return []
        return mesajlar
            .filter((m) => !m.silindi && m.tur === 'metin' && m.icerik.toLocaleLowerCase('tr-TR').includes(q))
            .map((m) => m.id)
    }, [mesajlar, aramaMetni])

    useEffect(() => {
        setAramaSira(Math.max(0, eslesmeler.length - 1))
        // Yalnızca arama değişince en yeni eşleşmeye dön
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aramaMetni])

    const hedefEslesme = eslesmeler[aramaSira]
    useEffect(() => {
        if (aramaAcik && hedefEslesme) mesajaGit(hedefEslesme)
    }, [aramaAcik, hedefEslesme, mesajaGit])

    function aramaKapat() {
        setAramaAcik(false)
        setAramaMetni('')
    }

    function aramaAdim(yon) {
        if (!eslesmeler.length) return
        setAramaSira((s) => (s + yon + eslesmeler.length) % eslesmeler.length)
    }

    // --- Mesaj eylemleri ---------------------------------------------------
    const sec = useCallback((id) => setSeciliId((s) => (s === id ? null : id)), [])

    const yanitla = useCallback((m) => {
        setYanitlanan(m)
        setSeciliId(null)
        yaziciRef.current?.focus()
    }, [])

    function gonderTikla() {
        const t = metin.trim()
        if (!t || t.length > MESAJ_SINIRI) return
        const ek = yanitlanan
            ? { yanit: { id: yanitlanan.id, gonderen_id: yanitlanan.gonderen_id, icerik: ozet(yanitlanan) } }
            : null
        setMetin('')
        setYanitlanan(null)
        setEmojiAcik(false)
        taslakYaz(konusma.id, '')
        gonder({ tur: 'metin', icerik: t, ek })
        yaziciRef.current?.focus()
    }

    function tusBasildi(e) {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && !dokunmatik) {
            e.preventDefault()
            gonderTikla()
        } else if (e.key === 'Escape' && yanitlanan) {
            setYanitlanan(null)
        }
    }

    function emojiEkle(emoji) {
        const el = yaziciRef.current
        const bas = el?.selectionStart ?? metin.length
        const son = el?.selectionEnd ?? metin.length
        setMetin(metin.slice(0, bas) + emoji + metin.slice(son))
        requestAnimationFrame(() => {
            el?.focus()
            el?.setSelectionRange(bas + emoji.length, bas + emoji.length)
        })
    }

    function iletisimGonder(ek) {
        setIletisimAcik(false)
        gonder({ tur: 'iletisim', icerik: '', ek })
    }

    const emojiKapat = useCallback(() => setEmojiAcik(false), [])
    const iletisimKapat = useCallback(() => setIletisimAcik(false), [])
    const iletisimAc = useCallback(() => { setEmojiAcik(false); setIletisimAcik(true) }, [])

    // --- Akış öğeleri --------------------------------------------------------
    const karsiOkuma = konusma.karsiDurum?.son_okuma ? new Date(konusma.karsiDurum.son_okuma).getTime() : 0
    const sonBenim = useMemo(() => {
        for (let i = mesajlar.length - 1; i >= 0; i--) {
            const m = mesajlar[i]
            if (m.gonderen_id === benId && m.tur !== 'sistem' && !m.silindi) return m
        }
        return null
    }, [mesajlar, benId])
    const gorulduId = sonBenim && !sonBenim.gecici && new Date(sonBenim.created_at).getTime() <= karsiOkuma ? sonBenim.id : null

    const sohbetMesajSayisi = mesajlar.filter((m) => m.tur !== 'sistem').length
    const hazirGorunur = (hazirTercih ?? sohbetMesajSayisi < 4) && !metin && !yanitlanan
    const hazirlar = HAZIR_YANITLAR[benimProfil?.rol] || HAZIR_YANITLAR.yazilimci
    const aramaQ = aramaAcik ? aramaMetni.trim() : ''

    // Her gün kendi kabında: yapışkan gün etiketi yalnızca o günün mesajları boyunca kalır
    const gunler = []
    let ogeler = null
    let oncekiZaman = null
    let ayracKonuldu = false
    const acilisZamani = acilisOkuma ? new Date(acilisOkuma).getTime() : 0
    mesajlar.forEach((m, i) => {
        if (!oncekiZaman || !ayniGun(oncekiZaman, m.created_at)) {
            ogeler = []
            gunler.push({ id: m.id, zaman: m.created_at, ogeler })
        }
        oncekiZaman = m.created_at

        let ayracBurada = false
        if (!ayracKonuldu && i > 0 && !m.gecici && m.gonderen_id !== benId && new Date(m.created_at).getTime() > acilisZamani) {
            ayracKonuldu = true
            ayracBurada = true
            ogeler.push(
                <div key="yeni-ayrac" data-yeni-ayrac className="flex items-center gap-3 my-4" role="separator">
                    <span className="msj-yeni-cizgi h-px flex-1" />
                    <span className="text-[11.5px] font-semibold text-[#C4B5FD]">Yeni mesajlar</span>
                    <span className="msj-yeni-cizgi h-px flex-1" />
                </div>
            )
        }

        if (m.tur === 'sistem') {
            ogeler.push(<SistemMesaji key={m.id} m={m} onIletisim={iletisimAc} onRehber={panelAc} />)
            return
        }

        const onceki = mesajlar[i - 1]
        const sonraki = mesajlar[i + 1]
        const benimMi = m.gonderen_id === benId
        ogeler.push(
            <MesajSatiri
                key={m.id}
                m={m}
                benimMi={benimMi}
                benId={benId}
                karsi={karsi}
                karsiAd={karsiAd}
                devamUst={!ayracBurada && grupla(onceki, m) && ayniGun(onceki.created_at, m.created_at)}
                devamAlt={grupla(m, sonraki)}
                okundu={benimMi && new Date(m.created_at).getTime() <= karsiOkuma}
                gorulduEtiketi={m.id === gorulduId}
                arama={aramaQ}
                yeni={yeniIdler.current.has(m.id)}
                secili={seciliId === m.id}
                onSec={sec}
                onYanitla={yanitla}
                onSil={sil}
                onTepki={tepkiDegistir}
                onYenidenGonder={yenidenGonder}
                onAlintiyaGit={alintiyaGit}
            />
        )
    })

    const durumMetni = yaziyor
        ? <span className="text-[#C4B5FD] font-medium">yazıyor…</span>
        : cevrimici
            ? <span className="text-[#86EFAC]">Çevrimiçi</span>
            : <span className="text-[#8E8E99]">{sonGorulmeMetni(karsi?.son_gorulme)}</span>

    return (
        <section className="msj-sahne relative flex flex-col h-full min-h-0" aria-label={`${karsiAd} ile konuşma`}>
            {/* Başlık */}
            <header className="relative z-20 flex items-center gap-2 sm:gap-3 px-2 sm:px-5 h-[68px] shrink-0 border-b border-white/[0.07] bg-black/50 backdrop-blur-xl">
                <Link to="/mesajlar" className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#D4D4D8] hover:bg-white/[0.06]" aria-label="Konuşmalara dön">
                    <Ikon ad="geri" className="w-5 h-5" />
                </Link>
                <button onClick={panelDegistir} className="flex items-center gap-3 min-w-0 rounded-2xl pr-2 text-left" aria-label={`${karsiAd} ayrıntıları`}>
                    <Avatar profil={karsi} boyut={40} cevrimici={cevrimici} />
                    <span className="min-w-0">
                        <span className="block truncate text-[15px] font-bold tracking-[-0.01em]">{karsiAd}</span>
                        <span className="block truncate text-[12px]">
                            {durumMetni}
                            {karsi?.unvan && <span className="hidden sm:inline text-[#8E8E99]"> · {karsi.unvan}</span>}
                        </span>
                    </span>
                </button>
                <div className="ml-auto flex items-center gap-0.5 shrink-0">
                    <IkonDugme ad="ara" etiket="Konuşmada ara" aktif={aramaAcik} onClick={() => (aramaAcik ? aramaKapat() : setAramaAcik(true))} />
                    <IkonDugme ad="sabitle" etiket={konusma.ben.sabitlendi ? 'Sabitlemeyi kaldır' : 'Sabitle'} aktif={konusma.ben.sabitlendi} onClick={() => durumDegistir('sabitlendi', !konusma.ben.sabitlendi)} className="hidden sm:flex" />
                    <IkonDugme ad={konusma.ben.sessiz ? 'sessiz' : 'zil'} etiket={konusma.ben.sessiz ? 'Bildirimleri aç' : 'Sessize al'} aktif={konusma.ben.sessiz} onClick={() => durumDegistir('sessiz', !konusma.ben.sessiz)} className="hidden sm:flex" />
                    <IkonDugme ad="arsiv" etiket={konusma.ben.arsivlendi ? 'Arşivden çıkar' : 'Arşivle'} aktif={konusma.ben.arsivlendi} onClick={() => durumDegistir('arsivlendi', !konusma.ben.arsivlendi)} className="hidden sm:flex" />
                    <IkonDugme ad="bilgi" etiket="Ayrıntılar" aktif={panelAcik} onClick={panelDegistir} />
                </div>
            </header>

            {aramaAcik && (
                <div className="relative z-20 flex items-center gap-1.5 px-2 sm:px-5 py-2 shrink-0 border-b border-white/[0.07] bg-black/60 backdrop-blur-xl">
                    <label className="msj-alan flex-1 flex items-center gap-2 rounded-xl px-3 h-9 min-w-0">
                        <Ikon ad="ara" className="w-4 h-4 text-[#A1A1AA] shrink-0" />
                        <input
                            autoFocus
                            value={aramaMetni}
                            onChange={(e) => setAramaMetni(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') { e.preventDefault(); aramaAdim(e.shiftKey ? 1 : -1) }
                                if (e.key === 'Escape') aramaKapat()
                            }}
                            placeholder="Bu konuşmada ara"
                            aria-label="Bu konuşmada ara"
                            className="flex-1 min-w-0 bg-transparent outline-none text-[13.5px] text-white placeholder:text-[#8E8E99]"
                        />
                    </label>
                    <span className="w-12 text-center text-[12px] tabular-nums text-[#A1A1AA]" aria-live="polite">
                        {eslesmeler.length ? `${aramaSira + 1}/${eslesmeler.length}` : aramaMetni.trim().length >= 2 ? '0' : ''}
                    </span>
                    <IkonDugme ad="yukariOk" etiket="Önceki eşleşme" disabled={!eslesmeler.length} onClick={() => aramaAdim(-1)} />
                    <IkonDugme ad="asagiOk" etiket="Sonraki eşleşme" disabled={!eslesmeler.length} onClick={() => aramaAdim(1)} />
                    <IkonDugme ad="kapat" etiket="Aramayı kapat" onClick={aramaKapat} />
                </div>
            )}

            {/* Akış */}
            <div
                ref={akisRef}
                onScroll={kaydirildi}
                onClick={(e) => !e.target.closest('.msj-mesaj') && setSeciliId(null)}
                className="msj-akis msj-kaydir relative flex-1 min-h-0 px-3 sm:px-6"
                role="log"
                aria-busy={yukleniyor}
            >
                <div className="mx-auto max-w-[760px] flex flex-col pt-2 pb-5">
                    {dahaVar && (
                        <div className="flex justify-center py-3">
                            <button onClick={eskileriGetir} disabled={eskiYukleniyor} className="isik isik-cam h-8 px-4 rounded-full text-[12.5px] inline-flex items-center gap-2">
                                {eskiYukleniyor ? 'Yükleniyor…' : 'Önceki mesajlar'}
                            </button>
                        </div>
                    )}

                    {!dahaVar && !yukleniyor && (
                        <div className="flex flex-col items-center text-center pt-8 pb-6">
                            <Avatar profil={karsi} boyut={72} cevrimici={cevrimici} />
                            <p className="mt-4 text-[19px] font-bold tracking-[-0.02em]">{karsiAd}</p>
                            {karsi?.unvan && <p className="mt-0.5 text-[13px] text-[#A1A1AA]">{karsi.unvan}</p>}
                            {konusma.ilan && (
                                <Link to={`/is-ilanlari/${konusma.ilan.id}`} className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 h-7 text-[12px] text-[#C4B5FD] hover:border-[#A78BFA]/40 transition-colors">
                                    <Ikon ad="belge" className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{konusma.ilan.baslik}</span>
                                </Link>
                            )}
                            <p className="mt-4 max-w-[420px] text-[12.5px] leading-relaxed text-[#8E8E99]">
                                Konuşmanın başı. Kalfahane ödemeye aracılık etmez; kapsamı ve ücreti burada yazılı netleştirip ödemeyi kendi aranızda yapın.
                            </p>
                        </div>
                    )}

                    {yukleniyor ? (
                        <div className="flex flex-col gap-3 pt-10" aria-hidden="true">
                            {[58, 40, 66, 34, 50].map((g, i) => (
                                <span key={i} className={`msj-iskelet h-10 rounded-[20px] ${i % 2 ? 'self-end' : 'self-start'}`} style={{ width: `${g}%` }} />
                            ))}
                        </div>
                    ) : gunler.map((g) => (
                        <div key={`gun-${g.id}`} className="flex flex-col">
                            <div className="sticky top-2 z-10 flex justify-center my-4 pointer-events-none">
                                <span className="msj-gun rounded-full px-3 h-7 inline-flex items-center text-[11.5px] font-medium text-[#D4D4D8]">{gunEtiketi(g.zaman)}</span>
                            </div>
                            {g.ogeler}
                        </div>
                    ))}

                    {yaziyor && (
                        <div className="msj-o flex items-end mt-3.5">
                            <span className="w-8 mr-2 shrink-0"><Avatar profil={karsi} boyut={30} /></span>
                            <span className="msj-balon msj-balon-o msj-giris msj-yaziyor inline-flex items-center gap-1 h-[38px]" aria-label={`${karsiAd} yazıyor`}>
                                <span /><span /><span />
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {bilgi && (
                <div className="absolute left-1/2 top-[84px] z-30 -translate-x-1/2 w-[min(92%,420px)]">
                    <p className="msj-acilir rounded-2xl px-4 py-2.5 text-center text-[12.5px] text-[#E4E4E7]" role="status">{bilgi}</p>
                </div>
            )}

            {/* Yazma alanı */}
            <div className="relative shrink-0 px-2 sm:px-6 pb-3 sm:pb-4 pt-1">
                <div className="relative mx-auto max-w-[760px]">
                    {(yeniSayisi > 0 || uzakta) && (
                        <div className="msj-hap absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+14px)] z-20">
                            <button onClick={enAlta} className={`isik isik-mor h-9 rounded-full text-[12.5px] font-semibold inline-flex items-center gap-2 ${yeniSayisi ? 'px-4' : 'w-9 justify-center'}`} aria-label={yeniSayisi ? `${yeniSayisi} yeni mesaj, en alta git` : 'En alta git'}>
                                <Ikon ad="asagi" className="w-4 h-4" />
                                {yeniSayisi > 0 && `${yeniSayisi} yeni mesaj`}
                            </button>
                        </div>
                    )}

                    {hazirGorunur && (
                        <div className="msj-cip-satir mb-2 flex gap-1.5 overflow-x-auto msj-kaydir pb-1 pr-8" aria-label="Hazır yanıtlar">
                            {hazirlar.map((h) => (
                                <button
                                    key={h}
                                    onClick={() => { setMetin(h); yaziciRef.current?.focus() }}
                                    className="msj-cip shrink-0 h-8 px-3.5 rounded-full border border-white/[0.1] bg-white/[0.03] text-[12.5px] text-[#D4D4D8] whitespace-nowrap"
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    )}

                    {emojiAcik && (
                        <Acilir onKapat={emojiKapat} etiket="Emoji ekle" className="left-0 rounded-2xl p-2 w-[280px]">
                            <div className="grid grid-cols-8 gap-0.5">
                                {EMOJILER.map((e) => (
                                    <button key={e} onClick={() => emojiEkle(e)} className="msj-tepki-sec w-8 h-8 rounded-lg text-[18px] leading-none flex items-center justify-center" aria-label={`${e} ekle`}>
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </Acilir>
                    )}

                    {iletisimAcik && (
                        <IletisimPaylas
                            varsayilan={{ telefon: benimProfil?.telefon || '', eposta: eposta || '' }}
                            onGonder={iletisimGonder}
                            onKapat={iletisimKapat}
                        />
                    )}

                    <div className="msj-yazici">
                        {yanitlanan && (
                            <div className="flex items-start gap-2.5 px-4 pt-3">
                                <Ikon ad="yanitla" className="w-4 h-4 mt-0.5 text-[#C4B5FD] shrink-0" />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[11.5px] font-semibold text-[#C4B5FD]">
                                        Yanıtlanıyor: {yanitlanan.gonderen_id === benId ? 'kendi mesajın' : karsiAd}
                                    </span>
                                    <span className="block truncate text-[12.5px] text-[#A1A1AA]">{ozet(yanitlanan)}</span>
                                </span>
                                <button onClick={() => setYanitlanan(null)} aria-label="Yanıtı iptal et" className="w-7 h-7 -mt-0.5 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/[0.06]">
                                    <Ikon ad="kapat" className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                        <div className="flex items-end gap-1 p-1.5 pl-1.5">
                            <div className="flex items-center shrink-0 pb-0.5">
                                <span data-acilir-tetik>
                                    <IkonDugme ad="gulumse" etiket="Emoji" aktif={emojiAcik} onClick={() => { setIletisimAcik(false); setEmojiAcik((a) => !a) }} />
                                </span>
                                <span data-acilir-tetik>
                                    <IkonDugme ad="kart" etiket="İletişim bilgisi paylaş" aktif={iletisimAcik} onClick={() => { setEmojiAcik(false); setIletisimAcik((a) => !a) }} />
                                </span>
                                <IkonDugme ad="simsek" etiket={hazirGorunur ? 'Hazır yanıtları gizle' : 'Hazır yanıtlar'} aktif={hazirGorunur} onClick={() => setHazirTercih(!hazirGorunur)} className="hidden sm:flex" />
                            </div>
                            <textarea
                                ref={yaziciRef}
                                rows={1}
                                value={metin}
                                onChange={(e) => {
                                    setMetin(e.target.value)
                                    if (e.target.value) yaziyorBildir()
                                }}
                                onKeyDown={tusBasildi}
                                maxLength={MESAJ_SINIRI}
                                placeholder="Bir mesaj yaz…"
                                aria-label="Mesaj yaz"
                                className="msj-kaydir flex-1 min-w-0 resize-none bg-transparent text-[14.5px] leading-[1.5] text-white py-[9px] px-1 max-h-[168px]"
                            />
                            <button onClick={gonderTikla} disabled={!metin.trim()} className="msj-gonder w-10 h-10 rounded-full flex items-center justify-center shrink-0" aria-label="Gönder">
                                <Ikon ad="gonder" kalinlik={2.2} className="w-[18px] h-[18px]" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3 px-2 text-[11px] text-[#8E8E99]">
                        <span className="hidden sm:inline">
                            <kbd className="font-sans text-[#A1A1AA]">Enter</kbd> gönderir · <kbd className="font-sans text-[#A1A1AA]">Shift + Enter</kbd> yeni satır
                        </span>
                        {metin.length > MESAJ_SINIRI - 500 ? (
                            <span className={`tabular-nums ${metin.length >= MESAJ_SINIRI ? 'text-[#FCA5A5]' : 'text-[#A1A1AA]'}`}>{metin.length}/{MESAJ_SINIRI}</span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 ml-auto sm:ml-0">
                                <Ikon ad="kalkan" className="w-3.5 h-3.5 text-[#86EFAC]" /> Ödeme siteden yapılmaz, anlaşmayı burada yazılı netleştirin
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Sohbet
