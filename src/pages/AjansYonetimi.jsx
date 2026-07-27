import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad.split(" ").filter(Boolean).slice(0, 2).map((k) => k[0].toUpperCase()).join("")
}

function AjansYonetimi() {
    useSayfaBasligi('Ajansım')
    const { user, yukleniyor: authYukleniyor } = useAuth()

    const [profil, setProfil] = useState(null)
    const [uyeler, setUyeler] = useState([])
    const [bekleyenDavetler, setBekleyenDavetler] = useState([])
    const [yukleniyor, setYukleniyor] = useState(true)
    const [gecisYapiliyor, setGecisYapiliyor] = useState(false)

    const [aramaMetni, setAramaMetni] = useState("")
    const [aramaSonuclari, setAramaSonuclari] = useState([])
    const [rolAciklamasi, setRolAciklamasi] = useState("")
    const [davetGonderiliyor, setDavetGonderiliyor] = useState(false)
    const [hata, setHata] = useState("")

    async function veriGetir() {
        if (!user) return
        const { data: profilData } = await supabase.from('profiller').select('*').eq('id', user.id).single()
        setProfil(profilData)

        if (profilData?.profil_tipi === 'ajans') {
            const { data: davetlerData } = await supabase
                .from('ajans_davetleri')
                .select('*, profiller!ajans_davetleri_davet_edilen_id_fkey(ad_soyad, unvan)')
                .eq('ajans_id', user.id)
                .order('created_at', { ascending: false })

            setUyeler((davetlerData || []).filter((d) => d.durum === 'kabul_edildi'))
            setBekleyenDavetler((davetlerData || []).filter((d) => d.durum === 'beklemede'))
        }
        setYukleniyor(false)
    }

    useEffect(() => {
        if (user) veriGetir()
    }, [user])

    async function ajansModunaGec() {
        setGecisYapiliyor(true)
        await supabase.from('profiller').update({ profil_tipi: 'ajans' }).eq('id', user.id)
        setGecisYapiliyor(false)
        veriGetir()
    }

    async function bireyselModaDon() {
        if (!confirm('Bireysel moda dönersen ajans profili herkese açık görünmeyecek. Emin misin?')) return
        await supabase.from('profiller').update({ profil_tipi: 'bireysel' }).eq('id', user.id)
        veriGetir()
    }

    async function ustaAra(metin) {
        setAramaMetni(metin)
        if (metin.trim().length < 2) {
            setAramaSonuclari([])
            return
        }
        const { data } = await supabase
            .from('profiller')
            .select('id, ad_soyad, unvan')
            .eq('rol', 'yazilimci')
            .eq('onayli', true)
            .neq('id', user.id)
            .ilike('ad_soyad', `%${metin}%`)
            .limit(5)
        setAramaSonuclari(data || [])
    }

    async function davetGonder(davetEdilenId) {
        setDavetGonderiliyor(true)
        setHata("")
        const { error } = await supabase.from('ajans_davetleri').insert({
            ajans_id: user.id,
            davet_edilen_id: davetEdilenId,
            rol_aciklamasi: rolAciklamasi || null,
        })
        setDavetGonderiliyor(false)
        if (error) {
            setHata(error.code === '23505' ? 'Bu kişiye zaten davet gönderilmiş.' : error.message)
        } else {
            setAramaMetni("")
            setAramaSonuclari([])
            setRolAciklamasi("")
            veriGetir()
        }
    }

    async function daveteIptalEt(davetId) {
        await supabase.from('ajans_davetleri').delete().eq('id', davetId)
        veriGetir()
    }

    async function uyeCikar(davetId) {
        if (!confirm('Bu üyeyi ajanstan çıkarmak istediğine emin misin?')) return
        await supabase.from('ajans_davetleri').delete().eq('id', davetId)
        veriGetir()
    }

    if (authYukleniyor || yukleniyor) {
        return <div className="min-h-screen bg-[#0D2626] flex items-center justify-center text-[#9FC2BC]">Yükleniyor...</div>
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0D2626] flex flex-col items-center justify-center text-center px-6">
                <p className="text-[#9FC2BC] mb-4">Ajans yönetimini görmek için giriş yapmalısın.</p>
                <Link to="/giris" className="text-[#C97D3C] hover:underline">Giriş yap</Link>
            </div>
        )
    }

    if (profil?.rol !== 'yazilimci') {
        return (
            <div className="min-h-screen bg-[#0D2626] flex flex-col items-center justify-center text-center px-6">
                <p className="text-[#9FC2BC]">Ajans profili sadece yazılımcı hesapları için kullanılabilir.</p>
            </div>
        )
    }

    const inputClass = "w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]/60 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-[#9FC2BC]/40"

    if (profil?.profil_tipi !== 'ajans') {
        return (
            <div className="min-h-screen bg-[#0D2626] px-6 py-16">
                <div className="max-w-lg mx-auto text-center">
                    <Link to="/profilim" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">
                        ← Profilime dön
                    </Link>
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 mt-6">
                        <h1 className="text-[#F3ECE1] text-2xl font-bold mb-3">Ajans Profiline Geç</h1>
                        <p className="text-[#9FC2BC] text-sm mb-6">
                            2-5 kişilik bir ekiple mi çalışıyorsun? Profilini ajans olarak göster, gerçek yazılımcı hesaplarını davet ederek ekibini portföyünde sergile.
                        </p>
                        <button
                            onClick={ajansModunaGec}
                            disabled={gecisYapiliyor}
                            className="bg-[#C97D3C] text-[#0D2626] font-semibold px-6 py-3 rounded-full disabled:opacity-50 hover:bg-[#E3B776] transition-all duration-300"
                        >
                            {gecisYapiliyor ? "Geçiliyor..." : "Ajans Moduna Geç"}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-2xl mx-auto">
                <Link to="/profilim" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">
                    ← Profilime dön
                </Link>
                <div className="flex items-center justify-between flex-wrap gap-4 mt-6 mb-10">
                    <div>
                        <h1 className="text-[#F3ECE1] text-3xl font-bold">Ajansım</h1>
                        <p className="text-[#9FC2BC] text-sm mt-1">Ekibini davet et, portföyünde birlikte görünün.</p>
                    </div>
                    <button onClick={bireyselModaDon} className="text-[#9FC2BC]/60 text-xs hover:text-red-300 transition-colors">
                        Bireysel moda dön
                    </button>
                </div>

                {/* Üye Davet Et */}
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 mb-6">
                    <h2 className="text-[#F3ECE1] font-semibold mb-4">Üye Davet Et</h2>
                    <div className="relative">
                        <input
                            type="text"
                            value={aramaMetni}
                            onChange={(e) => ustaAra(e.target.value)}
                            placeholder="Onaylı bir yazılımcının adını yaz..."
                            className={inputClass}
                        />
                        {aramaSonuclari.length > 0 && (
                            <div className="absolute z-10 left-0 right-0 mt-2 bg-[#123434] border border-white/[0.1] rounded-xl overflow-hidden shadow-2xl">
                                {aramaSonuclari.map((u) => (
                                    <div key={u.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.05]">
                                        <div className="min-w-0">
                                            <div className="text-[#F3ECE1] text-sm truncate">{u.ad_soyad}</div>
                                            <div className="text-[#9FC2BC] text-xs truncate">{u.unvan}</div>
                                        </div>
                                        <button
                                            onClick={() => davetGonder(u.id)}
                                            disabled={davetGonderiliyor}
                                            className="bg-[#C97D3C] text-[#0D2626] text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#E3B776] transition-all duration-300 shrink-0 disabled:opacity-50"
                                        >
                                            Davet Et
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <input
                        type="text"
                        value={rolAciklamasi}
                        onChange={(e) => setRolAciklamasi(e.target.value)}
                        placeholder="Rolü (isteğe bağlı, örn. Backend Geliştirici)"
                        className={inputClass + " mt-3"}
                    />
                    {hata && <p className="text-red-400 text-sm mt-2">{hata}</p>}
                </div>

                {/* Bekleyen Davetler */}
                {bekleyenDavetler.length > 0 && (
                    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 mb-6">
                        <h2 className="text-[#F3ECE1] font-semibold mb-4">Bekleyen Davetler</h2>
                        <div className="flex flex-col gap-2">
                            {bekleyenDavetler.map((d) => (
                                <div key={d.id} className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
                                    <div className="min-w-0">
                                        <div className="text-[#F3ECE1] text-sm">{d.profiller?.ad_soyad}</div>
                                        {d.rol_aciklamasi && <div className="text-[#9FC2BC]/70 text-xs">{d.rol_aciklamasi}</div>}
                                    </div>
                                    <button onClick={() => daveteIptalEt(d.id)} className="text-[#9FC2BC] text-xs hover:text-red-300 transition-colors shrink-0">
                                        İptal Et
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ekip Üyeleri */}
                <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6">
                    <h2 className="text-[#F3ECE1] font-semibold mb-4">Ekip Üyeleri ({uyeler.length})</h2>
                    {uyeler.length === 0 ? (
                        <p className="text-[#9FC2BC] text-sm">Henüz kabul edilmiş üye yok.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {uyeler.map((u) => (
                                <div key={u.id} className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C97D3C] to-[#E3B776] flex items-center justify-center text-[#0D2626] text-xs font-bold shrink-0">
                                            {baslangicHarfleri(u.profiller?.ad_soyad)}
                                        </div>
                                        <div className="min-w-0">
                                            <Link to={`/ustalar/${u.davet_edilen_id}`} className="text-[#F3ECE1] text-sm hover:text-[#C97D3C] transition-colors">
                                                {u.profiller?.ad_soyad}
                                            </Link>
                                            {u.rol_aciklamasi && <div className="text-[#9FC2BC]/70 text-xs">{u.rol_aciklamasi}</div>}
                                        </div>
                                    </div>
                                    <button onClick={() => uyeCikar(u.id)} className="text-[#9FC2BC] text-xs hover:text-red-300 transition-colors shrink-0">
                                        Çıkar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AjansYonetimi
