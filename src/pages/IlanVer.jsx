import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'

function IlanVer() {
    useSayfaBasligi('İş İlanı Ver')
    const { user, yukleniyor: authYukleniyor } = useAuth()
    const navigate = useNavigate()

    const [rol, setRol] = useState(null)
    const [rolYukleniyor, setRolYukleniyor] = useState(true)

    const [baslik, setBaslik] = useState("")
    const [aciklama, setAciklama] = useState("")
    const [butceMin, setButceMin] = useState("")
    const [butceMax, setButceMax] = useState("")
    const [teknolojiMetni, setTeknolojiMetni] = useState("")
    const [gonderiliyor, setGonderiliyor] = useState(false)
    const [hata, setHata] = useState("")

    useEffect(() => {
        async function rolGetir() {
            if (!user) return
            const { data } = await supabase.from('profiller').select('rol').eq('id', user.id).single()
            setRol(data?.rol || null)
            setRolYukleniyor(false)
        }
        if (user) rolGetir()
    }, [user])

    async function ilanOlustur(e) {
        e.preventDefault()
        if (!baslik.trim()) return
        setGonderiliyor(true)
        setHata("")

        const { data, error } = await supabase
            .from('ilanlar')
            .insert({
                is_veren_id: user.id,
                baslik,
                aciklama: aciklama || null,
                butce_min: butceMin === "" ? null : Number(butceMin),
                butce_max: butceMax === "" ? null : Number(butceMax),
                gerekli_teknolojiler: teknolojiMetni.split(",").map((t) => t.trim()).filter((t) => t.length > 0),
            })
            .select()
            .single()

        setGonderiliyor(false)
        if (error) {
            setHata(error.message)
        } else {
            navigate(`/is-ilanlari/${data.id}`)
        }
    }

    if (authYukleniyor || rolYukleniyor) {
        return <div className="min-h-screen bg-[#0D2626] flex items-center justify-center text-[#9FC2BC]">Yükleniyor...</div>
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0D2626] flex flex-col items-center justify-center text-center px-6">
                <p className="text-[#9FC2BC] mb-4">İlan verebilmek için giriş yapmalısın.</p>
                <Link to="/giris" className="text-[#C97D3C] hover:underline">Giriş yap</Link>
            </div>
        )
    }

    if (rol !== 'is-veren') {
        return (
            <div className="min-h-screen bg-[#0D2626] flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-[#F3ECE1] text-2xl font-bold mb-3">İlan vermek için iş veren hesabı gerekiyor</h1>
                <p className="text-[#9FC2BC] mb-6 max-w-sm">Bu hesap yazılımcı olarak kayıtlı. İlan vermek için ayrı bir iş veren hesabıyla giriş yapman gerekiyor.</p>
                <Link to="/ustalar" className="text-[#C97D3C] hover:underline">← Ustalara göz at</Link>
            </div>
        )
    }

    const inputClass = "w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]/60 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-[#9FC2BC]/40"
    const labelClass = "text-[#9FC2BC] text-xs uppercase tracking-wider font-mono block mb-2"

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-xl mx-auto">
                <Link to="/is-ilanlari" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">
                    ← İlanlara dön
                </Link>
                <h1 className="text-[#F3ECE1] text-3xl font-bold mt-6 mb-2">İş İlanı Ver</h1>
                <p className="text-[#9FC2BC] text-sm mb-8">İhtiyacını anlat, doğrulanmış yazılımcılar sana teklif göndersin.</p>

                <form onSubmit={ilanOlustur} className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4">
                    <div>
                        <label className={labelClass}>İlan Başlığı</label>
                        <input type="text" value={baslik} onChange={(e) => setBaslik(e.target.value)} placeholder="örn. E-ticaret sitesi için React geliştirici" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Açıklama</label>
                        <textarea value={aciklama} onChange={(e) => setAciklama(e.target.value)} rows={5} placeholder="Ne yapılmasını istediğini detaylı anlat..." className={inputClass + " resize-none"} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Bütçe Min (₺)</label>
                            <input type="number" min="0" value={butceMin} onChange={(e) => setButceMin(e.target.value)} placeholder="5000" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Bütçe Maks (₺)</label>
                            <input type="number" min="0" value={butceMax} onChange={(e) => setButceMax(e.target.value)} placeholder="15000" className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Gereken Teknolojiler</label>
                        <input type="text" value={teknolojiMetni} onChange={(e) => setTeknolojiMetni(e.target.value)} placeholder="React, Node.js, PostgreSQL (virgülle ayır)" className={inputClass} />
                    </div>

                    {hata && <p className="text-red-400 text-sm">{hata}</p>}

                    <button
                        type="submit"
                        disabled={gonderiliyor || !baslik.trim()}
                        className="bg-[#C97D3C] text-[#0D2626] font-semibold px-6 py-3 rounded-full disabled:opacity-50 hover:bg-[#E3B776] transition-all duration-300 self-start"
                    >
                        {gonderiliyor ? "Yayınlanıyor..." : "İlanı Yayınla"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default IlanVer
