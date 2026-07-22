import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function HesapOlustur() {
    const [searchParams] = useSearchParams()
    const varsayilanRol = searchParams.get('rol') === 'is-veren' ? 'is-veren' : 'yazilimci'

    const [email, setEmail] = useState("")
    const [sifre, setSifre] = useState("")
    const [rol, setRol] = useState(varsayilanRol)
    const [hata, setHata] = useState("")
    const [basarili, setBasarili] = useState(false)
    const navigate = useNavigate()

    async function kayitOl(e) {
        e.preventDefault()
        setHata("")
        const { error } = await supabase.auth.signUp({
            email,
            password: sifre,
            options: { data: { rol } }
        })
        if (error) {
            setHata(error.message)
            return
        }
        setBasarili(true)
    }

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-20">
            <div className="max-w-md mx-auto">
                <Link to="/" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1]">
                    ← Anasayfaya dön
                </Link>
                <h1 className="text-[#F3ECE1] text-3xl font-bold mt-6 mb-8">
                    Hesap Oluştur
                </h1>

                {basarili ? (
                    <div className="bg-[#123434] border border-[#C97D3C] rounded p-6">
                        <p className="text-[#E3B776] font-semibold">Kayıt başarılı!</p>
                        <p className="text-[#9FC2BC] text-sm mt-2">
                            E-postana gelen onay linkine tıkla, sonra giriş yapabilirsin.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={kayitOl} className="flex flex-col gap-4">
                        <div>
                            <label className="text-[#9FC2BC] text-sm block mb-2">Ben bir...</label>
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
                            <label className="text-[#9FC2BC] text-sm block mb-1">E-posta</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-[#123434] border border-[#21504E] rounded px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]"
                            />
                        </div>
                        <div>
                            <label className="text-[#9FC2BC] text-sm block mb-1">Şifre</label>
                            <input
                                type="password"
                                value={sifre}
                                onChange={(e) => setSifre(e.target.value)}
                                required
                                minLength={6}
                                className="w-full bg-[#123434] border border-[#21504E] rounded px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]"
                            />
                        </div>
                        {hata && <p className="text-red-400 text-sm">{hata}</p>}
                        <button
                            type="submit"
                            className="bg-[#C97D3C] text-[#0D2626] font-semibold px-6 py-3 rounded mt-2"
                        >
                            Kayıt Ol
                        </button>
                        <p className="text-[#9FC2BC] text-sm text-center mt-2">
                            Zaten hesabın var mı? <Link to="/giris" className="text-[#C97D3C] hover:underline">Giriş yap</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}

export default HesapOlustur
