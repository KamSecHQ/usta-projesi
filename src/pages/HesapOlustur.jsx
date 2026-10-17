import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'
import useSayfaBasligi from '../useSayfaBasligi'
import HesapCercevesi from '../components/hesap/HesapCercevesi'
import { hesapHatasi } from '../components/hesap/hesapHatalari'
import { Alan, SifreAlani } from '../components/form/Alan'
import { Ok } from '../components/uzay/Hareket'
import Ikon from '../components/mesaj/Ikon'

const ROLLER = [
    ['yazilimci', 'Yazılımcıyım', 'Portföyünü aç, ilanlara teklif ver.'],
    ['is-veren', 'İş verenim', 'İlan aç, teklifleri karşılaştır, ustanı seç.'],
]

function HesapOlustur() {
    useSayfaBasligi('Hesap oluştur', 'Kalfahane hesabını ücretsiz aç: yazılımcıysan portföyünü oluştur, işletmeysen ilan açıp teklif topla.')
    const [searchParams] = useSearchParams()
    const [rol, setRol] = useState(searchParams.get('rol') === 'is-veren' ? 'is-veren' : 'yazilimci')
    const [adSoyad, setAdSoyad] = useState('')
    const [telefon, setTelefon] = useState('')
    const [email, setEmail] = useState('')
    const [sifre, setSifre] = useState('')
    const [hatalar, setHatalar] = useState({})
    const [gonderiliyor, setGonderiliyor] = useState(false)
    const [basarili, setBasarili] = useState(false)
    const { user, yukleniyor: authYukleniyor } = useAuth()

    async function kayitOl(e) {
        e.preventDefault()
        const h = {}
        if (adSoyad.trim().length < 3) h.adSoyad = 'Adını ve soyadını yaz.'
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) h.email = 'Geçerli bir e-posta adresi yaz.'
        if (sifre.length < 6) h.sifre = 'Şifre en az 6 karakter olmalı.'
        setHatalar(h)
        if (Object.keys(h).length) return

        setGonderiliyor(true)
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: sifre, options: { data: { rol } } })
        if (error) {
            setHatalar({ genel: hesapHatasi(error) })
            setGonderiliyor(false)
            return
        }
        // İsim ve telefon profile hemen yazılır; kullanıcı bunları profil düzenlemede tekrar girmez
        if (data.user) {
            await supabase.from('profiller').update({ ad_soyad: adSoyad.trim() }).eq('id', data.user.id)
            if (telefon.trim()) await supabase.from('profil_iletisim').upsert({ id: data.user.id, telefon: telefon.trim() })
        }
        setGonderiliyor(false)
        setBasarili(true)
    }

    // Zaten üye olan kayıt formunu görmez; kayıt sırasında açılan oturum da panele götürür
    if (!authYukleniyor && user && !basarili) return <Navigate to="/panel" replace />

    if (basarili) {
        return (
            <HesapCercevesi baslik="Son bir adım" altBaslik="Hesabın oluşturuldu; e-postanı onaylaman gerekiyor.">
                <div role="status">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mor/20 text-mor-soluk">
                        <Ikon ad="eposta" className="h-6 w-6" />
                    </span>
                    <p className="mt-5 text-[16px] text-white">
                        <span className="font-semibold">{email.trim()}</span> adresine bir onay bağlantısı gönderdik.
                    </p>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-gri">Bağlantıya tıkladıktan sonra giriş yapabilirsin. Birkaç dakikada gelmezse gereksiz (spam) klasörüne bak.</p>
                    <Link to="/giris" className="mt-6 inline-flex items-center gap-2 text-[14.5px] font-medium text-mor-soluk hover:text-white">
                        Giriş sayfasına git <Ok />
                    </Link>
                </div>
            </HesapCercevesi>
        )
    }

    return (
        <HesapCercevesi baslik="Hesap oluştur" altBaslik="Türkiye’nin yazılım çarşısına katıl. Ücretsiz.">
            <form onSubmit={kayitOl} noValidate className="flex flex-col gap-5">
                <fieldset>
                    <legend className="alan-etiket">Kalfahane’yi nasıl kullanacaksın?</legend>
                    <div role="radiogroup" aria-label="Hesap türü" className="grid gap-3 sm:grid-cols-2">
                        {ROLLER.map(([d, ad, ozet]) => (
                            <button key={d} type="button" role="radio" aria-checked={rol === d} onClick={() => setRol(d)} className="secim-kart">
                                <span className="text-[15px] font-semibold text-white">{ad}</span>
                                <span className="text-[13px] text-gri">{ozet}</span>
                            </button>
                        ))}
                    </div>
                </fieldset>
                <Alan etiket="Ad soyad" hata={hatalar.adSoyad}>
                    {(p) => <input {...p} autoComplete="name" required className="alan" value={adSoyad} onChange={(e) => setAdSoyad(e.target.value)} />}
                </Alan>
                <Alan etiket="E-posta" hata={hatalar.email}>
                    {(p) => <input {...p} type="email" inputMode="email" autoComplete="email" required className="alan" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" />}
                </Alan>
                <SifreAlani deger={sifre} degisti={setSifre} otomatik="new-password" enAz={6} hata={hatalar.sifre} ipucu="En az 6 karakter; uzun bir cümle hem akılda kalır hem güvenlidir." />
                <Alan etiket="Telefon" istege ipucu="Herkese açık değildir; yalnızca sen ve yönetici görür. İstersen mesajlaşmada kendin paylaşırsın.">
                    {(p) => <input {...p} type="tel" inputMode="tel" autoComplete="tel" className="alan" value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="0555 555 55 55" />}
                </Alan>
                {hatalar.genel && (
                    <p className="alan-hata" role="alert">
                        {hatalar.genel}
                    </p>
                )}
                <button type="submit" disabled={gonderiliyor} className="isik-hap isik-hap-birincil inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold disabled:opacity-60">
                    {gonderiliyor ? 'Hesap açılıyor…' : 'Hesabımı oluştur'} {!gonderiliyor && <Ok />}
                </button>
                <p className="text-[12.5px] leading-relaxed text-gri-koyu">
                    Hesap oluşturarak{' '}
                    <Link to="/gizlilik" className="text-gri underline underline-offset-2 hover:text-white">
                        Gizlilik politikası
                    </Link>
                    ’nı okuduğunu kabul edersin.
                </p>
                <p className="text-[14px] text-gri">
                    Zaten hesabın var mı?{' '}
                    <Link to="/giris" className="font-medium text-white hover:text-mor-soluk">
                        Giriş yap
                    </Link>
                </p>
            </form>
        </HesapCercevesi>
    )
}

export default HesapOlustur
