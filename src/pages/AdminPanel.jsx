import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad.split(" ").filter(Boolean).slice(0, 2).map((k) => k[0].toUpperCase()).join("")
}

function ProfilKarti({ profil, aksiyonlar }) {
    const teknolojiler = profil.teknolojiler || []
    return (
        <div className="bg-[#123434] border border-[#21504E] rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C97D3C] to-[#E3B776] flex items-center justify-center text-[#0D2626] font-bold shrink-0">
                    {baslangicHarfleri(profil.ad_soyad)}
                </div>
                <div className="min-w-0">
                    <div className="text-[#F3ECE1] font-semibold">{profil.ad_soyad || "İsimsiz Usta"}</div>
                    <div className="text-[#9FC2BC] text-sm">{profil.unvan}</div>
                    {profil.bio && <p className="text-[#9FC2BC]/80 text-sm mt-2 max-w-md">{profil.bio}</p>}
                    <div className="flex gap-2 flex-wrap mt-2">
                        {teknolojiler.map((t) => (
                            <span key={t} className="text-[#9FC2BC] text-xs border border-white/[0.1] px-2 py-0.5 rounded-full font-mono">{t}</span>
                        ))}
                    </div>
                    <Link to={`/ustalar/${profil.id}`} target="_blank" className="text-[#C97D3C] text-xs hover:underline mt-2 inline-block">
                        Portföyü görüntüle ↗
                    </Link>
                </div>
            </div>
            <div className="flex sm:flex-col gap-2 shrink-0">
                {aksiyonlar}
            </div>
        </div>
    )
}

function AdminPanel() {
    const { user, yukleniyor: authYukleniyor } = useAuth()
    const [adminMi, setAdminMi] = useState(null)
    const [sekme, setSekme] = useState('bekleyen')

    const [bekleyenler, setBekleyenler] = useState([])
    const [onayliUstalar, setOnayliUstalar] = useState([])
    const [profillerYukleniyor, setProfillerYukleniyor] = useState(true)

    const [basvurular, setBasvurular] = useState([])
    const [basvurularYukleniyor, setBasvurularYukleniyor] = useState(true)
    const [basvuruFiltre, setBasvuruFiltre] = useState('tumu')

    useEffect(() => {
        async function adminKontrolEt() {
            if (!user) return
            const { data, error } = await supabase
                .from('profiller')
                .select('admin')
                .eq('id', user.id)
                .single()

            setAdminMi(!error && data?.admin ? true : false)
        }
        if (user) adminKontrolEt()
    }, [user])

    async function profilleriGetir() {
        setProfillerYukleniyor(true)
        const { data, error } = await supabase
            .from('profiller')
            .select('*')
            .eq('rol', 'yazilimci')
            .not('unvan', 'is', null)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setBekleyenler(data.filter((p) => !p.onayli))
            setOnayliUstalar(data.filter((p) => p.onayli))
        }
        setProfillerYukleniyor(false)
    }

    useEffect(() => {
        if (adminMi) profilleriGetir()
    }, [adminMi])

    useEffect(() => {
        async function basvurulariGetir() {
            const { data, error } = await supabase
                .from('basvurular')
                .select('*')
                .order('created_at', { ascending: false })
            if (!error) setBasvurular(data)
            setBasvurularYukleniyor(false)
        }
        if (adminMi) basvurulariGetir()
    }, [adminMi])

    useEffect(() => {
        if (!authYukleniyor && !user) {
            window.location.href = '/giris'
        }
    }, [user, authYukleniyor])

    async function onayla(id) {
        await supabase.from('profiller').update({ onayli: true }).eq('id', id)
        profilleriGetir()
    }

    async function onayiKaldir(id) {
        await supabase.from('profiller').update({ onayli: false }).eq('id', id)
        profilleriGetir()
    }

    if (authYukleniyor || (user && adminMi === null)) {
        return <div className="min-h-screen bg-[#0D2626] flex items-center justify-center text-[#9FC2BC]">Yükleniyor...</div>
    }

    if (!user) return null

    if (adminMi === false) {
        return (
            <div className="min-h-screen bg-[#0D2626] flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-[#F3ECE1] text-2xl font-bold mb-3">Bu sayfayı görme yetkin yok</h1>
                <p className="text-[#9FC2BC] mb-6">Yönetim paneli sadece yöneticiler içindir.</p>
                <Link to="/" className="text-[#C97D3C] hover:underline">← Anasayfaya dön</Link>
            </div>
        )
    }

    const basvuruGosterilecekler = basvuruFiltre === 'tumu'
        ? basvurular
        : basvurular.filter((b) => b.tip === basvuruFiltre)

    const sekmeler = [
        { id: 'bekleyen', ad: 'Onay Bekleyenler', sayi: bekleyenler.length },
        { id: 'onayli', ad: 'Onaylı Ustalar', sayi: onayliUstalar.length },
        { id: 'eski', ad: 'Eski Başvurular', sayi: basvurular.length },
    ]

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1]">
                    ← Anasayfaya dön
                </Link>
                <h1 className="text-[#F3ECE1] text-3xl font-bold mt-6 mb-8">
                    Yönetim Paneli
                </h1>

                <div className="flex gap-2 mb-8 flex-wrap">
                    {sekmeler.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setSekme(s.id)}
                            className={`text-sm px-4 py-2 rounded-full font-mono transition-all duration-300 ${sekme === s.id
                                ? 'bg-[#C97D3C] text-[#0D2626]'
                                : 'border border-white/[0.1] text-[#9FC2BC] hover:bg-white/[0.05]'
                                }`}
                        >
                            {s.ad} ({s.sayi})
                        </button>
                    ))}
                </div>

                {sekme === 'bekleyen' && (
                    profillerYukleniyor ? (
                        <p className="text-[#9FC2BC]">Yükleniyor...</p>
                    ) : bekleyenler.length === 0 ? (
                        <p className="text-[#9FC2BC]">Onay bekleyen profil yok.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {bekleyenler.map((p) => (
                                <ProfilKarti
                                    key={p.id}
                                    profil={p}
                                    aksiyonlar={
                                        <button
                                            onClick={() => onayla(p.id)}
                                            className="bg-[#C97D3C] text-[#0D2626] text-sm font-medium px-4 py-2 rounded-full hover:bg-[#E3B776] transition-all duration-300 whitespace-nowrap"
                                        >
                                            Onayla
                                        </button>
                                    }
                                />
                            ))}
                        </div>
                    )
                )}

                {sekme === 'onayli' && (
                    profillerYukleniyor ? (
                        <p className="text-[#9FC2BC]">Yükleniyor...</p>
                    ) : onayliUstalar.length === 0 ? (
                        <p className="text-[#9FC2BC]">Henüz onaylanmış usta yok.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {onayliUstalar.map((p) => (
                                <ProfilKarti
                                    key={p.id}
                                    profil={p}
                                    aksiyonlar={
                                        <button
                                            onClick={() => onayiKaldir(p.id)}
                                            className="border border-white/[0.1] text-[#9FC2BC] text-sm px-4 py-2 rounded-full hover:text-red-300 hover:border-red-300/40 transition-all duration-300 whitespace-nowrap"
                                        >
                                            Onayı Kaldır
                                        </button>
                                    }
                                />
                            ))}
                        </div>
                    )
                )}

                {sekme === 'eski' && (
                    <>
                        <p className="text-[#9FC2BC]/60 text-xs mb-4">
                            Bu liste artık kullanılmayan eski başvuru formlarından kalan geçmiş kayıtlardır.
                        </p>
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setBasvuruFiltre('tumu')}
                                className={`text-sm px-4 py-2 rounded font-mono ${basvuruFiltre === 'tumu' ? 'bg-[#C97D3C] text-[#0D2626]' : 'border border-[#21504E] text-[#9FC2BC]'}`}
                            >
                                Tümü ({basvurular.length})
                            </button>
                            <button
                                onClick={() => setBasvuruFiltre('yazilimci')}
                                className={`text-sm px-4 py-2 rounded font-mono ${basvuruFiltre === 'yazilimci' ? 'bg-[#5FA8D3] text-[#0D2626]' : 'border border-[#21504E] text-[#9FC2BC]'}`}
                            >
                                Yazılımcılar ({basvurular.filter((b) => b.tip === 'yazilimci').length})
                            </button>
                            <button
                                onClick={() => setBasvuruFiltre('is-veren')}
                                className={`text-sm px-4 py-2 rounded font-mono ${basvuruFiltre === 'is-veren' ? 'bg-[#C97D3C] text-[#0D2626]' : 'border border-[#21504E] text-[#9FC2BC]'}`}
                            >
                                İş Verenler ({basvurular.filter((b) => b.tip === 'is-veren').length})
                            </button>
                        </div>

                        {basvurularYukleniyor ? (
                            <p className="text-[#9FC2BC]">Yükleniyor...</p>
                        ) : basvuruGosterilecekler.length === 0 ? (
                            <p className="text-[#9FC2BC]">Bu kategoride başvuru yok.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {basvuruGosterilecekler.map((b) => (
                                    <div key={b.id} className="bg-[#123434] border border-[#21504E] rounded p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[#F3ECE1] font-semibold">{b.ad}</span>
                                            <span className={`text-xs font-mono px-2 py-1 rounded ${b.tip === 'yazilimci' ? 'text-[#5FA8D3] border border-[#5FA8D3]' : 'text-[#C97D3C] border border-[#C97D3C]'}`}>
                                                {b.tip === 'yazilimci' ? 'YAZILIMCI' : 'İŞ VEREN'}
                                            </span>
                                        </div>
                                        <p className="text-[#9FC2BC] text-sm">{b.email}</p>
                                        <p className="text-[#9FC2BC] text-sm mt-1">{b.uzmanlik}</p>
                                        <p className="text-[#9FC2BC]/50 text-xs mt-2 font-mono">
                                            {new Date(b.created_at).toLocaleString('tr-TR')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default AdminPanel
