import { useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import Ikon from './Ikon'
import { IletisimKarti } from './MesajSatiri'
import { sonGorulmeMetni, tutarGoster } from '../../mesajlasma'
import { musaitlikBilgisi, ucretAraligiGoster } from '../../ustaYardimcilari'

const REHBER = [
    { id: 'kapsam', metin: 'İşin kapsamı yazılı olarak netleşti' },
    { id: 'takvim', metin: 'Teslim tarihi ve ara teslimler belli' },
    { id: 'ucret', metin: 'Ücret ve ödeme yöntemi konuşuldu' },
    { id: 'revizyon', metin: 'Revizyon hakkı ve kaynak kod teslimi konuşuldu' },
    { id: 'iletisim', metin: 'İletişim bilgileri karşılıklı paylaşıldı' },
]

const ILAN_DURUMU = { acik: 'Açık', kapali: 'Kapalı', tamamlandi: 'Tamamlandı' }
const TEKLIF_DURUMU = {
    beklemede: { etiket: 'Beklemede', sinif: 'bg-white/[0.06] text-[#D4D4D8]' },
    kabul_edildi: { etiket: 'Kabul edildi', sinif: 'bg-[#4ADE80]/10 text-[#86EFAC]' },
    reddedildi: { etiket: 'Reddedildi', sinif: 'bg-red-400/10 text-[#FCA5A5]' },
}

function rehberOku(id) {
    try {
        return JSON.parse(localStorage.getItem(`kalfahane:rehber:${id}`) || '[]')
    } catch {
        return []
    }
}

function Bolum({ baslik, sag, children }) {
    return (
        <section className="px-5 py-5 border-t border-white/[0.07]">
            <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-[13px] font-bold text-white">{baslik}</h3>
                {sag}
            </div>
            {children}
        </section>
    )
}

function BaglamPaneli({ konusma, mesajlar, benId, cevrimici, durumDegistir, iletisimPaylas, kapat }) {
    const karsi = konusma.karsi
    const [isaretli, setIsaretli] = useState(() => rehberOku(konusma.id))
    const musaitlik = karsi?.rol === 'yazilimci' && karsi?.musaitlik ? musaitlikBilgisi(karsi.musaitlik) : null
    const butce = konusma.ilan ? ucretAraligiGoster(konusma.ilan.butce_min, konusma.ilan.butce_max) : null
    const teklifDurumu = konusma.teklif ? TEKLIF_DURUMU[konusma.teklif.durum] : null
    const paylasilanlar = mesajlar.filter((m) => m.tur === 'iletisim' && !m.silindi && !m.gecici)
    const benPaylastim = paylasilanlar.some((m) => m.gonderen_id === benId)

    function rehberDegistir(id) {
        setIsaretli((liste) => {
            const yeni = liste.includes(id) ? liste.filter((x) => x !== id) : [...liste, id]
            try {
                localStorage.setItem(`kalfahane:rehber:${konusma.id}`, JSON.stringify(yeni))
            } catch {
                // Depolama kapalıysa yalnızca bu oturumda tutulur
            }
            return yeni
        })
    }

    const eylemler = [
        { alan: 'sabitlendi', ikon: 'sabitle', acik: 'Sabitlemeyi kaldır', kapali: 'Konuşmayı sabitle' },
        { alan: 'sessiz', ikon: konusma.ben.sessiz ? 'zil' : 'sessiz', acik: 'Bildirimleri aç', kapali: 'Sessize al' },
        { alan: 'arsivlendi', ikon: 'arsiv', acik: 'Arşivden çıkar', kapali: 'Arşivle' },
    ]

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex items-center justify-between px-5 h-[68px] shrink-0 border-b border-white/[0.07]">
                <h2 className="text-[15px] font-bold">Ayrıntılar</h2>
                <button onClick={kapat} aria-label="Ayrıntıları kapat" className="w-9 h-9 -mr-2 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-colors">
                    <Ikon ad="kapat" className="w-[18px] h-[18px]" />
                </button>
            </div>

            <div className="msj-kaydir flex-1 min-h-0">
                {/* Kişi */}
                <div className="px-5 pt-7 pb-6 flex flex-col items-center text-center">
                    <Avatar profil={karsi} boyut={76} cevrimici={cevrimici} />
                    <p className="mt-4 text-[17px] font-bold tracking-[-0.015em]">{karsi?.ad_soyad || 'Kalfahane üyesi'}</p>
                    <p className="mt-0.5 text-[12.5px] text-[#A1A1AA]">
                        {karsi?.unvan || (karsi?.rol === 'is-veren' ? 'İş veren' : 'Yazılımcı')}
                    </p>
                    <div className="mt-3 flex flex-wrap justify-center gap-1.5 text-[11.5px]">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 h-6 border border-white/[0.08] ${cevrimici ? 'text-[#86EFAC]' : 'text-[#A1A1AA]'}`}>
                            {cevrimici ? 'Çevrimiçi' : sonGorulmeMetni(karsi?.son_gorulme)}
                        </span>
                        {karsi?.konum && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 h-6 border border-white/[0.08] text-[#A1A1AA]">
                                <Ikon ad="konum" className="w-3 h-3" /> {karsi.konum}
                            </span>
                        )}
                        {musaitlik && (
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 h-6 border border-white/[0.08]" style={{ color: musaitlik.renk }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: musaitlik.renk }} /> {musaitlik.etiket}
                            </span>
                        )}
                    </div>
                    {karsi?.rol === 'yazilimci' && (
                        <Link to={`/ustalar/${karsi.id}`} className="isik isik-cam mt-5 inline-flex items-center gap-2 rounded-full h-9 px-4 text-[13px]">
                            <Ikon ad="kullanici" className="w-4 h-4" /> Profili gör
                        </Link>
                    )}
                </div>

                {/* İş bağlamı */}
                <Bolum baslik="Konuşmanın konusu">
                    {konusma.ilan ? (
                        <div className="flex flex-col gap-3">
                            <Link to={`/is-ilanlari/${konusma.ilan.id}`} className="group flex items-start gap-3 rounded-2xl p-3 -mx-1 hover:bg-white/[0.04] transition-colors">
                                <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#8B5CF6]/15 text-[#C4B5FD] shrink-0">
                                    <Ikon ad="belge" className="w-[18px] h-[18px]" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[13.5px] font-semibold leading-snug group-hover:text-[#DDD6FE] transition-colors">{konusma.ilan.baslik}</span>
                                    <span className="block mt-0.5 text-[12px] text-[#A1A1AA]">
                                        {ILAN_DURUMU[konusma.ilan.durum] || 'İlan'}{butce && ` · ${butce.replace(' / saat', ' bütçe')}`}
                                    </span>
                                </span>
                            </Link>
                            {konusma.teklif && (
                                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[12px] text-[#A1A1AA]">Teklif</span>
                                        {teklifDurumu && <span className={`rounded-full px-2.5 h-6 inline-flex items-center text-[11.5px] font-medium ${teklifDurumu.sinif}`}>{teklifDurumu.etiket}</span>}
                                    </div>
                                    {tutarGoster(konusma.teklif.teklif_tutari) && (
                                        <p className="mt-1 text-[20px] font-bold tracking-[-0.02em] tabular-nums">{tutarGoster(konusma.teklif.teklif_tutari)}</p>
                                    )}
                                    {konusma.teklif.mesaj && <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#A1A1AA] line-clamp-4">{konusma.teklif.mesaj}</p>}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-[12.5px] leading-relaxed text-[#A1A1AA]">Bir ilana bağlı olmayan doğrudan konuşma.</p>
                    )}
                </Bolum>

                {/* Paylaşılan iletişim */}
                <Bolum
                    baslik="Paylaşılan iletişim"
                    sag={!benPaylastim && (
                        <button onClick={iletisimPaylas} className="text-[12px] font-medium text-[#C4B5FD] hover:text-white transition-colors">Benimkini paylaş</button>
                    )}
                >
                    {paylasilanlar.length ? (
                        <div className="flex flex-col gap-2.5">
                            {paylasilanlar.map((m) => (
                                <IletisimKarti key={m.id} ek={m.ek} sahibi={m.gonderen_id === benId ? 'Sen' : karsi?.ad_soyad} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-[12.5px] leading-relaxed text-[#A1A1AA]">
                            Henüz paylaşılmadı. Anlaşmaya yaklaştığınızda telefon ya da e-postanızı bir kartla paylaşabilirsiniz.
                        </p>
                    )}
                </Bolum>

                {/* Anlaşma rehberi */}
                <Bolum baslik="Anlaşma rehberi" sag={<span className="text-[12px] tabular-nums text-[#A1A1AA]">{isaretli.length}/{REHBER.length} netleşti</span>}>
                    <ul className="flex flex-col gap-0.5" role="list">
                        {REHBER.map((r) => {
                            const secili = isaretli.includes(r.id)
                            return (
                                <li key={r.id}>
                                    <button
                                        role="checkbox"
                                        aria-checked={secili}
                                        onClick={() => rehberDegistir(r.id)}
                                        className="w-full flex items-start gap-3 rounded-xl px-2 py-2 -mx-2 text-left hover:bg-white/[0.04] transition-colors"
                                    >
                                        <span data-secili={secili ? "true" : "false"} className="msj-onay mt-[1px] w-[18px] h-[18px] rounded-md border border-white/[0.22] flex items-center justify-center shrink-0">
                                            {secili && <Ikon ad="tik" kalinlik={2.6} className="w-3 h-3 text-white" />}
                                        </span>
                                        <span className={`text-[13px] leading-snug ${secili ? 'text-[#A1A1AA] line-through decoration-white/25' : 'text-[#E4E4E7]'}`}>{r.metin}</span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                    <p className="mt-3 text-[11.5px] leading-relaxed text-[#8E8E99]">Bu liste yalnızca senin cihazında tutulur.</p>
                </Bolum>

                {/* Güvenli anlaşma */}
                <Bolum baslik="Güvenli anlaşma">
                    <div className="flex items-start gap-3">
                        <Ikon ad="kalkan" className="w-5 h-5 text-[#86EFAC] shrink-0 mt-0.5" />
                        <ul className="flex flex-col gap-2 text-[12.5px] leading-relaxed text-[#C9C9D1]">
                            <li>Kalfahane şimdilik ödeme almaz ve aracılık etmez. Ödemeyi kendi aranızda yaparsınız.</li>
                            <li>Büyük işlerde ödemeyi aşamalara bölün; her teslimden sonra ödeme yapın.</li>
                            <li>Şifre, banka kartı ya da doğrulama kodu kimseyle paylaşılmaz.</li>
                        </ul>
                    </div>
                </Bolum>

                {/* Konuşma ayarları */}
                <section className="px-3 py-4 border-t border-white/[0.07]">
                    {eylemler.map((e) => {
                        const acik = konusma.ben[e.alan]
                        return (
                            <button
                                key={e.alan}
                                onClick={() => durumDegistir(e.alan, !acik)}
                                className="w-full flex items-center gap-3 rounded-xl px-3 h-11 text-[13.5px] text-[#D4D4D8] hover:text-white hover:bg-white/[0.05] transition-colors"
                            >
                                <Ikon ad={e.ikon} className={`w-[18px] h-[18px] ${acik ? 'text-[#C4B5FD]' : 'text-[#A1A1AA]'}`} />
                                {acik ? e.acik : e.kapali}
                            </button>
                        )
                    })}
                </section>
            </div>
        </div>
    )
}

export default BaglamPaneli
