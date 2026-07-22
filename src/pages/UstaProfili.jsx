import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad.split(" ").filter(Boolean).slice(0, 2).map((k) => k[0].toUpperCase()).join("")
}

function UstaProfili() {
    const { id } = useParams()
    const [profil, setProfil] = useState(null)
    const [projeler, setProjeler] = useState([])
    const [yukleniyor, setYukleniyor] = useState(true)
    const [bulunamadi, setBulunamadi] = useState(false)

    useEffect(() => {
        async function veriGetir() {
            const { data: profilData, error: profilHata } = await supabase
                .from('profiller')
                .select('*')
                .eq('id', id)
                .single()

            if (profilHata || !profilData) {
                setBulunamadi(true)
                setYukleniyor(false)
                return
            }

            const { data: projeData } = await supabase
                .from('projeler')
                .select('*')
                .eq('kullanici_id', id)
                .order('created_at', { ascending: false })

            setProfil(profilData)
            setProjeler(projeData || [])
            setYukleniyor(false)
        }
        veriGetir()
    }, [id])

    if (yukleniyor) {
        return <div className="min-h-screen bg-[#0D2626] flex items-center justify-center text-[#9FC2BC]">Yükleniyor...</div>
    }

    if (bulunamadi) {
        return (
            <div className="min-h-screen bg-[#0D2626] flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-[#F3ECE1] text-2xl font-bold mb-3">Usta bulunamadı</h1>
                <Link to="/ustalar" className="text-[#C97D3C] hover:underline">← Tüm ustalara dön</Link>
            </div>
        )
    }

    const teknolojiler = profil.teknolojiler || []

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-3xl mx-auto">
                <Link to="/ustalar" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">
                    ← Tüm ustalara dön
                </Link>

                {/* Header */}
                <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 mt-6 mb-6 overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_0%,rgba(201,125,60,0.08),transparent)]" />

                    {profil.onayli && (
                        <div className="absolute top-6 right-6 w-14 h-14 rounded-full border border-dashed border-[#C97D3C]/60 flex items-center justify-center text-[#C97D3C] text-[9px] text-center -rotate-12 font-mono leading-tight">
                            ONAYLI<br />USTA
                        </div>
                    )}

                    <div className="relative flex items-start gap-5 flex-wrap">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C97D3C] to-[#E3B776] flex items-center justify-center text-[#0D2626] font-bold text-2xl shrink-0">
                            {baslangicHarfleri(profil.ad_soyad)}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-[#F3ECE1] text-2xl font-bold">
                                {profil.ad_soyad || "İsimsiz Usta"}
                            </h1>
                            <p className="text-[#C97D3C] font-medium mt-0.5">{profil.unvan}</p>
                            {profil.konum && (
                                <p className="text-[#9FC2BC] text-sm mt-1">📍 {profil.konum}</p>
                            )}
                        </div>
                    </div>

                    {profil.bio && (
                        <p className="relative text-[#9FC2BC] mt-6 leading-relaxed">{profil.bio}</p>
                    )}

                    <div className="relative flex gap-2 flex-wrap mt-5">
                        {teknolojiler.map((t) => (
                            <span key={t} className="text-[#9FC2BC] text-xs border border-white/[0.1] px-3 py-1 rounded-full font-mono">
                                {t}
                            </span>
                        ))}
                    </div>

                    <div className="relative flex gap-3 mt-6 flex-wrap">
                        {profil.github_url && (
                            <a
                                href={profil.github_url}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-white/[0.05] border border-white/[0.1] text-[#F3ECE1] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/[0.1] hover:border-[#C97D3C]/40 transition-all duration-300"
                            >
                                GitHub'ı Gör ↗
                            </a>
                        )}
                        <Link
                            to="/hesap-olustur?rol=is-veren"
                            className="bg-[#C97D3C] text-[#0D2626] font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#E3B776] transition-all duration-300"
                        >
                            Bu Ustayla Çalış
                        </Link>
                    </div>
                </div>

                {/* Projeler */}
                <h2 className="text-[#F3ECE1] text-xl font-bold mb-4">Projeler</h2>
                {projeler.length === 0 ? (
                    <p className="text-[#9FC2BC] text-sm">Henüz proje eklenmemiş.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {projeler.map((p) => (
                            <div key={p.id} className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-5 hover:border-[#C97D3C]/40 hover:bg-white/[0.05] transition-all duration-300">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-[#F3ECE1] font-semibold">{p.baslik}</h3>
                                    {p.link && (
                                        <a
                                            href={p.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[#C97D3C] text-sm shrink-0 hover:underline"
                                        >
                                            İncele ↗
                                        </a>
                                    )}
                                </div>
                                {p.aciklama && (
                                    <p className="text-[#9FC2BC] text-sm mt-2">{p.aciklama}</p>
                                )}
                                <div className="flex gap-2 flex-wrap mt-3">
                                    {(p.teknolojiler || []).map((t) => (
                                        <span key={t} className="text-[#9FC2BC] text-xs border border-white/[0.1] px-2 py-0.5 rounded-full font-mono">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default UstaProfili
