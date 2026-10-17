import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'
import useSayfaBasligi from '../useSayfaBasligi'
import HesapCercevesi from '../components/hesap/HesapCercevesi'
import { hesapHatasi } from '../components/hesap/hesapHatalari'
import { Alan, SifreAlani } from '../components/form/Alan'
import { useBildirim } from '../components/bildirim/bildirimBaglami'
import { Ok } from '../components/uzay/Hareket'

const EPOSTA = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Giriş kapısından gelen ziyaretçi kaldığı sayfaya döner; yalnızca site içi yol kabul edilir
function donusAdresi(ham) {
    if (!ham || !ham.startsWith('/') || ham.startsWith('//') || ham.startsWith('/\\')) return '/panel'
    return ham
}

function GirisYap() {
    useSayfaBasligi('Giriş yap')
    const navigate = useNavigate()
    const [parametreler] = useSearchParams()
    const sonra = donusAdresi(parametreler.get('sonra'))
    const bildir = useBildirim()
    const [email, setEmail] = useState('')
    const [sifre, setSifre] = useState('')
    const [hatalar, setHatalar] = useState({})
    const [gonderiliyor, setGonderiliyor] = useState(false)
    const [sifirlama, setSifirlama] = useState(false)
    const { user, yukleniyor: authYukleniyor } = useAuth()

    // Boş ya da biçimsiz alan sunucuya gitmeden alanın altında söylenir
    function denetle(sifreDahil) {
        const h = {}
        if (!email.trim()) h.email = 'E-posta adresini yaz.'
        else if (!EPOSTA.test(email.trim())) h.email = 'E-posta adresi ornek@eposta.com biçiminde olmalı.'
        if (sifreDahil && !sifre) h.sifre = 'Şifreni yaz.'
        setHatalar(h)
        return Object.keys(h).length === 0
    }

    async function girisYap(e) {
        e.preventDefault()
        if (!denetle(true)) return
        setGonderiliyor(true)
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: sifre })
        setGonderiliyor(false)
        if (error) {
            setHatalar({ genel: hesapHatasi(error) })
            return
        }
        navigate(sonra)
    }

    async function sifirlamaGonder(e) {
        e.preventDefault()
        if (!denetle(false)) return
        setGonderiliyor(true)
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/sifre-yenile` })
        setGonderiliyor(false)
        if (error && /rate limit|too many|security/i.test(error.message)) {
            setHatalar({ genel: hesapHatasi(error) })
            return
        }
        // Hesabın var olup olmadığı açığa çıkmasın diye her durumda aynı yanıt
        bildir('Bu e-postayla bir hesap varsa, şifre sıfırlama bağlantısı gönderildi.', { tur: 'basari', sure: 6000 })
        setSifirlama(false)
    }

    // Zaten giriş yapmış kullanıcı giriş formunu görmez: gideceği sayfaya geçer
    if (!authYukleniyor && user) return <Navigate to={sonra} replace />

    return (
        <HesapCercevesi baslik={sifirlama ? 'Şifreni sıfırla' : 'Tekrar hoş geldin'} altBaslik={sifirlama ? 'E-postana yeni şifre belirleme bağlantısı gönderelim.' : 'Kaldığın yerden devam et.'}>
            <form onSubmit={sifirlama ? sifirlamaGonder : girisYap} noValidate className="flex flex-col gap-5">
                <Alan etiket="E-posta" hata={hatalar.email}>
                    {(p) => <input {...p} type="email" inputMode="email" autoComplete="email" required className="alan" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" />}
                </Alan>
                {!sifirlama && <SifreAlani deger={sifre} degisti={setSifre} otomatik="current-password" hata={hatalar.sifre} />}
                {hatalar.genel && (
                    <p className="alan-hata -mt-1" role="alert">
                        {hatalar.genel}
                    </p>
                )}
                <button type="submit" disabled={gonderiliyor} className="isik-hap isik-hap-birincil inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold disabled:opacity-60">
                    {gonderiliyor ? 'Bekle…' : sifirlama ? 'Bağlantı gönder' : 'Giriş yap'} {!gonderiliyor && <Ok />}
                </button>
                <div className="flex flex-wrap items-center justify-between gap-3 text-[14px]">
                    <button
                        type="button"
                        onClick={() => {
                            setSifirlama(!sifirlama)
                            setHatalar({})
                        }}
                        className="font-medium text-mor-soluk hover:text-white"
                    >
                        {sifirlama ? 'Girişe dön' : 'Şifremi unuttum'}
                    </button>
                    <span className="text-gri">
                        Hesabın yok mu?{' '}
                        <Link to="/hesap-olustur" className="font-medium text-white hover:text-mor-soluk">
                            Hesap oluştur
                        </Link>
                    </span>
                </div>
            </form>
        </HesapCercevesi>
    )
}

export default GirisYap
