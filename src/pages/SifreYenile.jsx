import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import HesapCercevesi from '../components/hesap/HesapCercevesi'
import { hesapHatasi } from '../components/hesap/hesapHatalari'
import { SifreAlani } from '../components/form/Alan'
import { useBildirim } from '../components/bildirim/bildirimBaglami'
import { Ok } from '../components/uzay/Hareket'

// Şifre sıfırlama bağlantısından gelinir: Supabase bağlantıdaki belirteçle geçici oturum açar,
// burada yeni şifre belirlenir. Bağlantısız açılırsa giriş sayfasına yönlendiren bir açıklama gösterir.
function SifreYenile() {
    useSayfaBasligi('Yeni şifre')
    const { user, yukleniyor } = useAuth()
    const navigate = useNavigate()
    const bildir = useBildirim()
    const [sifre, setSifre] = useState('')
    const [tekrar, setTekrar] = useState('')
    const [hatalar, setHatalar] = useState({})
    const [gonderiliyor, setGonderiliyor] = useState(false)
    // Bağlantıdaki belirteç işlenirken kısa bir süre oturum yok görünebilir
    const [bekleme, setBekleme] = useState(true)
    useEffect(() => {
        const id = setTimeout(() => setBekleme(false), 1500)
        return () => clearTimeout(id)
    }, [])

    async function kaydet(e) {
        e.preventDefault()
        const h = {}
        if (sifre.length < 6) h.sifre = 'Şifre en az 6 karakter olmalı.'
        else if (sifre !== tekrar) h.tekrar = 'İki şifre aynı değil.'
        setHatalar(h)
        if (Object.keys(h).length) return
        setGonderiliyor(true)
        const { error } = await supabase.auth.updateUser({ password: sifre })
        setGonderiliyor(false)
        if (error) {
            setHatalar({ genel: hesapHatasi(error) })
            return
        }
        bildir('Şifren güncellendi.', { tur: 'basari' })
        navigate('/panel')
    }

    if (yukleniyor || (!user && bekleme)) {
        return <div className="uzay min-h-screen" role="status" aria-label="Yükleniyor"><div className="uz-yildizlar" aria-hidden /></div>
    }

    if (!user) {
        return (
            <HesapCercevesi baslik="Bağlantının süresi dolmuş olabilir" altBaslik="Yeni şifre belirlemek için e-postana gelen sıfırlama bağlantısını kullan.">
                <p className="text-[15px] leading-relaxed text-gri">Bağlantı tek kullanımlıktır ve bir süre sonra geçerliliğini yitirir. Giriş sayfasındaki “Şifremi unuttum” ile yeni bir bağlantı isteyebilirsin.</p>
                <Link to="/giris" className="mt-6 inline-flex items-center gap-2 text-[14.5px] font-medium text-mor-soluk hover:text-white">
                    Giriş sayfasına git <Ok />
                </Link>
            </HesapCercevesi>
        )
    }

    return (
        <HesapCercevesi baslik="Yeni şifre belirle" altBaslik="Bundan sonra bu şifreyle giriş yapacaksın.">
            <form onSubmit={kaydet} noValidate className="flex flex-col gap-5">
                <SifreAlani etiket="Yeni şifre" deger={sifre} degisti={setSifre} otomatik="new-password" enAz={6} hata={hatalar.sifre} ipucu="En az 6 karakter." />
                <SifreAlani etiket="Yeni şifre (tekrar)" deger={tekrar} degisti={setTekrar} otomatik="new-password" enAz={6} hata={hatalar.tekrar} />
                {hatalar.genel && (
                    <p className="alan-hata" role="alert">
                        {hatalar.genel}
                    </p>
                )}
                <button type="submit" disabled={gonderiliyor} className="isik-hap isik-hap-birincil inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold disabled:opacity-60">
                    {gonderiliyor ? 'Kaydediliyor…' : 'Şifreyi kaydet'} {!gonderiliyor && <Ok />}
                </button>
            </form>
        </HesapCercevesi>
    )
}

export default SifreYenile
