import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'


function KayitOl() {
    const [form, setForm] = useState({ ad: "", email: "", uzmanlik: "" })
    const [gonderildi, setGonderildi] = useState(false)

    function degisiklikYap(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function formGonder(e) {
        e.preventDefault()
        const { error } = await supabase.from('basvurular').insert([
            { ad: form.firma, email: form.email, uzmanlik: form.ihtiyac, tip: 'is-veren' }
        ])
        if (error) {
            console.error('Hata:', error)
            alert('Bir sorun oluştu, tekrar dener misin?')
            return
        }
        setGonderildi(true)
    }


    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-20">
            <div className="max-w-md mx-auto">
                <Link to="/" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1]">
                    ← Anasayfaya dön
                </Link>

                <h1 className="text-[#F3ECE1] text-3xl font-bold mt-6 mb-2">
                    Usta'ya Katıl
                </h1>
                <p className="text-[#9FC2BC] mb-8">
                    Yazılımcı olarak profilini oluştur, iş almaya başla.
                </p>

                {gonderildi ? (
                    <div className="bg-[#123434] border border-[#C97D3C] rounded p-6 text-center">
                        <p className="text-[#E3B776] font-semibold">Teşekkürler, {form.ad}!</p>
                        <p className="text-[#9FC2BC] text-sm mt-2">
                            Başvurun alındı, en kısa sürede dönüş yapılacak.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={formGonder} className="flex flex-col gap-4">
                        <div>
                            <label className="text-[#9FC2BC] text-sm block mb-1">Ad Soyad</label>
                            <input
                                type="text"
                                name="ad"
                                value={form.ad}
                                onChange={degisiklikYap}
                                required
                                className="w-full bg-[#123434] border border-[#21504E] rounded px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]"
                            />
                        </div>
                        <div>
                            <label className="text-[#9FC2BC] text-sm block mb-1">E-posta</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={degisiklikYap}
                                required
                                className="w-full bg-[#123434] border border-[#21504E] rounded px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]"
                            />
                        </div>
                        <div>
                            <label className="text-[#9FC2BC] text-sm block mb-1">Uzmanlık Alanı</label>
                            <input
                                type="text"
                                name="uzmanlik"
                                value={form.uzmanlik}
                                onChange={degisiklikYap}
                                placeholder="örn. React, Node.js"
                                className="w-full bg-[#123434] border border-[#21504E] rounded px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-[#C97D3C] text-[#0D2626] font-semibold px-6 py-3 rounded mt-2"
                        >
                            Başvuruyu Gönder
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default KayitOl
