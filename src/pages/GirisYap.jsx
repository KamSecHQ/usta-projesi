import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import useSayfaBasligi from '../useSayfaBasligi'


function GirisYap() {
    useSayfaBasligi('Giriş Yap')

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
        <div className="min-h-screen bg-[#000000] px-6 py-20">
            <div className="max-w-md mx-auto">
                <Link to="/" className="text-[#A1A1AA] text-sm hover:text-[#FFFFFF]">
                    ← Anasayfaya dön
                </Link>
                <h1 className="text-[#FFFFFF] text-3xl font-bold mt-6 mb-8">
                    Giriş Yap
                </h1>

                <form onSubmit={girisYap} className="flex flex-col gap-4">
                    <div>
                        <label className="text-[#A1A1AA] text-sm block mb-1">E-posta</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-[#0D0D13] border border-[#2A2A33] rounded px-4 py-3 text-[#FFFFFF] outline-none focus:border-[#8B5CF6]"
                        />
                    </div>
                    <div>
                        <label className="text-[#A1A1AA] text-sm block mb-1">Şifre</label>
                        <input
                            type="password"
                            value={sifre}
                            onChange={(e) => setSifre(e.target.value)}
                            required
                            className="w-full bg-[#0D0D13] border border-[#2A2A33] rounded px-4 py-3 text-[#FFFFFF] outline-none focus:border-[#8B5CF6]"
                        />
                    </div>
                    {hata && <p className="text-red-400 text-sm">{hata}</p>}
                    <button
                        type="submit"
                        className="isik isik-birincil bg-[#FDFDFD] text-[#050505] font-semibold px-6 py-3 rounded mt-2"
                    >
                        Giriş Yap
                    </button>
                    <p className="text-[#A1A1AA] text-sm text-center mt-2">
                        Hesabın yok mu? <Link to="/hesap-olustur" className="text-[#A78BFA] hover:underline">Hesap oluştur</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default GirisYap
