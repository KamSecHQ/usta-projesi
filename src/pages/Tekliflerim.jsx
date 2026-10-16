import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import { zamanFarki } from '../ustaYardimcilari'

function Tekliflerim() {
    useSayfaBasligi('Tekliflerim')
    const { user, yukleniyor: authYukleniyor } = useAuth()
    const [teklifler, setTeklifler] = useState([])
    const [yukleniyor, setYukleniyor] = useState(true)

    useEffect(() => {
        async function veriGetir() {
            if (!user) return
            const { data, error } = await supabase
                .from('teklifler')
                .select('*, ilanlar(id, baslik, durum)')
                .eq('yazilimci_id', user.id)
                .order('created_at', { ascending: false })

            if (!error) setTeklifler(data)
            setYukleniyor(false)
        }
        if (user) veriGetir()
    }, [user])

    if (authYukleniyor || yukleniyor) {
        return <div className="min-h-screen bg-[#000000] flex items-center justify-center text-[#A1A1AA]">Yükleniyor...</div>
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-center px-6">
                <p className="text-[#A1A1AA] mb-4">Tekliflerini görmek için giriş yapmalısın.</p>
                <Link to="/giris" className="text-[#A78BFA] hover:underline">Giriş yap</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#000000] px-6 py-16">
            <div className="max-w-2xl mx-auto">
                <Link to="/is-ilanlari" className="text-[#A1A1AA] text-sm hover:text-[#FFFFFF] transition-colors">
                    ← İlanlara dön
                </Link>
                <h1 className="text-[#FFFFFF] text-3xl font-bold mt-6 mb-10">Tekliflerim</h1>

                {teklifler.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-[#A1A1AA] mb-4">Henüz teklif göndermedin.</p>
                        <Link to="/is-ilanlari" className="text-[#A78BFA] hover:underline text-sm">İlanlara göz at →</Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {teklifler.map((teklif) => (
                            <div key={teklif.id} className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-5">
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div>
                                        <Link to={`/is-ilanlari/${teklif.ilanlar?.id}`} className="text-[#FFFFFF] font-semibold hover:text-[#A78BFA] transition-colors">
                                            {teklif.ilanlar?.baslik || "İlan silinmiş"}
                                        </Link>
                                        <p className="text-[#A1A1AA]/50 text-xs mt-1">{zamanFarki(teklif.created_at)}</p>
                                    </div>
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ${teklif.durum === 'kabul_edildi' ? 'bg-[#4ADE80]/10 text-[#4ADE80]' :
                                        teklif.durum === 'reddedildi' ? 'bg-red-400/10 text-red-300' :
                                            'bg-white/[0.06] text-[#A1A1AA]'
                                        }`}>
                                        {teklif.durum === 'kabul_edildi' ? '✓ Kabul edildi' : teklif.durum === 'reddedildi' ? 'Reddedildi' : 'Beklemede'}
                                    </span>
                                </div>
                                {teklif.teklif_tutari && <p className="text-[#C4B5FD] text-sm mt-2">₺{teklif.teklif_tutari}</p>}
                                {teklif.mesaj && <p className="text-[#A1A1AA] text-sm mt-2">{teklif.mesaj}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Tekliflerim
