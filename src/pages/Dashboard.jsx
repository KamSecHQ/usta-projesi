import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import {
    kidemRozetiHesapla,
    sonrakiKidemHesapla,
    tamamlananIsSayisiGetir,
} from '../ustaYardimcilari'

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad.split(" ").filter(Boolean).slice(0, 2).map((k) => k[0].toUpperCase()).join("")
}

function OzetKart({ baslik, children }) {
    return (
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6">
            <h2 className="text-[#F3ECE1] font-semibold mb-4">{baslik}</h2>
            {children}
        </div>
    )
}

function Dashboard() {
    useSayfaBasligi('Panelim')
    const { user, yukleniyor: authYukleniyor } = useAuth()

    const [profil, setProfil] = useState(null)
    const [projeSayisi, setProjeSayisi] = useState(0)
    const [favoriSayisi, setFavoriSayisi] = useState(0)
    const [kidem, setKidem] = useState(null)
    const [sonrakiKidem, setSonrakiKidem] = useState(null)

    const [teklifOzet, setTeklifOzet] = useState({ beklemede: 0, kabul_edildi: 0, reddedildi: 0 })
    const [ilanOzet, setIlanOzet] = useState({ acik: 0, devamEdiyor: 0, tamamlandi: 0, bekleyenTeklif: 0 })
    const [ajansDavetleri, setAjansDavetleri] = useState([])

    const [yukleniyor, setYukleniyor] = useState(true)

    async function veriGetir() {
        if (!user) return

        const { data: profilData } = await supabase
            .from('profiller')
            .select('*')
            .eq('id', user.id)
            .single()

        if (!profilData) {
            setYukleniyor(false)
            return
        }
        setProfil(profilData)

        const tamamlanan = await tamamlananIsSayisiGetir(supabase, user.id, profilData.rol)
        setKidem(kidemRozetiHesapla(profilData.rol, tamamlanan))
        setSonrakiKidem(sonrakiKidemHesapla(profilData.rol, tamamlanan))

        if (profilData.rol === 'yazilimci') {
            const { count: pSayisi } = await supabase
                .from('projeler')
                .select('*', { count: 'exact', head: true })
                .eq('kullanici_id', user.id)
            setProjeSayisi(pSayisi || 0)

            const { count: fSayisi } = await supabase
                .from('favoriler')
                .select('*', { count: 'exact', head: true })
                .eq('usta_id', user.id)
            setFavoriSayisi(fSayisi || 0)

            const { data: teklifler } = await supabase
                .from('teklifler')
                .select('durum')
                .eq('yazilimci_id', user.id)

            const ozet = { beklemede: 0, kabul_edildi: 0, reddedildi: 0 }
            for (const t of teklifler || []) ozet[t.durum] = (ozet[t.durum] || 0) + 1
            setTeklifOzet(ozet)

            const { data: davetlerData } = await supabase
                .from('ajans_davetleri')
                .select('*, profiller!ajans_davetleri_ajans_id_fkey(ad_soyad, unvan)')
                .eq('davet_edilen_id', user.id)
                .eq('durum', 'beklemede')
            setAjansDavetleri(davetlerData || [])
        }

        if (profilData.rol === 'is-veren') {
            const { data: ilanlar } = await supabase
                .from('ilanlar')
                .select('id, durum')
                .eq('is_veren_id', user.id)

            const acik = (ilanlar || []).filter((i) => i.durum === 'acik').length
            const devamEdiyor = (ilanlar || []).filter((i) => i.durum === 'devam_ediyor').length
            const tamamlandi = (ilanlar || []).filter((i) => i.durum === 'tamamlandi').length

            let bekleyenTeklif = 0
            if (ilanlar && ilanlar.length > 0) {
                const { count } = await supabase
                    .from('teklifler')
                    .select('*', { count: 'exact', head: true })
                    .in('ilan_id', ilanlar.map((i) => i.id))
                    .eq('durum', 'beklemede')
                bekleyenTeklif = count || 0
            }
            setIlanOzet({ acik, devamEdiyor, tamamlandi, bekleyenTeklif })
        }

        setYukleniyor(false)
    }

    useEffect(() => {
        if (user) veriGetir()
    }, [user])

    async function davetYanitla(davetId, yeniDurum) {
        await supabase.from('ajans_davetleri').update({ durum: yeniDurum }).eq('id', davetId)
        veriGetir()
    }

    if (authYukleniyor || yukleniyor) {
        return <div className="min-h-screen bg-[#0D2626] flex items-center justify-center text-[#9FC2BC]">Yükleniyor...</div>
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0D2626] flex flex-col items-center justify-center text-center px-6">
                <p className="text-[#9FC2BC] mb-4">Panelini görmek için giriş yapmalısın.</p>
                <Link to="/giris" className="text-[#C97D3C] hover:underline">Giriş yap</Link>
            </div>
        )
    }

    if (!profil) return null

    // Profil tamamlanma yüzdesi (sadece yazılımcı için anlamlı) — gerçek alan
    // doluluğuna dayalı, sahte bir sayı değil.
    const tamamlanmaAlanlari = profil.rol === 'yazilimci' ? [
        { etiket: 'Unvan', dolu: !!profil.unvan },
        { etiket: 'Hakkımda yazısı', dolu: !!profil.bio },
        { etiket: 'En az 1 teknoloji', dolu: (profil.teknolojiler || []).length > 0 },
        { etiket: 'GitHub linki', dolu: !!profil.github_url },
        { etiket: 'Konum', dolu: !!profil.konum },
        { etiket: 'Telefon', dolu: !!profil.telefon },
        { etiket: 'Saatlik ücret aralığı', dolu: !!(profil.saatlik_ucret_min || profil.saatlik_ucret_max) },
        { etiket: 'En az 1 proje', dolu: projeSayisi > 0 },
    ] : []
    const tamamlananSayi = tamamlanmaAlanlari.filter((a) => a.dolu).length
    const tamamlanmaYuzdesi = tamamlanmaAlanlari.length > 0
        ? Math.round((tamamlananSayi / tamamlanmaAlanlari.length) * 100)
        : 100
    const eksikAlanlar = tamamlanmaAlanlari.filter((a) => !a.dolu)

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">
                    ← Anasayfaya dön
                </Link>

                {/* Başlık */}
                <div className="flex items-center gap-4 mt-6 mb-10 flex-wrap">
                    <div
                        className="w-16 h-16 rounded-full p-[2px] shrink-0"
                        style={{ background: kidem ? `linear-gradient(135deg, ${kidem.renk}, transparent)` : 'transparent' }}
                    >
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#C97D3C] to-[#E3B776] flex items-center justify-center text-[#0D2626] font-bold text-xl">
                            {baslangicHarfleri(profil.ad_soyad)}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-[#F3ECE1] text-2xl font-bold">
                            Merhaba, {profil.ad_soyad || 'Usta'}
                        </h1>
                        <div className="flex items-center gap-2 flex-wrap mt-1.5">
                            {kidem && (
                                <span
                                    className="text-xs font-semibold px-3 py-1 rounded-full border"
                                    style={{ color: kidem.renk, borderColor: `${kidem.renk}50`, backgroundColor: `${kidem.renk}12` }}
                                >
                                    {kidem.etiket}
                                </span>
                            )}
                            {profil.rol === 'yazilimci' && (
                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${profil.onayli ? "bg-[#4ADE80]/10 text-[#4ADE80]" : "bg-white/[0.06] text-[#9FC2BC]"}`}>
                                    {profil.onayli ? "✓ Onaylı Usta" : "Onay Bekliyor"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">

                    {/* Kıdem ilerlemesi — herkes için */}
                    <OzetKart baslik="Kıdem İlerlemen">
                        {sonrakiKidem ? (
                            <>
                                <p className="text-[#9FC2BC] text-sm mb-3">
                                    <span style={{ color: sonrakiKidem.renk }} className="font-semibold">{sonrakiKidem.etiket}</span> rozetine{" "}
                                    <span className="text-[#F3ECE1] font-semibold">{sonrakiKidem.kalan}</span> tamamlanmış iş kaldı.
                                </p>
                                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.max(8, 100 - (sonrakiKidem.kalan / (sonrakiKidem.kalan + 1)) * 100)}%`,
                                            backgroundColor: kidem?.renk || '#C97D3C',
                                        }}
                                    />
                                </div>
                            </>
                        ) : (
                            <p className="text-[#E3B776] text-sm">🏆 En üst kıdem seviyesindesin.</p>
                        )}
                    </OzetKart>

                    {/* Yazılımcıya özel: profil tamamlanma */}
                    {profil.rol === 'yazilimci' && (
                        <OzetKart baslik="Profil Tamamlanma">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-2 flex-1 bg-white/[0.06] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#C97D3C] rounded-full transition-all duration-500"
                                        style={{ width: `${tamamlanmaYuzdesi}%` }}
                                    />
                                </div>
                                <span className="text-[#F3ECE1] text-sm font-semibold shrink-0">{tamamlanmaYuzdesi}%</span>
                            </div>
                            {eksikAlanlar.length > 0 ? (
                                <div className="flex flex-col gap-1.5">
                                    {eksikAlanlar.map((a) => (
                                        <Link key={a.etiket} to="/profilim" className="text-[#9FC2BC] text-xs hover:text-[#C97D3C] transition-colors">
                                            + {a.etiket} ekle
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[#4ADE80] text-sm">✓ Profilin eksiksiz görünüyor.</p>
                            )}
                        </OzetKart>
                    )}

                    {/* Yazılımcıya özel: teklifler özeti */}
                    {profil.rol === 'yazilimci' && (
                        <OzetKart baslik="Tekliflerim">
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <div className="text-[#F3ECE1] text-2xl font-bold">{teklifOzet.beklemede}</div>
                                    <div className="text-[#9FC2BC] text-xs mt-1">Beklemede</div>
                                </div>
                                <div>
                                    <div className="text-[#4ADE80] text-2xl font-bold">{teklifOzet.kabul_edildi}</div>
                                    <div className="text-[#9FC2BC] text-xs mt-1">Kabul Edildi</div>
                                </div>
                                <div>
                                    <div className="text-[#9FC2BC]/60 text-2xl font-bold">{teklifOzet.reddedildi}</div>
                                    <div className="text-[#9FC2BC] text-xs mt-1">Reddedildi</div>
                                </div>
                            </div>
                            <Link to="/tekliflerim" className="text-[#C97D3C] text-sm hover:underline mt-4 inline-block">
                                Tüm tekliflerimi gör →
                            </Link>
                        </OzetKart>
                    )}

                    {/* Yazılımcıya özel: favori sayısı */}
                    {profil.rol === 'yazilimci' && (
                        <OzetKart baslik="Favorilenme">
                            <div className="flex items-center gap-3">
                                <span className="text-[#F3ECE1] text-3xl font-bold">{favoriSayisi}</span>
                                <span className="text-[#9FC2BC] text-sm">kişi seni favorilerine ekledi</span>
                            </div>
                        </OzetKart>
                    )}

                    {/* Yazılımcıya özel: bekleyen ajans davetleri */}
                    {profil.rol === 'yazilimci' && ajansDavetleri.length > 0 && (
                        <OzetKart baslik="Ajans Davetlerin">
                            <div className="flex flex-col gap-2">
                                {ajansDavetleri.map((d) => (
                                    <div key={d.id} className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
                                        <div className="min-w-0">
                                            <div className="text-[#F3ECE1] text-sm truncate">{d.profiller?.ad_soyad}</div>
                                            <div className="text-[#9FC2BC]/70 text-xs">Ajansına katılmanı istiyor{d.rol_aciklamasi ? ` · ${d.rol_aciklamasi}` : ''}</div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => davetYanitla(d.id, 'kabul_edildi')} className="bg-[#C97D3C] text-[#0D2626] text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#E3B776] transition-all duration-300">
                                                Kabul Et
                                            </button>
                                            <button onClick={() => davetYanitla(d.id, 'reddedildi')} className="border border-white/[0.1] text-[#9FC2BC] text-xs px-3 py-1.5 rounded-full hover:text-red-300 transition-all duration-300">
                                                Reddet
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </OzetKart>
                    )}

                    {/* İş verene özel: ilan özeti */}
                    {profil.rol === 'is-veren' && (
                        <OzetKart baslik="İlanlarım">
                            <div className="grid grid-cols-3 gap-3 text-center mb-4">
                                <div>
                                    <div className="text-[#F3ECE1] text-2xl font-bold">{ilanOzet.acik}</div>
                                    <div className="text-[#9FC2BC] text-xs mt-1">Açık</div>
                                </div>
                                <div>
                                    <div className="text-[#E3B776] text-2xl font-bold">{ilanOzet.devamEdiyor}</div>
                                    <div className="text-[#9FC2BC] text-xs mt-1">Devam Ediyor</div>
                                </div>
                                <div>
                                    <div className="text-[#4ADE80] text-2xl font-bold">{ilanOzet.tamamlandi}</div>
                                    <div className="text-[#9FC2BC] text-xs mt-1">Tamamlandı</div>
                                </div>
                            </div>
                            <Link to="/ilanlarim" className="text-[#C97D3C] text-sm hover:underline">
                                İlanlarımı yönet →
                            </Link>
                        </OzetKart>
                    )}

                    {/* İş verene özel: aksiyon gereken teklifler */}
                    {profil.rol === 'is-veren' && (
                        <OzetKart baslik="Bekleyen Teklifler">
                            {ilanOzet.bekleyenTeklif > 0 ? (
                                <>
                                    <p className="text-[#9FC2BC] text-sm mb-3">
                                        <span className="text-[#F3ECE1] font-semibold">{ilanOzet.bekleyenTeklif}</span> teklif senin cevabını bekliyor.
                                    </p>
                                    <Link to="/ilanlarim" className="bg-[#C97D3C] text-[#0D2626] font-semibold text-sm px-4 py-2 rounded-full inline-block hover:bg-[#E3B776] transition-all duration-300">
                                        Şimdi İncele
                                    </Link>
                                </>
                            ) : (
                                <p className="text-[#9FC2BC] text-sm">Bekleyen teklif yok.</p>
                            )}
                        </OzetKart>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
