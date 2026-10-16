import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import Ikon from './Ikon'
import { kisaZaman } from '../../mesajlasma'

const FILTRELER = [
    { id: 'tumu', ad: 'Tümü' },
    { id: 'okunmamis', ad: 'Okunmamış' },
    { id: 'sabitli', ad: 'Sabitli' },
    { id: 'arsiv', ad: 'Arşiv' },
]

function taslakOku(id) {
    try {
        return localStorage.getItem(`kalfahane:taslak:${id}`) || ''
    } catch {
        return ''
    }
}

function Iskelet() {
    return (
        <div className="flex flex-col gap-1 px-1 pt-1" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3">
                    <span className="msj-iskelet w-[46px] h-[46px] rounded-full shrink-0" />
                    <span className="flex-1 flex flex-col gap-2">
                        <span className="msj-iskelet h-3 rounded-full" style={{ width: `${55 - i * 4}%` }} />
                        <span className="msj-iskelet h-2.5 rounded-full" style={{ width: `${80 - i * 6}%` }} />
                    </span>
                </div>
            ))}
        </div>
    )
}

function KonusmaListesi({ konusmalar, aktifId, benId, okunmamis, cevrimiciMi, yaziyorId, yukleniyor, hata, yenile }) {
    const [arama, setArama] = useState('')
    const [filtre, setFiltre] = useState('tumu')

    const sayilar = useMemo(() => ({
        okunmamis: konusmalar.filter((k) => okunmamis[k.id] > 0).length,
        sabitli: konusmalar.filter((k) => k.ben.sabitlendi && !k.ben.arsivlendi).length,
        arsiv: konusmalar.filter((k) => k.ben.arsivlendi).length,
    }), [konusmalar, okunmamis])

    const toplamOkunmamis = Object.values(okunmamis).reduce((a, b) => a + b, 0)

    const gorunen = useMemo(() => {
        const q = arama.trim().toLocaleLowerCase('tr-TR')
        return konusmalar
            .filter((k) => {
                const sayi = okunmamis[k.id] || 0
                if (filtre === 'arsiv') return k.ben.arsivlendi
                if (filtre === 'okunmamis') return sayi > 0
                if (filtre === 'sabitli') return k.ben.sabitlendi && !k.ben.arsivlendi
                return !k.ben.arsivlendi || sayi > 0
            })
            .filter((k) => !q || [k.karsi?.ad_soyad, k.karsi?.unvan, k.ilan?.baslik, k.son_mesaj_onizleme]
                .some((v) => v?.toLocaleLowerCase('tr-TR').includes(q)))
            .sort((a, b) => {
                if (filtre !== 'arsiv') {
                    const sabit = Number(b.ben.sabitlendi) - Number(a.ben.sabitlendi)
                    if (sabit) return sabit
                }
                return new Date(b.son_mesaj_at) - new Date(a.son_mesaj_at)
            })
    }, [konusmalar, okunmamis, filtre, arama])

    function onizleme(k) {
        if (yaziyorId === k.id) {
            return <span className="text-[#C4B5FD] font-medium">yazıyor…</span>
        }
        const taslak = k.id !== aktifId ? taslakOku(k.id) : ''
        if (taslak) {
            return <><span className="text-[#C4B5FD] font-medium">Taslak: </span>{taslak}</>
        }
        if (!k.son_mesaj_onizleme) {
            return <span className="text-[#8E8E99]">Henüz mesaj yok. İlk adımı sen at.</span>
        }
        return <>{k.son_gonderen_id === benId && <span className="text-[#8E8E99]">Sen: </span>}{k.son_mesaj_onizleme}</>
    }

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="px-5 pt-6 pb-3">
                <div className="flex items-baseline justify-between gap-3">
                    <h1 className="text-[26px] leading-none font-extrabold tracking-[-0.03em]">Mesajlar</h1>
                    {toplamOkunmamis > 0 && (
                        <span className="text-xs text-[#C4B5FD] font-semibold tabular-nums">{toplamOkunmamis} okunmamış</span>
                    )}
                </div>

                <label className="msj-alan mt-5 flex items-center gap-2.5 rounded-2xl px-3.5 h-11">
                    <Ikon ad="ara" className="w-4 h-4 text-[#A1A1AA] shrink-0" />
                    <input
                        value={arama}
                        onChange={(e) => setArama(e.target.value)}
                        onKeyDown={(e) => e.key === 'Escape' && setArama('')}
                        placeholder="Kişi, ilan ya da mesaj ara"
                        aria-label="Konuşmalarda ara"
                        className="flex-1 min-w-0 bg-transparent outline-none text-sm text-white placeholder:text-[#8E8E99]"
                    />
                    {arama && (
                        <button onClick={() => setArama('')} aria-label="Aramayı temizle" className="text-[#A1A1AA] hover:text-white transition-colors">
                            <Ikon ad="kapat" className="w-3.5 h-3.5" />
                        </button>
                    )}
                </label>

                <div className="mt-3 flex gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.06]" role="group" aria-label="Konuşma filtresi">
                    {FILTRELER.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFiltre(f.id)}
                            aria-pressed={filtre === f.id}
                            className="msj-filtre flex-1 flex items-center justify-center gap-1 text-[12px] font-medium text-[#A1A1AA] rounded-full h-8 px-1.5 hover:text-white"
                        >
                            {f.ad}
                            {f.id !== 'tumu' && sayilar[f.id] > 0 && (
                                <span className={`tabular-nums text-[10.5px] ${f.id === 'okunmamis' ? 'text-[#C4B5FD]' : 'text-[#8E8E99]'}`}>{sayilar[f.id]}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="msj-kaydir flex-1 min-h-0 px-2.5 pb-4">
                {yukleniyor ? (
                    <Iskelet />
                ) : hata ? (
                    <div className="px-4 py-10 text-center">
                        <p className="text-sm text-[#FCA5A5]">{hata}</p>
                        <button onClick={yenile} className="isik isik-cam mt-4 inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm">
                            <Ikon ad="yenile" className="w-4 h-4" /> Tekrar dene
                        </button>
                    </div>
                ) : konusmalar.length === 0 ? (
                    <div className="px-5 py-10">
                        <p className="text-[15px] font-semibold">Henüz konuşman yok</p>
                        <p className="mt-2 text-[13.5px] leading-relaxed text-[#A1A1AA]">
                            Bir ustanın profilindeki <span className="text-white">Mesaj gönder</span> düğmesiyle ya da bir teklifin yanındaki <span className="text-white">Mesajlaş</span> ile ilk konuşmanı başlat.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            <Link to="/ustalar" className="isik isik-birincil inline-flex items-center rounded-full px-4 h-9 text-sm font-semibold">Ustaları keşfet</Link>
                            <Link to="/is-ilanlari" className="isik isik-cam inline-flex items-center rounded-full px-4 h-9 text-sm">İş ilanları</Link>
                        </div>
                    </div>
                ) : gorunen.length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-[#A1A1AA]">
                        {arama ? <>“{arama}” için sonuç yok.</> : filtre === 'arsiv' ? 'Arşivde konuşma yok.' : filtre === 'sabitli' ? 'Sabitlenmiş konuşma yok. Önemli konuşmaları üstte tutmak için sabitle.' : 'Okunmamış mesajın yok.'}
                    </p>
                ) : (
                    <ul className="flex flex-col gap-0.5">
                        {gorunen.map((k) => {
                            const sayi = okunmamis[k.id] || 0
                            return (
                                <li key={k.id}>
                                    <Link
                                        to={`/mesajlar/${k.id}`}
                                        aria-current={k.id === aktifId ? 'page' : undefined}
                                        className="msj-satir flex items-center gap-3 rounded-2xl px-3 py-3"
                                    >
                                        <Avatar profil={k.karsi} boyut={46} cevrimici={cevrimiciMi(k.karsi)} />
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center gap-1.5">
                                                <span className={`truncate text-[14.5px] ${sayi ? 'font-bold text-white' : 'font-semibold text-[#F4F4F5]'}`}>
                                                    {k.karsi?.ad_soyad || 'Kalfahane üyesi'}
                                                </span>
                                                {k.ben.sabitlendi && <Ikon ad="sabitle" className="w-3.5 h-3.5 text-[#A78BFA] shrink-0" aria-label="Sabitli" />}
                                                {k.ben.sessiz && <Ikon ad="sessiz" className="w-3.5 h-3.5 text-[#8E8E99] shrink-0" aria-label="Sessizde" />}
                                                <span className={`ml-auto pl-2 shrink-0 text-[11.5px] tabular-nums ${sayi ? 'text-[#C4B5FD] font-semibold' : 'text-[#8E8E99]'}`}>
                                                    {kisaZaman(k.son_mesaj_at)}
                                                </span>
                                            </span>
                                            {k.ilan && (
                                                <span className="mt-0.5 flex items-center gap-1 text-[11.5px] text-[#A78BFA]">
                                                    <Ikon ad="belge" className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{k.ilan.baslik}</span>
                                                </span>
                                            )}
                                            <span className="mt-0.5 flex items-center gap-2">
                                                <span className={`truncate text-[13px] flex-1 ${sayi ? 'text-[#E4E4E7]' : 'text-[#A1A1AA]'}`}>
                                                    {onizleme(k)}
                                                </span>
                                                {sayi > 0 && (
                                                    <span className="msj-rozet shrink-0 min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold text-white flex items-center justify-center">
                                                        {sayi > 99 ? '99+' : sayi}
                                                    </span>
                                                )}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default KonusmaListesi
