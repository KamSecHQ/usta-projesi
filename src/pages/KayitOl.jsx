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
            { ad: form.ad, email: form.email, uzmanlik: form.uzmanlik, tip: 'yazilimci' }
        ])
        if (error) {
            console.error('Hata:', error)
            alert('Bir sorun oluştu, tekrar dener misin?')
            return
        }
        setGonderildi(true)
    }


    return (
        <div className="min-h-screen bg-[#000000] px-6 py-20">
            <div className="max-w-md mx-auto">
                <Link to="/" className="text-[#A1A1AA] text-sm hover:text-[#FFFFFF]">
                    ← Anasayfaya dön
                </Link>

                <h1 className="text-[#FFFFFF] text-3xl font-bold mt-6 mb-2">
                    Usta'ya Katıl
                </h1>
                <p className="text-[#A1A1AA] mb-8">
                    Yazılımcı olarak profilini oluştur, iş almaya başla.
                </p>

                {gonderildi ? (
                    <div className="bg-[#0D0D13] border border-[#8B5CF6] rounded p-6 text-center">
                        <p className="text-[#C4B5FD] font-semibold">Teşekkürler, {form.ad}!</p>
                        <p className="text-[#A1A1AA] text-sm mt-2">
                            Başvurun alındı, en kısa sürede dönüş yapılacak.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={formGonder} className="flex flex-col gap-4">
                        <div>
                            <label className="text-[#A1A1AA] text-sm block mb-1">Ad Soyad</label>
                            <input
                                type="text"
                                name="ad"
                                value={form.ad}
                                onChange={degisiklikYap}
                                required
                                className="w-full bg-[#0D0D13] border border-[#2A2A33] rounded px-4 py-3 text-[#FFFFFF] outline-none focus:border-[#8B5CF6]"
                            />
                        </div>
                        <div>
                            <label className="text-[#A1A1AA] text-sm block mb-1">E-posta</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={degisiklikYap}
                                required
                                className="w-full bg-[#0D0D13] border border-[#2A2A33] rounded px-4 py-3 text-[#FFFFFF] outline-none focus:border-[#8B5CF6]"
                            />
                        </div>
                        <div>
                            <label className="text-[#A1A1AA] text-sm block mb-1">Uzmanlık Alanı</label>
                            <input
                                type="text"
                                name="uzmanlik"
                                value={form.uzmanlik}
                                onChange={degisiklikYap}
                                placeholder="örn. React, Node.js"
                                className="w-full bg-[#0D0D13] border border-[#2A2A33] rounded px-4 py-3 text-[#FFFFFF] outline-none focus:border-[#8B5CF6]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-[#FDFDFD] text-[#050505] font-semibold px-6 py-3 rounded mt-2"
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
