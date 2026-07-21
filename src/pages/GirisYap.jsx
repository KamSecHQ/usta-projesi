import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function GirisYap() {
    const [email, setEmail] = useState("")
    const [sifre, setSifre] = useState("")
    const [hata, setHata] = useState("")
    const navigate = useNavigate()

    async function girisYap(e) {
        e.preventDefault()
        setHata("")
        const { error } = await supabase.auth.signInWithPassword({ email, password: sifre })
        if (error) {
            setHata("E-posta ya da şifre hatalı.")
            return
        }
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-20">
            <div className="max-w-md mx-auto">
                <Link to="/" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1]">
                    ← Anasayfaya dön
                </Link>
                <h1 className="text-[#F3ECE1] text-3xl font-bold mt-6 mb-8">
                    Giriş Yap
                </h1>

                <form onSubmit={girisYap} className="flex flex-col gap-4">
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
                            className="w-full bg-[#123434] border border-[#21504E] rounded px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]"
                        />
                    </div>
                    {hata && <p className="text-red-400 text-sm">{hata}</p>}
                    <button
                        type="submit"
                        className="bg-[#C97D3C] text-[#0D2626] font-semibold px-6 py-3 rounded mt-2"
                    >
                        Giriş Yap
                    </button>
                    <p className="text-[#9FC2BC] text-sm text-center mt-2">
                        Hesabın yok mu? <Link to="/hesap-olustur" className="text-[#C97D3C] hover:underline">Hesap oluştur</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default GirisYap
