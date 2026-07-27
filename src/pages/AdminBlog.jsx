import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import { slugOlustur, zamanFarki } from '../ustaYardimcilari'

function bosForm() {
    return { id: null, baslik: "", slug: "", kategori: "", ozet: "", icerik: "", kapak_gorseli_url: "", yayinlandi: false }
}

function AdminBlog() {
    useSayfaBasligi('Blog Yönetimi')
    const { user, yukleniyor: authYukleniyor } = useAuth()
    const [adminMi, setAdminMi] = useState(null)
    const [yazilar, setYazilar] = useState([])
    const [yukleniyor, setYukleniyor] = useState(true)
    const [form, setForm] = useState(bosForm())
    const [formAcik, setFormAcik] = useState(false)
    const [slugElleDegisti, setSlugElleDegisti] = useState(false)
    const [kaydediliyor, setKaydediliyor] = useState(false)
    const [hata, setHata] = useState("")

    useEffect(() => {
        async function adminKontrolEt() {
            if (!user) return
            const { data } = await supabase.from('profiller').select('admin').eq('id', user.id).single()
            setAdminMi(!!data?.admin)
        }
        if (user) adminKontrolEt()
    }, [user])

    async function yazilariGetir() {
        const { data, error } = await supabase.from('blog_yazilari').select('*').order('created_at', { ascending: false })
        if (!error) setYazilar(data)
        setYukleniyor(false)
    }

    useEffect(() => {
        if (adminMi) yazilariGetir()
    }, [adminMi])

    function yeniYaziAc() {
        setForm(bosForm())
        setSlugElleDegisti(false)
        setFormAcik(true)
        setHata("")
    }

    function yaziDuzenle(yazi) {
        setForm({ ...yazi })
        setSlugElleDegisti(true)
        setFormAcik(true)
        setHata("")
    }

    function basligiGuncelle(baslik) {
        setForm((f) => ({ ...f, baslik, slug: slugElleDegisti ? f.slug : slugOlustur(baslik) }))
    }

    async function kaydet(e) {
        e.preventDefault()
        if (!form.baslik.trim() || !form.slug.trim() || !form.icerik.trim()) {
            setHata('Başlık, slug ve içerik zorunlu.')
            return
        }
        setKaydediliyor(true)
        setHata("")

        const veriler = {
            baslik: form.baslik,
            slug: form.slug,
            kategori: form.kategori || null,
            ozet: form.ozet || null,
            icerik: form.icerik,
            kapak_gorseli_url: form.kapak_gorseli_url || null,
            yayinlandi: form.yayinlandi,
            guncellenme_tarihi: new Date().toISOString(),
        }

        const { error } = form.id
            ? await supabase.from('blog_yazilari').update(veriler).eq('id', form.id)
            : await supabase.from('blog_yazilari').insert(veriler)

        setKaydediliyor(false)
        if (error) {
            setHata(error.code === '23505' ? 'Bu slug zaten kullanılıyor.' : error.message)
        } else {
            setFormAcik(false)
            yazilariGetir()
        }
    }

    async function yayinDurumuDegistir(yazi) {
        await supabase.from('blog_yazilari').update({ yayinlandi: !yazi.yayinlandi }).eq('id', yazi.id)
        yazilariGetir()
    }

    async function yaziSil(id) {
        if (!confirm('Bu yazıyı kalıcı olarak silmek istediğine emin misin?')) return
        await supabase.from('blog_yazilari').delete().eq('id', id)
        yazilariGetir()
    }

    if (authYukleniyor || (user && adminMi === null)) {
        return <div className="min-h-screen bg-[#0D2626] flex items-center justify-center text-[#9FC2BC]">Yükleniyor...</div>
    }

    if (!user || adminMi === false) {
        return (
            <div className="min-h-screen bg-[#0D2626] flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-[#F3ECE1] text-2xl font-bold mb-3">Bu sayfayı görme yetkin yok</h1>
                <Link to="/" className="text-[#C97D3C] hover:underline">← Anasayfaya dön</Link>
            </div>
        )
    }

    const inputClass = "w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]/60 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-[#9FC2BC]/40"
    const labelClass = "text-[#9FC2BC] text-xs uppercase tracking-wider font-mono block mb-2"

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-3xl mx-auto">
                <Link to="/admin" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">
                    ← Yönetim Paneline dön
                </Link>
                <div className="flex items-center justify-between flex-wrap gap-4 mt-6 mb-10">
                    <h1 className="text-[#F3ECE1] text-3xl font-bold">Blog Yönetimi</h1>
                    {!formAcik && (
                        <button
                            onClick={yeniYaziAc}
                            className="bg-[#C97D3C] text-[#0D2626] font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#E3B776] transition-all duration-300"
                        >
                            + Yeni Yazı
                        </button>
                    )}
                </div>

                {formAcik && (
                    <form onSubmit={kaydet} className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4 mb-8">
                        <div>
                            <label className={labelClass}>Başlık</label>
                            <input type="text" value={form.baslik} onChange={(e) => basligiGuncelle(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Slug (URL)</label>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={(e) => { setForm((f) => ({ ...f, slug: e.target.value })); setSlugElleDegisti(true) }}
                                className={inputClass}
                            />
                            <p className="text-[#9FC2BC]/50 text-xs mt-1">/blog/{form.slug || "..."}</p>
                        </div>
                        <div>
                            <label className={labelClass}>Kategori</label>
                            <input type="text" value={form.kategori} onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))} placeholder="örn. Rehber" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Kapak Görseli Linki</label>
                            <input type="url" value={form.kapak_gorseli_url} onChange={(e) => setForm((f) => ({ ...f, kapak_gorseli_url: e.target.value }))} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Özet (liste kartında görünür)</label>
                            <textarea value={form.ozet} onChange={(e) => setForm((f) => ({ ...f, ozet: e.target.value }))} rows={2} className={inputClass + " resize-none"} />
                        </div>
                        <div>
                            <label className={labelClass}>İçerik</label>
                            <textarea value={form.icerik} onChange={(e) => setForm((f) => ({ ...f, icerik: e.target.value }))} rows={12} className={inputClass + " resize-none"} />
                        </div>
                        <label className="flex items-center gap-2.5 text-[#9FC2BC] text-sm">
                            <input type="checkbox" checked={form.yayinlandi} onChange={(e) => setForm((f) => ({ ...f, yayinlandi: e.target.checked }))} className="w-4 h-4 accent-[#C97D3C]" />
                            Yayınla (işaretlemezsen taslak olarak kalır)
                        </label>

                        {hata && <p className="text-red-400 text-sm">{hata}</p>}

                        <div className="flex gap-3">
                            <button type="submit" disabled={kaydediliyor} className="bg-[#C97D3C] text-[#0D2626] font-semibold px-6 py-3 rounded-full disabled:opacity-50 hover:bg-[#E3B776] transition-all duration-300">
                                {kaydediliyor ? "Kaydediliyor..." : "Kaydet"}
                            </button>
                            <button type="button" onClick={() => setFormAcik(false)} className="text-[#9FC2BC] text-sm px-4 py-3 hover:text-[#F3ECE1] transition-colors">
                                İptal
                            </button>
                        </div>
                    </form>
                )}

                {yukleniyor ? (
                    <p className="text-[#9FC2BC] text-sm">Yükleniyor...</p>
                ) : yazilar.length === 0 ? (
                    <p className="text-[#9FC2BC] text-sm">Henüz yazı yok.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {yazilar.map((yazi) => (
                            <div key={yazi.id} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 flex items-start justify-between gap-3 flex-wrap">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[#F3ECE1] font-medium">{yazi.baslik}</span>
                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${yazi.yayinlandi ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'bg-white/[0.06] text-[#9FC2BC]'}`}>
                                            {yazi.yayinlandi ? 'YAYINDA' : 'TASLAK'}
                                        </span>
                                    </div>
                                    <p className="text-[#9FC2BC]/60 text-xs mt-1">/blog/{yazi.slug} · {zamanFarki(yazi.created_at)}</p>
                                </div>
                                <div className="flex gap-3 shrink-0">
                                    <button onClick={() => yayinDurumuDegistir(yazi)} className="text-[#9FC2BC] text-xs hover:text-[#C97D3C] transition-colors">
                                        {yazi.yayinlandi ? 'Yayından Kaldır' : 'Yayınla'}
                                    </button>
                                    <button onClick={() => yaziDuzenle(yazi)} className="text-[#9FC2BC] text-xs hover:text-[#F3ECE1] transition-colors">
                                        Düzenle
                                    </button>
                                    <button onClick={() => yaziSil(yazi.id)} className="text-[#9FC2BC] text-xs hover:text-red-300 transition-colors">
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminBlog
