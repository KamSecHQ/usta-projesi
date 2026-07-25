import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import useSayfaBasligi from '../useSayfaBasligi'
import { dilRengi, zamanFarki } from '../ustaYardimcilari'

function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad.split(" ").filter(Boolean).slice(0, 2).map((k) => k[0].toUpperCase()).join("")
}

function Bolum({ baslik, children }) {
    if (!children) return null
    return (
        <div className="mb-8">
            <h2 className="text-[#C97D3C] text-xs uppercase tracking-wider font-mono mb-2">{baslik}</h2>
            <p className="text-[#F3ECE1] leading-relaxed whitespace-pre-line">{children}</p>
        </div>
    )
}

function ProjeDetay() {
    const { id } = useParams()
    const [proje, setProje] = useState(null)
    const [sahip, setSahip] = useState(null)
    const [yukleniyor, setYukleniyor] = useState(true)
    const [bulunamadi, setBulunamadi] = useState(false)

    useSayfaBasligi(proje ? proje.baslik : "Proje")

    useEffect(() => {
        async function veriGetir() {
            const { data: projeData, error } = await supabase
                .from('projeler')
                .select('*')
                .eq('id', id)
                .single()

            if (error || !projeData) {
                setBulunamadi(true)
                setYukleniyor(false)
                return
            }

            const { data: sahipData } = await supabase
                .from('profiller')
                .select('id, ad_soyad, unvan')
                .eq('id', projeData.kullanici_id)
                .single()

            setProje(projeData)
            setSahip(sahipData)
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
                <h1 className="text-[#F3ECE1] text-2xl font-bold mb-3">Proje bulunamadı</h1>
                <Link to="/ustalar" className="text-[#C97D3C] hover:underline">← Ustalara dön</Link>
            </div>
        )
    }

    const teknolojiler = proje.teknolojiler || []
    const anaTeknoloji = teknolojiler[0]
    const zenginIcerikVar = proje.problem || proje.cozum || proje.sonuc

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-2xl mx-auto">
                {sahip && (
                    <Link to={`/ustalar/${sahip.id}`} className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">
                        ← {sahip.ad_soyad || "Usta"}'nın portföyüne dön
                    </Link>
                )}

                {proje.kapak_gorseli_url && (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/[0.08] mt-6 mb-8">
                        <img
                            src={proje.kapak_gorseli_url}
                            alt={proje.baslik}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none' }}
                        />
                    </div>
                )}

                <div className="flex items-start justify-between gap-3 flex-wrap mt-6 mb-2">
                    <h1 className="text-[#F3ECE1] text-3xl font-bold">
                        {proje.one_cikan && (
                            <span className="text-[#C97D3C] mr-2" title="Öne çıkan proje">★</span>
                        )}
                        {proje.baslik}
                    </h1>
                    {proje.link && (
                        <a
                            href={proje.link}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#C97D3C] text-[#0D2626] font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#E3B776] transition-all duration-300 whitespace-nowrap"
                        >
                            Canlı Projeyi Gör ↗
                        </a>
                    )}
                </div>

                <div className="flex items-center gap-4 text-[#9FC2BC]/70 text-sm mb-2">
                    {anaTeknoloji && (
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: dilRengi(anaTeknoloji) }} />
                            {anaTeknoloji}
                        </span>
                    )}
                    {proje.created_at && <span>Güncellendi: {zamanFarki(proje.created_at)}</span>}
                    {sahip && (
                        <span className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#C97D3C] to-[#E3B776] flex items-center justify-center text-[#0D2626] text-[9px] font-bold">
                                {baslangicHarfleri(sahip.ad_soyad)}
                            </span>
                            {sahip.ad_soyad}
                        </span>
                    )}
                </div>

                {proje.rol && (
                    <p className="text-[#9FC2BC] text-sm mb-6">
                        <span className="text-[#9FC2BC]/60">Rolüm: </span>{proje.rol}
                    </p>
                )}

                {teknolojiler.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-8">
                        {teknolojiler.map((t) => (
                            <span key={t} className="text-[#9FC2BC] text-xs border border-white/[0.1] px-3 py-1 rounded-full font-mono">
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                <div className="h-px bg-white/[0.08] mb-8" />

                {zenginIcerikVar ? (
                    <>
                        <Bolum baslik="Problem">{proje.problem}</Bolum>
                        <Bolum baslik="Çözüm">{proje.cozum}</Bolum>
                        <Bolum baslik="Sonuç">{proje.sonuc}</Bolum>
                    </>
                ) : proje.aciklama ? (
                    <p className="text-[#9FC2BC] leading-relaxed whitespace-pre-line">{proje.aciklama}</p>
                ) : (
                    <p className="text-[#9FC2BC]/50 text-sm">Bu proje için henüz detaylı bir açıklama eklenmemiş.</p>
                )}
            </div>
        </div>
    )
}

export default ProjeDetay
