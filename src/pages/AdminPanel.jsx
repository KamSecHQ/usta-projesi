import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'


function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad.split(" ").filter(Boolean).slice(0, 2).map((k) => k[0].toUpperCase()).join("")
}

function ProfilKarti({ profil, aksiyonlar, onTelefonDogrula }) {
    const teknolojiler = profil.teknolojiler || []
    return (
        <div className="bg-[#0D0D13] border border-[#2A2A33] rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] flex items-center justify-center text-[#050505] font-bold shrink-0">
                    {baslangicHarfleri(profil.ad_soyad)}
                </div>
                <div className="min-w-0">
                    <div className="text-[#FFFFFF] font-semibold">{profil.ad_soyad || "İsimsiz Usta"}</div>
                    <div className="text-[#A1A1AA] text-sm">{profil.unvan}</div>
                    {profil.bio && <p className="text-[#A1A1AA]/80 text-sm mt-2 max-w-md">{profil.bio}</p>}
                    <div className="flex gap-2 flex-wrap mt-2">
                        {teknolojiler.map((t) => (
                            <span key={t} className="text-[#A1A1AA] text-xs border border-white/[0.1] px-2 py-0.5 rounded-full font-mono">{t}</span>
                        ))}
                    </div>
                    {profil.telefon && (
                        <div className="flex items-center gap-2 mt-2.5">
                            <span className="text-[#A1A1AA] text-xs font-mono">📞 {profil.telefon}</span>
                            {profil.telefon_dogrulandi ? (
                                <span className="text-[#4ADE80] text-xs">✓ Doğrulandı</span>
                            ) : (
                                <button
                                    onClick={() => onTelefonDogrula(profil.id)}
                                    className="text-[#A78BFA] text-xs hover:underline"
                                >
                                    Telefonu Doğrula
                                </button>
                            )}
                        </div>
                    )}
                    <Link to={`/ustalar/${profil.id}`} target="_blank" className="text-[#A78BFA] text-xs hover:underline mt-2 inline-block">
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
    useSayfaBasligi('Yönetim Paneli')

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

    async function telefonDogrula(id) {
        await supabase.from('profiller').update({ telefon_dogrulandi: true }).eq('id', id)
        profilleriGetir()
    }

    if (authYukleniyor || (user && adminMi === null)) {
        return <div className="min-h-screen bg-[#000000] flex items-center justify-center text-[#A1A1AA]">Yükleniyor...</div>
    }

    if (!user) return null

    if (adminMi === false) {
        return (
            <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-[#FFFFFF] text-2xl font-bold mb-3">Bu sayfayı görme yetkin yok</h1>
                <p className="text-[#A1A1AA] mb-6">Yönetim paneli sadece yöneticiler içindir.</p>
                <Link to="/" className="text-[#A78BFA] hover:underline">← Anasayfaya dön</Link>
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
        <div className="min-h-screen bg-[#000000] px-6 py-16">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="text-[#A1A1AA] text-sm hover:text-[#FFFFFF]">
                    ← Anasayfaya dön
                </Link>
                <h1 className="text-[#FFFFFF] text-3xl font-bold mt-6 mb-8">
                    Yönetim Paneli
                </h1>

                <div className="flex gap-2 mb-8 flex-wrap">
                    {sekmeler.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setSekme(s.id)}
                            className={`isik isik-birincil text-sm px-4 py-2 rounded-full font-mono transition-all duration-300 ${sekme === s.id
                                ? 'bg-[#FDFDFD] text-[#050505]'
                                : 'border border-white/[0.1] text-[#A1A1AA] hover:bg-white/[0.05]'
                                }`}
                        >
                            {s.ad} ({s.sayi})
                        </button>
                    ))}
                </div>

                {sekme === 'bekleyen' && (
                    profillerYukleniyor ? (
                        <p className="text-[#A1A1AA]">Yükleniyor...</p>
                    ) : bekleyenler.length === 0 ? (
                        <p className="text-[#A1A1AA]">Onay bekleyen profil yok.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {bekleyenler.map((p) => (
                                <ProfilKarti
                                    key={p.id}
                                    profil={p}
                                    onTelefonDogrula={telefonDogrula}
                                    aksiyonlar={
                                        <button
                                            onClick={() => onayla(p.id)}
                                            className="isik isik-birincil bg-[#FDFDFD] text-[#050505] text-sm font-medium px-4 py-2 rounded-full hover:bg-[#FFFFFF] transition-all duration-300 whitespace-nowrap"
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
                        <p className="text-[#A1A1AA]">Yükleniyor...</p>
                    ) : onayliUstalar.length === 0 ? (
                        <p className="text-[#A1A1AA]">Henüz onaylanmış usta yok.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {onayliUstalar.map((p) => (
                                <ProfilKarti
                                    key={p.id}
                                    profil={p}
                                    onTelefonDogrula={telefonDogrula}
                                    aksiyonlar={
                                        <button
                                            onClick={() => onayiKaldir(p.id)}
                                            className="isik isik-tehlike border border-white/[0.1] text-[#A1A1AA] text-sm px-4 py-2 rounded-full hover:text-red-300 hover:border-red-300/40 transition-all duration-300 whitespace-nowrap"
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
                        <p className="text-[#A1A1AA]/60 text-xs mb-4">
                            Bu liste artık kullanılmayan eski başvuru formlarından kalan geçmiş kayıtlardır.
                        </p>
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setBasvuruFiltre('tumu')}
                                className={`isik isik-birincil text-sm px-4 py-2 rounded font-mono ${basvuruFiltre === 'tumu' ? 'bg-[#FDFDFD] text-[#050505]' : 'border border-[#2A2A33] text-[#A1A1AA]'}`}
                            >
                                Tümü ({basvurular.length})
                            </button>
                            <button
                                onClick={() => setBasvuruFiltre('yazilimci')}
                                className={`text-sm px-4 py-2 rounded font-mono ${basvuruFiltre === 'yazilimci' ? 'bg-[#5FA8D3] text-[#050505]' : 'border border-[#2A2A33] text-[#A1A1AA]'}`}
                            >
                                Yazılımcılar ({basvurular.filter((b) => b.tip === 'yazilimci').length})
                            </button>
                            <button
                                onClick={() => setBasvuruFiltre('is-veren')}
                                className={`isik isik-birincil text-sm px-4 py-2 rounded font-mono ${basvuruFiltre === 'is-veren' ? 'bg-[#FDFDFD] text-[#050505]' : 'border border-[#2A2A33] text-[#A1A1AA]'}`}
                            >
                                İş Verenler ({basvurular.filter((b) => b.tip === 'is-veren').length})
                            </button>
                        </div>

                        {basvurularYukleniyor ? (
                            <p className="text-[#A1A1AA]">Yükleniyor...</p>
                        ) : basvuruGosterilecekler.length === 0 ? (
                            <p className="text-[#A1A1AA]">Bu kategoride başvuru yok.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {basvuruGosterilecekler.map((b) => (
                                    <div key={b.id} className="bg-[#0D0D13] border border-[#2A2A33] rounded p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[#FFFFFF] font-semibold">{b.ad}</span>
                                            <span className={`text-xs font-mono px-2 py-1 rounded ${b.tip === 'yazilimci' ? 'text-[#5FA8D3] border border-[#5FA8D3]' : 'text-[#A78BFA] border border-[#8B5CF6]'}`}>
                                                {b.tip === 'yazilimci' ? 'YAZILIMCI' : 'İŞ VEREN'}
                                            </span>
                                        </div>
                                        <p className="text-[#A1A1AA] text-sm">{b.email}</p>
                                        <p className="text-[#A1A1AA] text-sm mt-1">{b.uzmanlik}</p>
                                        <p className="text-[#A1A1AA]/50 text-xs mt-2 font-mono">
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
