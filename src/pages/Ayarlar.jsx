import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'

function Ayarlar() {
    useSayfaBasligi('Ayarlar')
    const { user, yukleniyor: authYukleniyor } = useAuth()

    const [yeniSifre, setYeniSifre] = useState("")
    const [yeniSifreTekrar, setYeniSifreTekrar] = useState("")
    const [kaydediliyor, setKaydediliyor] = useState(false)
    const [hata, setHata] = useState("")
    const [basarili, setBasarili] = useState(false)

    async function sifreDegistir(e) {
        e.preventDefault()
        setHata("")
        setBasarili(false)

        if (yeniSifre.length < 6) {
            setHata("Şifre en az 6 karakter olmalı.")
            return
        }
        if (yeniSifre !== yeniSifreTekrar) {
            setHata("Şifreler eşleşmiyor.")
            return
        }

        setKaydediliyor(true)
        const { error } = await supabase.auth.updateUser({ password: yeniSifre })
        setKaydediliyor(false)

        if (error) {
            setHata(error.message)
        } else {
            setBasarili(true)
            setYeniSifre("")
            setYeniSifreTekrar("")
        }
    }

    if (authYukleniyor) {
        return <div className="min-h-screen bg-[#000000] flex items-center justify-center text-[#A1A1AA]">Yükleniyor...</div>
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-center px-6">
                <p className="text-[#A1A1AA] mb-4">Ayarlarını görmek için giriş yapmalısın.</p>
                <Link to="/giris" className="text-[#A78BFA] hover:underline">Giriş yap</Link>
            </div>
        )
    }

    const inputClass = "w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-3 text-[#FFFFFF] outline-none focus:border-[#8B5CF6]/60 focus:bg-white/[0.05] transition-all duration-300"

    return (
        <div className="min-h-screen bg-[#000000] px-6 py-16">
            <div className="max-w-lg mx-auto">
                <Link to="/" className="text-[#A1A1AA] text-sm hover:text-[#FFFFFF] transition-colors">
                    ← Anasayfaya dön
                </Link>
                <h1 className="text-[#FFFFFF] text-3xl font-bold mt-6 mb-2">Ayarlar</h1>
                <p className="text-[#A1A1AA] text-sm mb-10">Hesabını buradan yönetebilirsin.</p>

                {/* Hesap Bilgisi */}
                <div className="isik-kutu bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 mb-6">
                    <h2 className="text-[#FFFFFF] font-semibold mb-4">Hesap</h2>
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] flex items-center justify-center text-[#050505] font-bold shrink-0">
                            {user.email?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <div className="text-[#FFFFFF] text-sm font-medium truncate">{user.email}</div>
                            <div className="text-[#A1A1AA]/60 text-xs">
                                Katılım: {new Date(user.created_at).toLocaleDateString('tr-TR')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Şifre Değiştir */}
                <div className="isik-kutu bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 mb-6">
                    <h2 className="text-[#FFFFFF] font-semibold mb-4">Şifre Değiştir</h2>
                    <form onSubmit={sifreDegistir} className="flex flex-col gap-3">
                        <input
                            type="password"
                            value={yeniSifre}
                            onChange={(e) => setYeniSifre(e.target.value)}
                            placeholder="Yeni şifre"
                            className={inputClass}
                        />
                        <input
                            type="password"
                            value={yeniSifreTekrar}
                            onChange={(e) => setYeniSifreTekrar(e.target.value)}
                            placeholder="Yeni şifre (tekrar)"
                            className={inputClass}
                        />
                        {hata && <p className="text-red-400 text-sm">{hata}</p>}
                        {basarili && <p className="text-[#C4B5FD] text-sm">✓ Şifren güncellendi</p>}
                        <button
                            type="submit"
                            disabled={kaydediliyor}
                            className="isik isik-birincil bg-[#FDFDFD] text-[#050505] font-semibold px-6 py-3 rounded-full disabled:opacity-50 hover:bg-[#FFFFFF] transition-all duration-300 self-start"
                        >
                            {kaydediliyor ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                        </button>
                    </form>
                </div>

                {/* Tehlikeli Bölge */}
                <div className="bg-red-400/[0.04] border border-red-400/20 rounded-2xl p-6">
                    <h2 className="text-[#FFFFFF] font-semibold mb-2">Tehlikeli Bölge</h2>
                    <p className="text-[#A1A1AA] text-sm mb-4">
                        Hesabını ve tüm profil verilerini kalıcı olarak silmemizi istersen, bize e-posta ile ulaş — talebini 48 saat içinde işleme alırız.
                    </p>
                    <a
                        href={`mailto:merhaba@usta.app?subject=Hesap Silme Talebi&body=Merhaba, ${user.email} adresli hesabımı silmenizi rica ediyorum.`}
                        className="isik isik-tehlike inline-block border border-red-400/40 text-red-300 text-sm px-5 py-2.5 rounded-full hover:bg-red-400/10 transition-all duration-300"
                    >
                        Hesabımı Sil
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Ayarlar
