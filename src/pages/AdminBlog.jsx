import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useBildirim, useOnay } from '../components/bildirim/bildirimBaglami'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import { Alan } from '../components/form/Alan'
import { Anahtar, SonucYok } from '../components/liste/ListeAraclari'
import { HapLink, Ok } from '../components/uzay/Hareket'
import YaziGovdesi from '../components/yazi/YaziGovdesi'
import { okumaSuresi } from '../components/yazi/yaziBicimi'
import Ikon from '../components/mesaj/Ikon'
import { slugOlustur, zamanFarki } from '../ustaYardimcilari'
import { blogOnizlemesi } from './blogOnizleme'
import '../components/uzay/uzay.css'

function bosForm() {
    return { id: null, baslik: '', slug: '', kategori: '', ozet: '', icerik: '', kapak_gorseli_url: '', yayinlandi: false }
}

const ALANLAR = ['baslik', 'slug', 'kategori', 'ozet', 'icerik', 'kapak_gorseli_url', 'yayinlandi']
const metinDugmesi = 'text-[13px] text-gri transition-colors hover:text-white'

function GeriBaglanti() {
    return (
        <Link to="/admin" className="inline-flex items-center gap-2 text-[14px] text-gri hover:text-white">
            <span className="inline-flex rotate-180">
                <Ok />
            </span>
            Yönetim paneli
        </Link>
    )
}

// Yazının sitede görüneceği hâli; düzenleyicinin yanında canlı
function Onizleme({ form }) {
    return (
        <div className="rounded-[20px] border border-white/[0.08] bg-[#06060A] p-6 sm:p-8">
            <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-gri-koyu">
                {form.kategori && <span className="text-mor-soluk">{form.kategori}</span>}
                {form.kategori && <span aria-hidden>·</span>}
                <span>{okumaSuresi(form.icerik)} dk okuma</span>
            </p>
            <h2 className="mt-3 text-balance font-pjs text-[clamp(1.6rem,2.6vw,2.1rem)] font-medium leading-[1.1] tracking-[-0.03em] text-white">
                {form.baslik || <span className="text-gri-koyu">Başlık burada görünecek</span>}
            </h2>
            {form.ozet && <p className="mt-4 text-[16.5px] font-light leading-relaxed text-[#C9C9D1]">{form.ozet}</p>}
            <div className="mt-6 border-t border-white/[0.07] pt-6">
                {form.icerik.trim() ? (
                    <YaziGovdesi metin={form.icerik} className="text-[16px]" />
                ) : (
                    <p className="text-[15px] font-light text-gri-koyu">İçerik yazdıkça burada biçimlenmiş hâliyle görünür.</p>
                )}
            </div>
        </div>
    )
}

function AdminBlog() {
    useSayfaBasligi('Blog yönetimi')
    const { user: gercekKullanici, yukleniyor: authYukleniyor } = useAuth()
    const bildir = useBildirim()
    const onayla = useOnay()
    // Geliştirmede ?onizleme=1 ile örnek yazılar (canlıda yok)
    const [onizleme] = useState(() => {
        if (!import.meta.env.DEV) return null
        const yazilar = blogOnizlemesi(new URLSearchParams(window.location.search).get('onizleme'))
        return yazilar ? yazilar.map((y, i) => ({ ...y, yayinlandi: i !== 3 })) : null
    })
    const ornek = gercekKullanici ? null : onizleme
    const kullaniciId = gercekKullanici?.id || (ornek ? 'onizleme' : null)

    const [adminMi, setAdminMi] = useState(null)
    const [yazilar, setYazilar] = useState([])
    const [yukleniyor, setYukleniyor] = useState(true)
    const [form, setForm] = useState(bosForm())
    const [asil, setAsil] = useState(null)
    const [formAcik, setFormAcik] = useState(false)
    const [slugElleDegisti, setSlugElleDegisti] = useState(false)
    const [kaydediliyor, setKaydediliyor] = useState(false)
    const [hata, setHata] = useState('')

    useEffect(() => {
        if (!kullaniciId) return
        if (ornek) {
            setAdminMi(true)
            return
        }
        let iptal = false
        supabase.from('profiller').select('admin').eq('id', kullaniciId).single().then(({ data }) => {
            if (!iptal) setAdminMi(Boolean(data?.admin))
        })
        return () => {
            iptal = true
        }
    }, [kullaniciId, ornek])

    const yazilariGetir = useCallback(async () => {
        if (ornek) {
            setYazilar((y) => (y.length ? y : ornek))
            setYukleniyor(false)
            return
        }
        const { data, error } = await supabase.from('blog_yazilari').select('*').order('created_at', { ascending: false })
        if (error) bildir('Yazılar yüklenemedi. Sayfayı yenile.', { tur: 'hata' })
        else setYazilar(data)
        setYukleniyor(false)
    }, [ornek, bildir])

    useEffect(() => {
        if (adminMi) yazilariGetir()
    }, [adminMi, yazilariGetir])

    const degisti = asil ? ALANLAR.some((a) => (form[a] ?? '') !== (asil[a] ?? '')) : false

    function editoruAc(yazi) {
        const baslangic = yazi ? { ...bosForm(), ...yazi, kategori: yazi.kategori || '', ozet: yazi.ozet || '', kapak_gorseli_url: yazi.kapak_gorseli_url || '' } : bosForm()
        setForm(baslangic)
        setAsil(baslangic)
        setSlugElleDegisti(Boolean(yazi))
        setHata('')
        setFormAcik(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    async function editoruKapat() {
        if (degisti) {
            const evet = await onayla({ baslik: 'Değişiklikler kaydedilmedi', metin: 'Kapatırsan bu yazıdaki kaydedilmemiş değişiklikler kaybolur.', onay: 'Kaydetmeden kapat', tehlike: true })
            if (!evet) return
        }
        setFormAcik(false)
    }

    function basligiGuncelle(baslik) {
        setForm((f) => ({ ...f, baslik, slug: slugElleDegisti ? f.slug : slugOlustur(baslik) }))
    }

    async function kaydet(e) {
        e.preventDefault()
        if (!form.baslik.trim() || !form.slug.trim() || !form.icerik.trim()) {
            setHata('Başlık, adres ve içerik zorunlu.')
            return
        }
        setKaydediliyor(true)
        setHata('')
        const veriler = {
            baslik: form.baslik.trim(),
            slug: slugOlustur(form.slug) || form.slug.trim(),
            kategori: form.kategori.trim() || null,
            ozet: form.ozet.trim() || null,
            icerik: form.icerik,
            kapak_gorseli_url: form.kapak_gorseli_url.trim() || null,
            yayinlandi: form.yayinlandi,
            guncellenme_tarihi: new Date().toISOString(),
        }

        if (ornek) {
            setYazilar((l) => (form.id ? l.map((y) => (y.id === form.id ? { ...y, ...veriler } : y)) : [{ ...veriler, id: `yeni-${Date.now()}`, created_at: new Date().toISOString() }, ...l]))
            setKaydediliyor(false)
            setFormAcik(false)
            bildir(veriler.yayinlandi ? 'Yazı yayında' : 'Taslak kaydedildi')
            return
        }

        const { error } = form.id
            ? await supabase.from('blog_yazilari').update(veriler).eq('id', form.id)
            : await supabase.from('blog_yazilari').insert(veriler)
        setKaydediliyor(false)
        if (error) {
            setHata(error.code === '23505' ? 'Bu adres başka bir yazıda kullanılıyor; adresi değiştir.' : 'Yazı kaydedilemedi. Bağlantını kontrol edip tekrar dene.')
            return
        }
        setFormAcik(false)
        bildir(veriler.yayinlandi ? 'Yazı yayında' : 'Taslak kaydedildi')
        yazilariGetir()
    }

    async function yayinDurumuDegistir(yazi) {
        const yeni = !yazi.yayinlandi
        if (ornek) {
            setYazilar((l) => l.map((y) => (y.id === yazi.id ? { ...y, yayinlandi: yeni } : y)))
            bildir(yeni ? 'Yazı yayında' : 'Yazı taslağa alındı')
            return
        }
        const { error } = await supabase.from('blog_yazilari').update({ yayinlandi: yeni }).eq('id', yazi.id)
        if (error) bildir('Durum değiştirilemedi. Tekrar dene.', { tur: 'hata' })
        else bildir(yeni ? 'Yazı yayında' : 'Yazı taslağa alındı')
        yazilariGetir()
    }

    async function yaziSil(yazi) {
        const evet = await onayla({
            baslik: 'Yazı kalıcı olarak silinsin mi?',
            metin: `"${yazi.baslik}" blogdan ve arama sonuçlarından kalkar. Bu işlem geri alınamaz.`,
            onay: 'Yazıyı sil',
            tehlike: true,
        })
        if (!evet) return
        if (ornek) {
            setYazilar((l) => l.filter((y) => y.id !== yazi.id))
            bildir('Yazı silindi')
            return
        }
        const { error } = await supabase.from('blog_yazilari').delete().eq('id', yazi.id)
        if (error) bildir('Yazı silinemedi. Tekrar dene.', { tur: 'hata' })
        else bildir('Yazı silindi')
        yazilariGetir()
    }

    if (authYukleniyor || (kullaniciId && adminMi === null)) {
        return <div className="uzay min-h-screen" role="status" aria-label="Yükleniyor"><div className="uz-yildizlar" aria-hidden /></div>
    }

    if (!kullaniciId || !adminMi) {
        return (
            <div className="uzay flex min-h-screen items-center px-4">
                <SonucYok
                    BaslikEtiketi="h1"
                    baslik={kullaniciId ? 'Bu sayfayı görme yetkin yok' : 'Blog yönetimi için giriş yap'}
                    metin="Blog yönetimi yalnızca platform yöneticilerine açık."
                    eylem={<HapLink to={kullaniciId ? '/blog' : '/giris'}>{kullaniciId ? 'Bloga git' : 'Giriş yap'}</HapLink>}
                />
            </div>
        )
    }

    const yayinda = yazilar.filter((y) => y.yayinlandi).length

    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />
            <section className="px-4 pb-28 pt-12 sm:px-8 lg:pt-16">
                <div className="mx-auto max-w-[1240px]">
                    <GeriBaglanti />
                    <header className="mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
                        <div>
                            <h1 className="font-pjs text-[clamp(2.2rem,4.4vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.03em] text-white">Blog yönetimi</h1>
                            <p className="mt-3 text-[16px] font-light text-gri">
                                <span className="rakam text-white">{yayinda}</span> yazı yayında, <span className="rakam text-white">{yazilar.length - yayinda}</span> taslak.
                            </p>
                        </div>
                        {!formAcik && (
                            <button type="button" onClick={() => editoruAc(null)} className="uz-hap isik-hap isik-hap-birincil">
                                Yeni yazı <Ok />
                            </button>
                        )}
                    </header>

                    {formAcik && (
                        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                            <form onSubmit={kaydet} noValidate className="flex flex-col gap-4 rounded-[20px] border border-white/[0.08] bg-[#0A0A0F] p-6 sm:p-7">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="text-[19px] font-medium tracking-[-0.015em] text-white">{form.id ? 'Yazıyı düzenle' : 'Yeni yazı'}</h2>
                                    {degisti && <span className="text-[12.5px] text-mor-soluk">Kaydedilmemiş değişiklik var</span>}
                                </div>
                                <Alan etiket="Başlık">
                                    {(p) => <input {...p} type="text" required value={form.baslik} onChange={(e) => basligiGuncelle(e.target.value)} className="alan" />}
                                </Alan>
                                <Alan etiket="Adres" ipucu={`kalfahane.com/blog/${form.slug || '…'}`}>
                                    {(p) => <input {...p} type="text" required spellCheck={false} value={form.slug} onChange={(e) => { setForm((f) => ({ ...f, slug: e.target.value })); setSlugElleDegisti(true) }} className="alan font-kod" />}
                                </Alan>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Alan etiket="Kategori" istege ipucu="Örn. Rehber, Ustalar için">
                                        {(p) => <input {...p} type="text" value={form.kategori} onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))} className="alan" />}
                                    </Alan>
                                    <Alan etiket="Kapak görseli bağlantısı" istege>
                                        {(p) => <input {...p} type="url" inputMode="url" value={form.kapak_gorseli_url} onChange={(e) => setForm((f) => ({ ...f, kapak_gorseli_url: e.target.value }))} placeholder="https://" className="alan" />}
                                    </Alan>
                                </div>
                                <Alan etiket="Özet" ipucu="Liste kartında ve paylaşım açıklamasında görünür; 155 karakter civarı ideal.">
                                    {(p) => <textarea {...p} value={form.ozet} onChange={(e) => setForm((f) => ({ ...f, ozet: e.target.value }))} rows={2} className="alan resize-y" />}
                                </Alan>
                                <Alan etiket="İçerik" ipucu="Boş satır yeni paragraf. ## ara başlık, ### küçük başlık, - madde, 1. numaralı madde, > alıntı, **kalın**. Bağlantılar kendiliğinden tıklanır.">
                                    {(p) => <textarea {...p} required value={form.icerik} onChange={(e) => setForm((f) => ({ ...f, icerik: e.target.value }))} rows={16} className="alan resize-y" />}
                                </Alan>
                                <Anahtar acik={form.yayinlandi} degisti={(v) => setForm((f) => ({ ...f, yayinlandi: v }))}>
                                    Yayında (kapalıysa taslak olarak kalır, kimse göremez)
                                </Anahtar>

                                {hata && <p className="alan-hata" role="alert">{hata}</p>}

                                <div className="mt-1 flex flex-wrap items-center gap-3">
                                    <button type="submit" disabled={kaydediliyor} className="uz-hap isik-hap isik-hap-birincil">
                                        {kaydediliyor ? 'Kaydediliyor…' : form.yayinlandi ? 'Kaydet ve yayınla' : 'Taslağı kaydet'}
                                    </button>
                                    <button type="button" onClick={editoruKapat} className="px-3 py-2 text-[14px] text-gri hover:text-white">
                                        Vazgeç
                                    </button>
                                </div>
                            </form>

                            <div className="lg:sticky lg:top-24 lg:self-start">
                                <p className="mb-3 text-[13px] text-gri">Önizleme</p>
                                <div className="msj-kaydir max-h-[calc(100dvh-160px)] overflow-y-auto rounded-[20px]">
                                    <Onizleme form={form} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-12">
                        {yukleniyor ? (
                            <div className="h-24 rounded-[20px] bg-white/[0.03] motion-safe:animate-pulse" aria-hidden />
                        ) : yazilar.length === 0 ? (
                            <SonucYok baslik="Henüz yazı yok" metin="İlk rehberi yaz; taslak olarak kaydedip hazır olunca yayınlayabilirsin." eylem={!formAcik && <button type="button" onClick={() => editoruAc(null)} className="uz-hap isik-hap isik-hap-birincil">Yeni yazı</button>} />
                        ) : (
                            <ul className="divide-y divide-white/[0.07] rounded-[20px] border border-white/[0.08] bg-[#0A0A0F]">
                                {yazilar.map((yazi) => (
                                    <li key={yazi.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <span className="truncate text-[15.5px] font-medium text-white">{yazi.baslik}</span>
                                                <span className={`uz-etiket ${yazi.yayinlandi ? 'text-[#86EFAC]' : 'text-gri'}`}>
                                                    <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${yazi.yayinlandi ? 'bg-[#4ADE80]' : 'bg-gri-koyu'}`} />
                                                    {yazi.yayinlandi ? 'Yayında' : 'Taslak'}
                                                </span>
                                            </div>
                                            <p className="mt-1 flex flex-wrap gap-x-2 text-[13px] text-gri-koyu">
                                                <span className="font-kod">/blog/{yazi.slug}</span>
                                                <span aria-hidden>·</span>
                                                <span>{zamanFarki(yazi.created_at)}</span>
                                                <span aria-hidden>·</span>
                                                <span>{okumaSuresi(yazi.icerik)} dk okuma</span>
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2">
                                            {yazi.yayinlandi && (
                                                <a href={`/blog/${yazi.slug}`} target="_blank" rel="noopener noreferrer" className={`${metinDugmesi} inline-flex items-center gap-1.5`}>
                                                    Görüntüle <Ikon ad="disBaglanti" className="h-3.5 w-3.5" />
                                                    <span className="sr-only">(yeni sekmede)</span>
                                                </a>
                                            )}
                                            <button type="button" onClick={() => editoruAc(yazi)} className={metinDugmesi}>Düzenle</button>
                                            <button type="button" onClick={() => yayinDurumuDegistir(yazi)} className={metinDugmesi}>
                                                {yazi.yayinlandi ? 'Taslağa al' : 'Yayınla'}
                                            </button>
                                            <button type="button" onClick={() => yaziSil(yazi)} className="text-[13px] text-gri transition-colors hover:text-[#FCA5A5]">Sil</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default AdminBlog
