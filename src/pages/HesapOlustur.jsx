import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import useSayfaBasligi from '../useSayfaBasligi'


function HesapOlustur() {
    useSayfaBasligi('Hesap Oluştur')

    const [searchParams] = useSearchParams()
    const varsayilanRol = searchParams.get('rol') === 'is-veren' ? 'is-veren' : 'yazilimci'

    const [adSoyad, setAdSoyad] = useState("")
    const [telefon, setTelefon] = useState("")
    const [email, setEmail] = useState("")
    const [sifre, setSifre] = useState("")
    const [rol, setRol] = useState(varsayilanRol)
    const [hata, setHata] = useState("")
    const [gonderiliyor, setGonderiliyor] = useState(false)
    const [basarili, setBasarili] = useState(false)
    const navigate = useNavigate()

    async function kayitOl(e) {
        e.preventDefault()
        setHata("")
        setGonderiliyor(true)

        const { data, error } = await supabase.auth.signUp({
            email,
            password: sifre,
            options: { data: { rol } }
        })

        if (error) {
            setHata(error.message)
            setGonderiliyor(false)
            return
        }

        // Kayıt sonrası isim ve telefonu profile hemen yazıyoruz,
        // böylece kullanıcı bunları tekrar ProfilDuzenle'de girmek zorunda kalmıyor.
        if (data.user) {
            await supabase
                .from('profiller')
                .update({ ad_soyad: adSoyad || null, telefon: telefon || null })
                .eq('id', data.user.id)
        }

        setGonderiliyor(false)
        setBasarili(true)
    }

    const inputClass = "w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]/60 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-[#9FC2BC]/40"
    const labelClass = "text-[#9FC2BC] text-xs uppercase tracking-wider font-mono block mb-2"

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-20 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(201,125,60,0.08),transparent)]" />

            <div className="max-w-md mx-auto relative">
                <Link to="/" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">
                    ← Anasayfaya dön
                </Link>
                <h1 className="text-[#F3ECE1] text-3xl font-bold mt-6 mb-2">
                    Hesap Oluştur
                </h1>
                <p className="text-[#9FC2BC] text-sm mb-8">
                    Türkiye'nin yazılım çarşısına katıl.
                </p>

                {basarili ? (
                    <div className="bg-white/[0.03] backdrop-blur-md border border-[#C97D3C]/40 rounded-2xl p-6">
                        <p className="text-[#E3B776] font-semibold">✓ Kayıt başarılı!</p>
                        <p className="text-[#9FC2BC] text-sm mt-2">
                            E-postana gelen onay linkine tıkla, sonra giriş yapabilirsin.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={kayitOl} className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4">
                        <div>
                            <label className={labelClass}>Ben bir...</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRol("yazilimci")}
                                    className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-300 ${rol === "yazilimci"
                                        ? "bg-[#C97D3C] text-[#0D2626] border-[#C97D3C]"
                                        : "bg-white/[0.03] text-[#9FC2BC] border-white/[0.1] hover:bg-white/[0.06]"
                                        }`}
                                >
                                    Yazılımcıyım
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRol("is-veren")}
                                    className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-300 ${rol === "is-veren"
                                        ? "bg-[#C97D3C] text-[#0D2626] border-[#C97D3C]"
                                        : "bg-white/[0.03] text-[#9FC2BC] border-white/[0.1] hover:bg-white/[0.06]"
                                        }`}
                                >
                                    İş Verenim
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Ad Soyad</label>
                            <input
                                type="text"
                                value={adSoyad}
                                onChange={(e) => setAdSoyad(e.target.value)}
                                placeholder="Emirhan Baydere"
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Telefon</label>
                            <input
                                type="tel"
                                value={telefon}
                                onChange={(e) => setTelefon(e.target.value)}
                                placeholder="0555 555 55 55"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>E-posta</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Şifre</label>
                            <input
                                type="password"
                                value={sifre}
                                onChange={(e) => setSifre(e.target.value)}
                                required
                                minLength={6}
                                className={inputClass}
                            />
                        </div>

                        {hata && <p className="text-red-400 text-sm">{hata}</p>}

                        <button
                            type="submit"
                            disabled={gonderiliyor}
                            className="bg-[#C97D3C] text-[#0D2626] font-semibold px-6 py-3 rounded-full disabled:opacity-50 hover:bg-[#E3B776] transition-all duration-300 mt-2"
                        >
                            {gonderiliyor ? "Kaydediliyor..." : "Kayıt Ol"}
                        </button>
                        <p className="text-[#9FC2BC] text-sm text-center">
                            Zaten hesabın var mı? <Link to="/giris" className="text-[#C97D3C] hover:underline">Giriş yap</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}

export default HesapOlustur
