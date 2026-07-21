import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function HesapOlustur() {
    const [email, setEmail] = useState("")
    const [sifre, setSifre] = useState("")
    const [hata, setHata] = useState("")
    const [basarili, setBasarili] = useState(false)
    const navigate = useNavigate()

    async function kayitOl(e) {
        e.preventDefault()
        setHata("")
        const { error } = await supabase.auth.signUp({ email, password: sifre })
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
