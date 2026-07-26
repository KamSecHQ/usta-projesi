import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import { ucretAraligiGoster, zamanFarki } from '../ustaYardimcilari'

function IlanDetay() {
    const { id } = useParams()
    const { user } = useAuth()
    const [ilan, setIlan] = useState(null)
    const [isVeren, setIsVeren] = useState(null)
    const [rol, setRol] = useState(null)
    const [kendiTeklifim, setKendiTeklifim] = useState(null)
    const [yukleniyor, setYukleniyor] = useState(true)
    const [bulunamadi, setBulunamadi] = useState(false)

    const [teklifMesaji, setTeklifMesaji] = useState("")
    const [teklifTutari, setTeklifTutari] = useState("")
    const [gonderiliyor, setGonderiliyor] = useState(false)
    const [gonderildi, setGonderildi] = useState(false)

    useSayfaBasligi(ilan ? ilan.baslik : "İş İlanı")

    async function veriGetir() {
        const { data: ilanData, error } = await supabase.from('ilanlar').select('*').eq('id', id).single()
        if (error || !ilanData) {
            setBulunamadi(true)
            setYukleniyor(false)
            return
        }
        setIlan(ilanData)

        const { data: isVerenData } = await supabase
            .from('profiller')
            .select('id, ad_soyad, unvan')
            .eq('id', ilanData.is_veren_id)
            .single()
        setIsVeren(isVerenData)

        if (user) {
            const { data: profilData } = await supabase.from('profiller').select('rol').eq('id', user.id).single()
            setRol(profilData?.rol || null)

            const { data: teklifData } = await supabase
                .from('teklifler')
                .select('*')
                .eq('ilan_id', id)
                .eq('yazilimci_id', user.id)
                .maybeSingle()
            setKendiTeklifim(teklifData)
        }

        setYukleniyor(false)
    }

    useEffect(() => {
        veriGetir()
    }, [id, user])

    async function teklifGonder(e) {
        e.preventDefault()
        setGonderiliyor(true)
        const { error } = await supabase.from('teklifler').insert({
            ilan_id: id,
            yazilimci_id: user.id,
            mesaj: teklifMesaji || null,
            teklif_tutari: teklifTutari === "" ? null : Number(teklifTutari),
        })
        setGonderiliyor(false)
        if (!error) {
            setGonderildi(true)
            veriGetir()
        }
    }

    if (yukleniyor) {
        return <div className="min-h-screen bg-[#0D2626] flex items-center justify-center text-[#9FC2BC]">Yükleniyor...</div>
    }

    if (bulunamadi) {
        return (
            <div className="min-h-screen bg-[#0D2626] flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-[#F3ECE1] text-2xl font-bold mb-3">İlan bulunamadı</h1>
                <Link to="/is-ilanlari" className="text-[#C97D3C] hover:underline">← İlanlara dön</Link>
            </div>
        )
    }

    const teknolojiler = ilan.gerekli_teknolojiler || []
    const butce = ucretAraligiGoster(ilan.butce_min, ilan.butce_max)
    const kendiIlaniMi = user && ilan.is_veren_id === user.id

    const inputClass = "w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]/60 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-[#9FC2BC]/40"

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-2xl mx-auto">
                <Link to="/is-ilanlari" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">
                    ← İlanlara dön
                </Link>

                <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 mt-6 mb-6">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <h1 className="text-[#F3ECE1] text-2xl font-bold">{ilan.baslik}</h1>
                        {ilan.durum !== 'acik' && (
                            <span className="text-[#9FC2BC] text-xs border border-white/[0.1] px-3 py-1 rounded-full">
                                {ilan.durum === 'tamamlandi' ? 'Tamamlandı' : 'Kapalı'}
                            </span>
                        )}
                    </div>

                    {isVeren && (
                        <p className="text-[#9FC2BC] text-sm mt-2">
                            İlan sahibi: <span className="text-[#F3ECE1]">{isVeren.ad_soyad || "İş Veren"}</span>
                        </p>
                    )}
                    <p className="text-[#9FC2BC]/50 text-xs mt-1">{zamanFarki(ilan.created_at)}</p>

                    {ilan.aciklama && (
                        <p className="text-[#9FC2BC] leading-relaxed mt-6 whitespace-pre-line">{ilan.aciklama}</p>
                    )}

                    {butce && (
                        <p className="text-[#E3B776] font-medium mt-6">{butce.replace(' / saat', ' bütçe')}</p>
                    )}

                    {teknolojiler.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-4">
                            {teknolojiler.map((t) => (
                                <span key={t} className="text-[#9FC2BC] text-xs border border-white/[0.1] px-3 py-1 rounded-full font-mono">{t}</span>
                            ))}
                        </div>
                    )}
                </div>

                {kendiIlaniMi ? (
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-center">
                        <p className="text-[#9FC2BC] text-sm mb-3">Bu senin ilanın.</p>
                        <Link to="/ilanlarim" className="text-[#C97D3C] hover:underline text-sm">
                            Gelen teklifleri görmek için İlanlarım'a git →
                        </Link>
                    </div>
                ) : !user ? (
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-center">
                        <p className="text-[#9FC2BC] text-sm mb-3">Teklif verebilmek için giriş yapmalısın.</p>
                        <Link to="/giris" className="text-[#C97D3C] hover:underline text-sm">Giriş yap</Link>
                    </div>
                ) : rol !== 'yazilimci' ? (
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-center">
                        <p className="text-[#9FC2BC] text-sm">Teklif vermek için yazılımcı hesabı gerekiyor.</p>
                    </div>
                ) : kendiTeklifim ? (
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                        <h2 className="text-[#F3ECE1] font-semibold mb-2">Teklifin gönderildi</h2>
                        {kendiTeklifim.teklif_tutari && (
                            <p className="text-[#E3B776] text-sm mb-2">Teklifin: ₺{kendiTeklifim.teklif_tutari}</p>
                        )}
                        {kendiTeklifim.mesaj && <p className="text-[#9FC2BC] text-sm mb-3">{kendiTeklifim.mesaj}</p>}
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${kendiTeklifim.durum === 'kabul_edildi' ? 'bg-[#4ADE80]/10 text-[#4ADE80]' :
                            kendiTeklifim.durum === 'reddedildi' ? 'bg-red-400/10 text-red-300' :
                                'bg-white/[0.06] text-[#9FC2BC]'
                            }`}>
                            {kendiTeklifim.durum === 'kabul_edildi' ? '✓ Kabul edildi' : kendiTeklifim.durum === 'reddedildi' ? 'Reddedildi' : 'Beklemede'}
                        </span>
                    </div>
                ) : ilan.durum !== 'acik' ? (
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-center">
                        <p className="text-[#9FC2BC] text-sm">Bu ilan artık teklif kabul etmiyor.</p>
                    </div>
                ) : (
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6">
                        <h2 className="text-[#F3ECE1] font-semibold mb-4">Teklif Ver</h2>
                        <form onSubmit={teklifGonder} className="flex flex-col gap-3">
                            <textarea
                                value={teklifMesaji}
                                onChange={(e) => setTeklifMesaji(e.target.value)}
                                rows={4}
                                placeholder="Neden sen doğru kişisin, nasıl yaklaşırsın kısaca anlat..."
                                className={inputClass + " resize-none"}
                            />
                            <input
                                type="number"
                                min="0"
                                value={teklifTutari}
                                onChange={(e) => setTeklifTutari(e.target.value)}
                                placeholder="Teklif tutarın (₺, isteğe bağlı)"
                                className={inputClass}
                            />
                            <button
                                type="submit"
                                disabled={gonderiliyor}
                                className="bg-[#C97D3C] text-[#0D2626] font-semibold px-6 py-3 rounded-full disabled:opacity-50 hover:bg-[#E3B776] transition-all duration-300 self-start"
                            >
                                {gonderiliyor ? "Gönderiliyor..." : "Teklifi Gönder"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}

export default IlanDetay
