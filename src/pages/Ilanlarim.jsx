import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import { ucretAraligiGoster, zamanFarki } from '../ustaYardimcilari'

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad.split(" ").filter(Boolean).slice(0, 2).map((k) => k[0].toUpperCase()).join("")
}

function TeklifSatiri({ teklif, onKabulEt, onReddet }) {
    return (
        <div className="flex items-start justify-between gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <div className="flex gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] flex items-center justify-center text-[#050505] text-xs font-bold shrink-0">
                    {baslangicHarfleri(teklif.profiller?.ad_soyad)}
                </div>
                <div className="min-w-0">
                    <Link to={`/ustalar/${teklif.yazilimci_id}`} className="text-[#FFFFFF] text-sm font-medium hover:text-[#A78BFA] transition-colors">
                        {teklif.profiller?.ad_soyad || "Yazılımcı"}
                    </Link>
                    {teklif.teklif_tutari && <p className="text-[#C4B5FD] text-sm mt-0.5">₺{teklif.teklif_tutari}</p>}
                    {teklif.mesaj && <p className="text-[#A1A1AA] text-sm mt-1">{teklif.mesaj}</p>}
                </div>
            </div>
            <div className="shrink-0">
                {teklif.durum === 'beklemede' ? (
                    <div className="flex gap-2">
                        <button onClick={() => onKabulEt(teklif.id)} className="bg-[#FDFDFD] text-[#050505] text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#FFFFFF] transition-all duration-300">
                            Kabul Et
                        </button>
                        <button onClick={() => onReddet(teklif.id)} className="border border-white/[0.1] text-[#A1A1AA] text-xs px-3 py-1.5 rounded-full hover:text-red-300 hover:border-red-300/40 transition-all duration-300">
                            Reddet
                        </button>
                    </div>
                ) : (
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${teklif.durum === 'kabul_edildi' ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'bg-red-400/10 text-red-300'}`}>
                        {teklif.durum === 'kabul_edildi' ? '✓ Kabul edildi' : 'Reddedildi'}
                    </span>
                )}
            </div>
        </div>
    )
}

function Ilanlarim() {
    useSayfaBasligi('İlanlarım')
    const { user, yukleniyor: authYukleniyor } = useAuth()
    const [ilanlar, setIlanlar] = useState([])
    const [teklifler, setTeklifler] = useState({})
    const [yukleniyor, setYukleniyor] = useState(true)

    async function veriGetir() {
        if (!user) return
        const { data: ilanData, error } = await supabase
            .from('ilanlar')
            .select('*')
            .eq('is_veren_id', user.id)
            .order('created_at', { ascending: false })

        if (!error && ilanData) {
            setIlanlar(ilanData)
            const teklifMap = {}
            for (const ilan of ilanData) {
                const { data: teklifData } = await supabase
                    .from('teklifler')
                    .select('*, profiller!teklifler_yazilimci_id_fkey(ad_soyad)')
                    .eq('ilan_id', ilan.id)
                    .order('created_at', { ascending: false })
                teklifMap[ilan.id] = teklifData || []
            }
            setTeklifler(teklifMap)
        }
        setYukleniyor(false)
    }

    useEffect(() => {
        if (user) veriGetir()
    }, [user])

    async function teklifDurumGuncelle(teklifId, yeniDurum) {
        await supabase.from('teklifler').update({ durum: yeniDurum }).eq('id', teklifId)
        veriGetir()
    }

    async function ilanDurumGuncelle(ilanId, yeniDurum) {
        await supabase.from('ilanlar').update({ durum: yeniDurum }).eq('id', ilanId)
        veriGetir()
    }

    if (authYukleniyor || yukleniyor) {
        return <div className="min-h-screen bg-[#000000] flex items-center justify-center text-[#A1A1AA]">Yükleniyor...</div>
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-center px-6">
                <p className="text-[#A1A1AA] mb-4">İlanlarını görmek için giriş yapmalısın.</p>
                <Link to="/giris" className="text-[#A78BFA] hover:underline">Giriş yap</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#000000] px-6 py-16">
            <div className="max-w-3xl mx-auto">
                <Link to="/is-ilanlari" className="text-[#A1A1AA] text-sm hover:text-[#FFFFFF] transition-colors">
                    ← İlanlara dön
                </Link>
                <div className="flex items-center justify-between flex-wrap gap-4 mt-6 mb-10">
                    <h1 className="text-[#FFFFFF] text-3xl font-bold">İlanlarım</h1>
                    <Link to="/ilan-ver" className="bg-[#FDFDFD] text-[#050505] font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#FFFFFF] transition-all duration-300">
                        + Yeni İlan
                    </Link>
                </div>

                {ilanlar.length === 0 ? (
                    <p className="text-[#A1A1AA] text-sm">Henüz ilan vermedin.</p>
                ) : (
                    <div className="flex flex-col gap-6">
                        {ilanlar.map((ilan) => {
                            const butce = ucretAraligiGoster(ilan.butce_min, ilan.butce_max)
                            const ilanTeklifleri = teklifler[ilan.id] || []
                            return (
                                <div key={ilan.id} className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6">
                                    <div className="flex items-start justify-between gap-3 flex-wrap">
                                        <div>
                                            <Link to={`/is-ilanlari/${ilan.id}`} className="text-[#FFFFFF] font-semibold hover:text-[#A78BFA] transition-colors">
                                                {ilan.baslik}
                                            </Link>
                                            <p className="text-[#A1A1AA]/50 text-xs mt-1">{zamanFarki(ilan.created_at)} · {ilanTeklifleri.length} teklif</p>
                                            {butce && <p className="text-[#C4B5FD] text-sm mt-1">{butce.replace(' / saat', ' bütçe')}</p>}
                                        </div>
                                        <select
                                            value={ilan.durum}
                                            onChange={(e) => ilanDurumGuncelle(ilan.id, e.target.value)}
                                            className="bg-white/[0.05] border border-white/[0.1] text-[#A1A1AA] text-xs rounded-full px-3 py-1.5 outline-none"
                                        >
                                            <option value="acik">Açık</option>
                                            <option value="kapali">Kapalı</option>
                                            <option value="tamamlandi">Tamamlandı</option>
                                        </select>
                                    </div>

                                    {ilanTeklifleri.length > 0 && (
                                        <div className="flex flex-col gap-2 mt-5 pt-5 border-t border-white/[0.06]">
                                            {ilanTeklifleri.map((teklif) => (
                                                <TeklifSatiri
                                                    key={teklif.id}
                                                    teklif={teklif}
                                                    onKabulEt={(id) => teklifDurumGuncelle(id, 'kabul_edildi')}
                                                    onReddet={(id) => teklifDurumGuncelle(id, 'reddedildi')}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Ilanlarim
