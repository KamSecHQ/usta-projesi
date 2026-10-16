import { Fragment, memo, useState } from 'react'
import Avatar from './Avatar'
import Ikon from './Ikon'
import { TEPKILER, epostaGecerli, guvenliUrl, gunEtiketi, saatGoster, tutarGoster } from '../../mesajlasma'

const URL_DESENI = /(https?:\/\/[^\s<>"']*[^\s<>"'.,;:!?)\]])/gi

function vurgula(metin, arama, anahtar) {
    if (!arama || arama.length < 2) return metin
    const kucuk = metin.toLocaleLowerCase('tr-TR')
    const aranan = arama.toLocaleLowerCase('tr-TR')
    const parcalar = []
    let i = 0
    let j
    while ((j = kucuk.indexOf(aranan, i)) !== -1) {
        if (j > i) parcalar.push(metin.slice(i, j))
        parcalar.push(<mark key={`${anahtar}-${j}`}>{metin.slice(j, j + aranan.length)}</mark>)
        i = j + aranan.length
    }
    parcalar.push(metin.slice(i))
    return parcalar
}

export function MetinIcerik({ metin, arama }) {
    return metin.split(URL_DESENI).map((parca, i) =>
        i % 2 === 1 ? (
            <a key={i} href={parca} target="_blank" rel="noopener noreferrer nofollow">{vurgula(parca, arama, i)}</a>
        ) : (
            <Fragment key={i}>{vurgula(parca, arama, i)}</Fragment>
        )
    )
}

function whatsappNumarasi(telefon) {
    let rakam = telefon.replace(/[^\d]/g, '')
    if (rakam.startsWith('0')) rakam = `90${rakam.slice(1)}`
    else if (rakam.length === 10 && rakam.startsWith('5')) rakam = `90${rakam}`
    return rakam.length >= 10 ? rakam : ''
}

function KopyalaDugmesi({ deger, etiket }) {
    const [kopyalandi, setKopyalandi] = useState(false)
    async function kopyala() {
        try {
            await navigator.clipboard.writeText(deger)
            setKopyalandi(true)
            setTimeout(() => setKopyalandi(false), 1600)
        } catch {
            // Pano izni yoksa sessiz geç
        }
    }
    return (
        <button
            onClick={kopyala}
            aria-label={`${etiket} kopyala`}
            title={kopyalandi ? 'Kopyalandı' : 'Kopyala'}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${kopyalandi ? 'text-[#86EFAC]' : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.08]'}`}
        >
            <Ikon ad={kopyalandi ? 'tik' : 'kopyala'} className="w-3.5 h-3.5" />
        </button>
    )
}

function KartSatiri({ ikon, etiket, deger, children }) {
    return (
        <div className="msj-kart-satir flex items-center gap-3 rounded-xl px-2.5 py-2">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.06] text-[#C4B5FD] shrink-0">
                <Ikon ad={ikon} className="w-4 h-4" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-[11px] text-[#A1A1AA]">{etiket}</span>
                <span className="block truncate text-[13.5px] font-medium text-white select-all">{deger}</span>
            </span>
            <span className="flex items-center shrink-0">{children}</span>
        </div>
    )
}

const kartDugmesi = 'w-8 h-8 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/[0.08] transition-colors'

export function IletisimKarti({ ek, sahibi }) {
    const telefon = typeof ek?.telefon === 'string' ? ek.telefon.trim().slice(0, 40) : ''
    const wa = telefon ? whatsappNumarasi(telefon) : ''
    const eposta = epostaGecerli(ek?.eposta) ? ek.eposta.trim() : ''
    const baglanti = guvenliUrl(ek?.baglanti)
    const not = typeof ek?.not === 'string' ? ek.not.slice(0, 300) : ''

    return (
        <div className="msj-kart w-[300px] max-w-full p-2.5">
            <div className="flex items-center gap-2 px-2 pt-1 pb-2">
                <Ikon ad="kart" className="w-4 h-4 text-[#C4B5FD]" />
                <span className="text-[13px] font-semibold">İletişim bilgileri</span>
                <span className="ml-auto text-[11px] text-[#A1A1AA] truncate">{sahibi}</span>
            </div>
            {telefon && (
                <KartSatiri ikon="telefon" etiket="Telefon" deger={telefon}>
                    <a href={`tel:${telefon.replace(/[^\d+]/g, '')}`} className={kartDugmesi} aria-label="Ara" title="Ara">
                        <Ikon ad="telefon" className="w-3.5 h-3.5" />
                    </a>
                    {wa && (
                        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={kartDugmesi} aria-label="WhatsApp'ta aç" title="WhatsApp">
                            <Ikon ad="whatsapp" className="w-3.5 h-3.5" />
                        </a>
                    )}
                    <KopyalaDugmesi deger={telefon} etiket="Telefonu" />
                </KartSatiri>
            )}
            {eposta && (
                <KartSatiri ikon="eposta" etiket="E-posta" deger={eposta}>
                    <a href={`mailto:${eposta}`} className={kartDugmesi} aria-label="E-posta gönder" title="E-posta gönder">
                        <Ikon ad="disBaglanti" className="w-3.5 h-3.5" />
                    </a>
                    <KopyalaDugmesi deger={eposta} etiket="E-postayı" />
                </KartSatiri>
            )}
            {baglanti && (
                <KartSatiri ikon="baglanti" etiket="Bağlantı" deger={baglanti.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}>
                    <a href={baglanti} target="_blank" rel="noopener noreferrer nofollow" className={kartDugmesi} aria-label="Bağlantıyı aç" title="Aç">
                        <Ikon ad="disBaglanti" className="w-3.5 h-3.5" />
                    </a>
                    <KopyalaDugmesi deger={baglanti} etiket="Bağlantıyı" />
                </KartSatiri>
            )}
            {not && <p className="px-2.5 pt-2 pb-1 text-[12.5px] leading-relaxed text-[#D4D4D8] whitespace-pre-wrap">{not}</p>}
        </div>
    )
}

function OkunduIsareti({ m, okundu }) {
    if (m.gecici === 'gidiyor') return <Ikon ad="saat" className="w-3 h-3" aria-label="Gönderiliyor" />
    if (m.gecici === 'hata') return <Ikon ad="uyari" className="w-3 h-3 text-[#FCA5A5]" aria-label="Gönderilemedi" />
    return okundu
        ? <Ikon ad="ciftTik" className="w-[15px] h-[15px] text-[#DDD6FE]" kalinlik={2} aria-label="Görüldü" />
        : <Ikon ad="tik" className="w-3 h-3" kalinlik={2} aria-label="İletildi" />
}

// Sistem olayları: teklif bağlamı, kabul (anlaşma), ret
export function SistemMesaji({ m, onIletisim, onRehber }) {
    const olay = m.ek?.olay
    if (olay === 'kabul') {
        const tutar = tutarGoster(m.ek?.tutar)
        return (
            <div className="flex justify-center my-6 px-1" data-mesaj-id={m.id}>
                <div className="msj-anlasma msj-kart-dis w-full max-w-[470px] px-5 sm:px-6 py-6">
                    <div className="flex items-center gap-3.5">
                        <span className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#4ADE80]/[0.12] text-[#86EFAC] border border-[#4ADE80]/25 shrink-0">
                            <Ikon ad="anlasma" className="w-6 h-6" kalinlik={1.5} />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[17px] font-bold tracking-[-0.015em]">Teklif kabul edildi</span>
                            <span className="block text-[12.5px] text-[#A1A1AA] tabular-nums">
                                {gunEtiketi(m.created_at)} · {saatGoster(m.created_at)}{tutar && <> · <span className="text-[#C4B5FD] font-semibold">{tutar}</span></>}
                            </span>
                        </span>
                    </div>
                    <p className="mt-4 text-[13.5px] leading-relaxed text-[#D4D4D8]">
                        Kalfahane şimdilik ödemeye aracılık etmiyor. Kapsamı, teslim tarihini ve ödeme yöntemini burada yazılı olarak netleştirin; ödemeyi kendi aranızda, güvendiğiniz bir yolla yapın.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                        <button onClick={onIletisim} className="isik isik-birincil h-9 px-4 rounded-full text-[13px] font-semibold inline-flex items-center gap-2">
                            <Ikon ad="kart" className="w-4 h-4" /> İletişim bilgimi paylaş
                        </button>
                        <button onClick={onRehber} className="isik isik-cam h-9 px-4 rounded-full text-[13px] inline-flex items-center gap-2">
                            <Ikon ad="liste" className="w-4 h-4" /> Anlaşma rehberi
                        </button>
                    </div>
                </div>
            </div>
        )
    }
    const ikon = olay === 'teklif' ? 'belge' : olay === 'ret' ? 'kapat' : 'mesaj'
    return (
        <div className="flex justify-center my-4 px-2" data-mesaj-id={m.id}>
            <div className={`msj-sistem max-w-[92%] rounded-2xl px-4 py-2.5 flex items-start gap-2.5 text-[12.5px] leading-relaxed ${olay === 'ret' ? 'text-[#D4D4D8]' : 'text-[#D4D4D8]'}`}>
                <Ikon ad={ikon} className={`w-4 h-4 mt-[1px] shrink-0 ${olay === 'ret' ? 'text-[#FCA5A5]' : 'text-[#C4B5FD]'}`} />
                <span>
                    {m.icerik}
                    <span className="ml-2 text-[#8E8E99] tabular-nums">{saatGoster(m.created_at)}</span>
                </span>
            </div>
        </div>
    )
}

function MesajSatiri({
    m, benimMi, karsi, karsiAd, devamUst, devamAlt, okundu, gorulduEtiketi, arama, yeni, secili, benId,
    onSec, onYanitla, onSil, onTepki, onYenidenGonder, onAlintiyaGit,
}) {
    const [tepkiAcik, setTepkiAcik] = useState(false)
    const [silOnay, setSilOnay] = useState(false)
    const silindi = m.silindi
    const gecici = Boolean(m.gecici)

    const tepkiGruplari = []
    for (const t of m.tepkiler || []) {
        const grup = tepkiGruplari.find((g) => g.emoji === t.emoji)
        if (grup) {
            grup.sayi += 1
            grup.benim ||= t.kullanici_id === benId
        } else {
            tepkiGruplari.push({ emoji: t.emoji, sayi: 1, benim: t.kullanici_id === benId })
        }
    }

    const koseler = `${devamUst ? 'msj-devam-ust' : ''} ${devamAlt ? 'msj-devam-alt' : ''}`
    const zamanTam = new Date(m.created_at).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })
    const yanit = m.ek?.yanit && typeof m.ek.yanit === 'object' ? m.ek.yanit : null

    async function kopyala() {
        try {
            await navigator.clipboard.writeText(m.icerik)
        } catch {
            // sessiz geç
        }
    }

    const meta = (
        <span className={`inline-flex items-center gap-1 text-[10.5px] leading-none tabular-nums ${benimMi ? 'text-white/60' : 'text-[#8E8E99]'}`}>
            {saatGoster(m.created_at)}
            {benimMi && !silindi && <OkunduIsareti m={m} okundu={okundu} />}
        </span>
    )

    let govde
    if (silindi) {
        govde = (
            <div className={`msj-balon msj-silindi ${koseler}`}>
                <span className="inline-flex items-center gap-1.5"><Ikon ad="sil" className="w-3.5 h-3.5" /> Bu mesaj silindi</span>
            </div>
        )
    } else if (m.tur === 'iletisim') {
        govde = (
            <div className="flex flex-col gap-1">
                <IletisimKarti ek={m.ek} sahibi={benimMi ? 'Sen paylaştın' : `${karsiAd} paylaştı`} />
                <span className={`px-2 ${benimMi ? 'self-end' : 'self-start'}`}>{meta}</span>
            </div>
        )
    } else {
        govde = (
            <div
                className={`msj-balon ${benimMi ? 'msj-balon-ben' : 'msj-balon-o'} ${koseler} ${m.gecici === 'gidiyor' ? 'msj-gidiyor' : ''} ${m.gecici === 'hata' ? 'msj-hatali' : ''}`}
                title={zamanTam}
            >
                {yanit && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); onAlintiyaGit(yanit.id) }} className="msj-alinti">
                        <span className="block text-[11.5px] font-semibold text-[#DDD6FE]">
                            {yanit.gonderen_id === benId ? 'Sen' : karsiAd}
                        </span>
                        <span className="block text-white/75 line-clamp-2">
                            {typeof yanit.icerik === 'string' && yanit.icerik ? yanit.icerik : <em className="text-white/50">Silinmiş mesaj</em>}
                        </span>
                    </button>
                )}
                <MetinIcerik metin={m.icerik} arama={arama} />
                <span className="float-right ml-3 mt-[7px] -mb-0.5">{meta}</span>
            </div>
        )
    }

    return (
        <div
            data-mesaj-id={m.id}
            data-secili={secili ? 'true' : 'false'}
            className={`msj-mesaj flex ${benimMi ? 'msj-ben justify-end' : 'msj-o justify-start'} ${devamUst ? 'mt-[3px]' : 'mt-3.5'}`}
        >
            {!benimMi && (
                <span className="w-8 mr-2 shrink-0 self-end mb-[2px]">
                    {!devamAlt && <Avatar profil={karsi} boyut={30} />}
                </span>
            )}
            <div className={`relative max-w-[82%] sm:max-w-[72%] flex flex-col ${benimMi ? 'items-end' : 'items-start'}`}>
                <div className={`relative ${yeni ? 'msj-giris' : ''}`} onClick={() => !silindi && onSec(m.id)}>
                    {govde}

                    {!silindi && !gecici && (
                        <div
                            className={`msj-eylemler absolute z-20 bottom-full mb-1.5 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:mb-0 ${benimMi ? 'right-0 sm:right-full sm:mr-2' : 'left-0 sm:left-full sm:ml-2'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="msj-eylem-cubugu flex items-center gap-0.5 rounded-full p-1">
                                {tepkiAcik ? (
                                    TEPKILER.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => { onTepki(m, emoji); setTepkiAcik(false) }}
                                            className="msj-tepki-sec w-8 h-8 rounded-full text-[17px] leading-none flex items-center justify-center"
                                            aria-label={`${emoji} tepkisi ver`}
                                        >
                                            {emoji}
                                        </button>
                                    ))
                                ) : silOnay ? (
                                    <>
                                        <span className="pl-2.5 pr-1 text-[12px] text-[#FCA5A5] whitespace-nowrap">Herkesten silinsin mi?</span>
                                        <button onClick={() => { onSil(m); setSilOnay(false) }} className="h-7 px-3 rounded-full text-[12px] font-semibold bg-red-500/80 hover:bg-red-500 text-white transition-colors">Sil</button>
                                        <button onClick={() => setSilOnay(false)} className="h-7 px-3 rounded-full text-[12px] text-[#A1A1AA] hover:text-white transition-colors">Vazgeç</button>
                                    </>
                                ) : (
                                    <>
                                        <EylemDugmesi ikon="gulumse" etiket="Tepki ver" onClick={() => setTepkiAcik(true)} />
                                        <EylemDugmesi ikon="yanitla" etiket="Yanıtla" onClick={() => onYanitla(m)} />
                                        {m.tur === 'metin' && <EylemDugmesi ikon="kopyala" etiket="Kopyala" onClick={kopyala} />}
                                        {benimMi && <EylemDugmesi ikon="sil" etiket="Sil" tehlike onClick={() => setSilOnay(true)} />}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {tepkiGruplari.length > 0 && (
                    <div className={`relative z-10 -mt-1.5 flex flex-wrap gap-1 ${benimMi ? 'justify-end pr-2' : 'justify-start pl-2'}`}>
                        {tepkiGruplari.map((g) => (
                            <button
                                key={g.emoji}
                                onClick={() => onTepki(m, g.emoji)}
                                aria-pressed={g.benim}
                                aria-label={`${g.emoji} ${g.sayi}${g.benim ? ', tepkini geri al' : ''}`}
                                className="msj-tepki msj-tepki-yeni h-6 px-1.5 rounded-full border border-white/[0.12] bg-[#121018] text-[12.5px] leading-none flex items-center gap-1"
                            >
                                <span>{g.emoji}</span>
                                {g.sayi > 1 && <span className="text-[11px] text-[#D4D4D8]">{g.sayi}</span>}
                            </button>
                        ))}
                    </div>
                )}

                {m.gecici === 'hata' && (
                    <button onClick={() => onYenidenGonder(m)} className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-[#FCA5A5] hover:text-[#FECACA] transition-colors">
                        <Ikon ad="yenile" className="w-3.5 h-3.5" /> Gönderilemedi. Tekrar dene
                    </button>
                )}
                {gorulduEtiketi && <span className="mt-1 pr-1 text-[11px] text-[#A1A1AA]">Görüldü</span>}
            </div>
        </div>
    )
}

function EylemDugmesi({ ikon, etiket, onClick, tehlike }) {
    return (
        <button
            onClick={onClick}
            aria-label={etiket}
            title={etiket}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${tehlike ? 'text-[#A1A1AA] hover:text-[#FCA5A5] hover:bg-red-500/10' : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.08]'}`}
        >
            <Ikon ad={ikon} className="w-4 h-4" />
        </button>
    )
}

export default memo(MesajSatiri)
