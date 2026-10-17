import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import { SifreAlani } from '../components/form/Alan'
import { hesapHatasi } from '../components/hesap/hesapHatalari'
import { useBildirim, useOnay } from '../components/bildirim/bildirimBaglami'
import { Ok } from '../components/uzay/Hareket'
import GirisKapisi from '../components/hesap/GirisKapisi'

const kart = 'rounded-[22px] border border-white/[0.08] bg-[#08080D] p-6 sm:p-7'

function tarih(deger) {
    return deger ? new Date(deger).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
}

function KartBaslik({ id, baslik, metin }) {
    return (
        <div className="mb-5">
            <h2 id={id} className="text-[17px] font-medium tracking-[-0.01em] text-white">
                {baslik}
            </h2>
            {metin && <p className="mt-1 text-[14px] leading-relaxed text-gri">{metin}</p>}
        </div>
    )
}

function SifreFormu() {
    const bildir = useBildirim()
    const [sifre, setSifre] = useState('')
    const [tekrar, setTekrar] = useState('')
    const [hatalar, setHatalar] = useState({})
    const [kaydediliyor, setKaydediliyor] = useState(false)

    async function kaydet(e) {
        e.preventDefault()
        const h = {}
        if (sifre.length < 6) h.sifre = 'Şifre en az 6 karakter olmalı.'
        else if (sifre !== tekrar) h.tekrar = 'İki şifre aynı değil.'
        setHatalar(h)
        if (Object.keys(h).length) return
        setKaydediliyor(true)
        const { error } = await supabase.auth.updateUser({ password: sifre })
        setKaydediliyor(false)
        if (error) {
            setHatalar({ genel: hesapHatasi(error) })
            return
        }
        setSifre('')
        setTekrar('')
        bildir('Şifren güncellendi.', { tur: 'basari' })
    }

    return (
        <form onSubmit={kaydet} noValidate className="flex flex-col gap-5">
            <SifreAlani etiket="Yeni şifre" deger={sifre} degisti={setSifre} otomatik="new-password" enAz={6} hata={hatalar.sifre} ipucu="En az 6 karakter. Başka sitelerde kullanmadığın bir şifre seç." />
            <SifreAlani etiket="Yeni şifre (tekrar)" deger={tekrar} degisti={setTekrar} otomatik="new-password" enAz={6} hata={hatalar.tekrar} />
            {hatalar.genel && (
                <p className="alan-hata" role="alert">
                    {hatalar.genel}
                </p>
            )}
            <button type="submit" disabled={kaydediliyor} className="isik-hap isik-hap-birincil self-start rounded-full px-6 py-2.5 text-[14.5px] font-semibold disabled:opacity-60">
                {kaydediliyor ? 'Güncelleniyor…' : 'Şifreyi güncelle'}
            </button>
        </form>
    )
}

function Ayarlar() {
    useSayfaBasligi('Ayarlar', 'Kalfahane hesabının şifresini, oturumlarını ve silme talebini yönet.')
    const { user, yukleniyor } = useAuth()
    const navigate = useNavigate()
    const onayla = useOnay()
    const bildir = useBildirim()
    const [cikisYapiliyor, setCikisYapiliyor] = useState(false)

    async function herYerdenCik() {
        const tamam = await onayla({
            baslik: 'Tüm cihazlarda oturum kapatılsın mı?',
            metin: 'Bu tarayıcı dahil hesabının açık olduğu her yerde oturum kapanır. Yeniden girmek için şifren gerekir.',
            onay: 'Hepsini kapat',
            tehlike: true,
        })
        if (!tamam) return
        setCikisYapiliyor(true)
        const { error } = await supabase.auth.signOut({ scope: 'global' })
        setCikisYapiliyor(false)
        if (error) {
            bildir(hesapHatasi(error), { tur: 'hata' })
            return
        }
        bildir('Tüm cihazlarda oturum kapatıldı.')
        navigate('/giris')
    }

    if (yukleniyor) {
        return <div className="uzay min-h-screen" role="status" aria-label="Yükleniyor"><div className="uz-yildizlar" aria-hidden /></div>
    }

    if (!user) {
        return (
            <GirisKapisi ikon="ayarlar" baslik="Ayarlar hesabına bağlı" metin="Şifreni, açık oturumlarını ve hesap tercihlerini yönetmek için giriş yap." />
        )
    }

    const silmeKonusu = encodeURIComponent('Hesap silme talebi')
    const silmeMetni = encodeURIComponent(`Merhaba, ${user.email} adresli Kalfahane hesabımı ve profil verilerimi silmenizi rica ediyorum.`)

    return (
        <div className="uzay min-h-screen px-4 pb-24 pt-14 sm:px-8 lg:pt-20">
            <div className="uz-yildizlar" aria-hidden />
            <div className="relative mx-auto max-w-[760px]">
                <header className="mb-10">
                    <h1 className="font-pjs text-[clamp(2.2rem,4.6vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white">Ayarlar</h1>
                    <p className="mt-3 text-[16px] font-light text-gri">Hesabın, şifren ve oturumların. Profil bilgilerin profil düzenleme sayfasında.</p>
                </header>

                <div className="flex flex-col gap-6">
                    <section aria-labelledby="ayar-hesap" className={kart}>
                        <KartBaslik id="ayar-hesap" baslik="Hesap" />
                        <div className="flex items-center gap-4">
                            <div aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#C4B5FD] text-[17px] font-semibold text-[#050505]">
                                {user.email?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-[15px] font-medium text-white">{user.email}</p>
                                <p className="text-[13px] text-gri-koyu">Giriş için kullandığın e-posta</p>
                            </div>
                        </div>
                        <dl className="mt-6 grid gap-4 border-t border-white/[0.07] pt-5 text-[14px] sm:grid-cols-2">
                            <div>
                                <dt className="text-gri-koyu">Katılım</dt>
                                <dd className="mt-0.5 text-white">{tarih(user.created_at)}</dd>
                            </div>
                            <div>
                                <dt className="text-gri-koyu">Son giriş</dt>
                                <dd className="mt-0.5 text-white">{tarih(user.last_sign_in_at)}</dd>
                            </div>
                        </dl>
                        <div className="mt-6 flex flex-wrap gap-2.5">
                            <Link to="/profilim" className="isik isik-cam inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium">
                                Profilimi düzenle <Ok />
                            </Link>
                            <Link to="/gizlilik" className="isik isik-cam rounded-full px-5 py-2.5 text-[14px] font-medium">
                                Gizlilik politikası
                            </Link>
                        </div>
                    </section>

                    <section aria-labelledby="ayar-sifre" className={kart}>
                        <KartBaslik id="ayar-sifre" baslik="Şifre" metin="Şifreni değiştirdiğinde bu cihazdaki oturumun açık kalır." />
                        <SifreFormu />
                    </section>

                    <section aria-labelledby="ayar-oturum" className={kart}>
                        <KartBaslik id="ayar-oturum" baslik="Oturumlar" metin="Ortak ya da kaybolan bir cihazda hesabın açık kaldıysa her yerde oturumu kapatabilirsin." />
                        <button type="button" onClick={herYerdenCik} disabled={cikisYapiliyor} className="isik isik-cam rounded-full px-5 py-2.5 text-[14px] font-medium disabled:opacity-60">
                            {cikisYapiliyor ? 'Kapatılıyor…' : 'Tüm cihazlarda oturumu kapat'}
                        </button>
                    </section>

                    <section aria-labelledby="ayar-sil" className="rounded-[22px] border border-red-400/20 bg-red-400/[0.04] p-6 sm:p-7">
                        <KartBaslik id="ayar-sil" baslik="Hesabı sil" metin="Hesabını ve tüm profil verilerini kalıcı olarak silmemizi istersen bize e-posta ile yaz; talebini 48 saat içinde işleme alırız. Bu işlem geri alınamaz." />
                        <a href={`mailto:merhaba@kalfahane.com?subject=${silmeKonusu}&body=${silmeMetni}`} className="isik isik-tehlike inline-block rounded-full border border-red-400/40 px-5 py-2.5 text-[14px] font-medium text-red-300 hover:bg-red-400/10">
                            Silme talebi gönder
                        </a>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default Ayarlar
