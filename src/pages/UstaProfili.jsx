import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import ProjeKarti from '../components/ProjeKarti'
import { IskeletProfilBasligi, IskeletProjeKarti } from '../components/Iskelet'
import FavoriButonu from '../components/FavoriButonu'
import {
    cevrimiciMi,
    musaitlikBilgisi,
    ucretAraligiGoster,
    videoEmbedUrl,
    kidemRozetiHesapla,
    tamamlananIsSayisiGetir,
} from '../ustaYardimcilari'


function baslangicHarfleri(adSoyad) {
    if (!adSoyad) return "?"
    return adSoyad.split(" ").filter(Boolean).slice(0, 2).map((k) => k[0].toUpperCase()).join("")
}

function UstaProfili() {
    const { id } = useParams()
    const { user } = useAuth()
    const [profil, setProfil] = useState(null)
    const [projeler, setProjeler] = useState([])
    const [kidem, setKidem] = useState(null)
    const [ajansUyeleri, setAjansUyeleri] = useState([])
    const [uyesiOldugum, setUyesiOldugum] = useState(null)
    const [yukleniyor, setYukleniyor] = useState(true)
    const [bulunamadi, setBulunamadi] = useState(false)
    useSayfaBasligi(profil ? `${profil.ad_soyad || "Usta"} — ${profil.unvan || "Portföy"}` : "Portföy")

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

            const siraliProjeler = (projeData || []).slice().sort((a, b) => {
                if (a.one_cikan === b.one_cikan) return 0
                return a.one_cikan ? -1 : 1
            })

            setProfil(profilData)
            setProjeler(siraliProjeler)

            const tamamlanan = await tamamlananIsSayisiGetir(supabase, id, profilData.rol)
            setKidem(kidemRozetiHesapla(profilData.rol, tamamlanan))

            if (profilData.profil_tipi === 'ajans') {
                const { data: uyelerData } = await supabase
                    .from('ajans_davetleri')
                    .select('davet_edilen_id, rol_aciklamasi, profiller!ajans_davetleri_davet_edilen_id_fkey(ad_soyad, unvan)')
                    .eq('ajans_id', id)
                    .eq('durum', 'kabul_edildi')
                setAjansUyeleri(uyelerData || [])
            } else {
                const { data: ajansData } = await supabase
                    .from('ajans_davetleri')
                    .select('ajans_id, profiller!ajans_davetleri_ajans_id_fkey(ad_soyad)')
                    .eq('davet_edilen_id', id)
                    .eq('durum', 'kabul_edildi')
                    .maybeSingle()
                setUyesiOldugum(ajansData || null)
            }

            setYukleniyor(false)
        }
        veriGetir()
    }, [id])

    if (yukleniyor) {
        return (
            <div className="min-h-screen bg-[#0D2626] px-6 py-16">
                <div className="max-w-3xl mx-auto">
                    <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse mb-6" />
                    <IskeletProfilBasligi />
                    <div className="h-6 w-28 bg-white/[0.06] rounded animate-pulse mt-10 mb-4" />
                    <div className="grid sm:grid-cols-2 gap-4">
                        <IskeletProjeKarti />
                        <IskeletProjeKarti />
                    </div>
                </div>
            </div>
        )
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
    const musBilgi = musaitlikBilgisi(profil.musaitlik)
    const ucret = ucretAraligiGoster(profil.saatlik_ucret_min, profil.saatlik_ucret_max)
    const gomulVideo = videoEmbedUrl(profil.video_url)
    const cevrimici = cevrimiciMi(profil.son_gorulme)

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-3xl mx-auto">
                <Link to="/ustalar" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">
                    ← Tüm ustalara dön
                </Link>

                {!profil.onayli && (
                    <div className="mt-4 bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-3 text-[#9FC2BC] text-sm">
                        Bu profil henüz yönetici onayından geçmedi, bu yüzden Ustalar listesinde ve aramada görünmüyor. Yalnızca bu doğrudan linkle görüntülenebiliyor.
                    </div>
                )}

                {/* Header */}
                <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-8 mt-6 mb-6 overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_0%,rgba(201,125,60,0.08),transparent)]" />

                    {profil.onayli && (
                        <div className="absolute top-6 right-6 w-14 h-14 rounded-full border border-dashed border-[#C97D3C]/60 flex items-center justify-center text-[#C97D3C] text-[9px] text-center -rotate-12 font-mono leading-tight">
                            ONAYLI<br />USTA
                        </div>
                    )}

                    <div className="relative flex items-start gap-5 flex-wrap">
                        <div className="relative shrink-0">
                            <div
                                className="w-20 h-20 rounded-full p-[2px]"
                                style={{ background: kidem ? `linear-gradient(135deg, ${kidem.renk}, transparent)` : 'transparent' }}
                            >
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#C97D3C] to-[#E3B776] flex items-center justify-center text-[#0D2626] font-bold text-2xl">
                                    {baslangicHarfleri(profil.ad_soyad)}
                                </div>
                            </div>
                            <span
                                className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#123434]"
                                style={{ backgroundColor: musBilgi.renk }}
                                title={musBilgi.etiket}
                            />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-[#F3ECE1] text-2xl font-bold">
                                {profil.ad_soyad || "İsimsiz Usta"}
                            </h1>
                            <p className="text-[#C97D3C] font-medium mt-0.5">{profil.unvan}</p>
                            {uyesiOldugum && (
                                <Link to={`/ustalar/${uyesiOldugum.ajans_id}`} className="text-[#9FC2BC] text-xs hover:text-[#C97D3C] transition-colors">
                                    🏢 {uyesiOldugum.profiller?.ad_soyad} ajansının üyesi
                                </Link>
                            )}
                            <div className="flex items-center gap-3 flex-wrap mt-1.5">
                                {profil.konum && (
                                    <span className="text-[#9FC2BC] text-sm">📍 {profil.konum}</span>
                                )}
                                {cevrimici && (
                                    <span className="flex items-center gap-1.5 text-[#4ADE80] text-xs font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                                        Şu an aktif
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Rozet sırası */}
                    <div className="relative flex gap-2 flex-wrap mt-5">
                        {profil.profil_tipi === 'ajans' && (
                            <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#9FC2BC]/40 text-[#9FC2BC] bg-white/[0.03]">
                                🏢 Ajans
                            </span>
                        )}
                        {kidem && (
                            <span
                                className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                                style={{ color: kidem.renk, borderColor: `${kidem.renk}50`, backgroundColor: `${kidem.renk}12` }}
                            >
                                {kidem.etiket}
                            </span>
                        )}
                        <span
                            className="text-xs font-medium px-3 py-1.5 rounded-full"
                            style={{ color: musBilgi.renk, backgroundColor: `${musBilgi.renk}1A` }}
                        >
                            {musBilgi.etiket}
                        </span>
                        {profil.telefon_dogrulandi && (
                            <span className="text-[#4ADE80] text-xs font-medium px-3 py-1.5 rounded-full bg-[#4ADE80]/10">
                                ✓ Kimlik Doğrulandı
                            </span>
                        )}
                        {ucret && (
                            <span className="text-[#E3B776] text-xs font-medium px-3 py-1.5 rounded-full bg-[#E3B776]/10">
                                {ucret}
                            </span>
                        )}
                    </div>
                    {profil.musaitlik === 'kismi_musait' && profil.musaitlik_notu && (
                        <p className="relative text-[#9FC2BC]/70 text-xs mt-2">{profil.musaitlik_notu}</p>
                    )}

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

                    {profil.profil_tipi === 'ajans' && ajansUyeleri.length > 0 && (
                        <div className="relative mt-6">
                            <p className="text-[#9FC2BC] text-xs uppercase tracking-wider font-mono mb-3">Ekip</p>
                            <div className="flex flex-wrap gap-3">
                                {ajansUyeleri.map((u) => (
                                    <Link
                                        key={u.davet_edilen_id}
                                        to={`/ustalar/${u.davet_edilen_id}`}
                                        className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] rounded-full pl-1.5 pr-4 py-1.5 hover:bg-white/[0.08] hover:border-[#C97D3C]/40 transition-all duration-300"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C97D3C] to-[#E3B776] flex items-center justify-center text-[#0D2626] text-xs font-bold shrink-0">
                                            {baslangicHarfleri(u.profiller?.ad_soyad)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[#F3ECE1] text-xs font-medium">{u.profiller?.ad_soyad}</div>
                                            {u.rol_aciklamasi && <div className="text-[#9FC2BC]/70 text-[10px]">{u.rol_aciklamasi}</div>}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {gomulVideo && (
                        <div className="relative mt-6 aspect-video rounded-xl overflow-hidden border border-white/[0.08]">
                            <iframe
                                src={gomulVideo}
                                title={`${profil.ad_soyad || "Usta"} tanıtım videosu`}
                                className="w-full h-full"
                                allowFullScreen
                            />
                        </div>
                    )}
                    {!gomulVideo && profil.video_url && (
                        <a
                            href={profil.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="relative mt-6 flex items-center gap-2 text-[#C97D3C] text-sm hover:underline"
                        >
                            ▶ Tanıtım videosunu izle ↗
                        </a>
                    )}

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
                            to={user ? "/ilan-ver" : "/hesap-olustur?rol=is-veren"}
                            className="bg-[#C97D3C] text-[#0D2626] font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#E3B776] transition-all duration-300"
                        >
                            Bu Ustayla Çalış
                        </Link>
                        <FavoriButonu ustaId={profil.id} />
                    </div>
                </div>

                {/* Projeler */}
                <h2 className="text-[#F3ECE1] text-xl font-bold mb-4">Projeler</h2>
                {projeler.length === 0 ? (
                    <p className="text-[#9FC2BC] text-sm">Henüz proje eklenmemiş.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {projeler.map((p) => (
                            <ProjeKarti key={p.id} proje={p} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default UstaProfili
