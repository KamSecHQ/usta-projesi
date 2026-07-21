import { useState } from 'react'
import { Link } from 'react-router-dom'
import UstaCard from '../components/UstaCard'

function TumUstalar() {
    const [arama, setArama] = useState("")

    const ustalar = [
        { initials: "AY", name: "Ahmet Yıldız", role: "Frontend Geliştirici", desc: "React ve modern web arayüzleri konusunda uzman. 12 tamamlanmış proje.", tags: ["React", "Tailwind", "API"] },
        { initials: "MK", name: "Merve Kaya", role: "Full-Stack Geliştirici", desc: "E-ticaret ve işletme siteleri konusunda deneyimli. 20 tamamlanmış proje.", tags: ["Node.js", "React", "PostgreSQL"] },
        { initials: "SD", name: "Selin Demir", role: "Mobil Uygulama Geliştirici", desc: "React Native ile iOS/Android uygulamaları. 8 tamamlanmış proje.", tags: ["React Native", "Expo"] },
        { initials: "BÖ", name: "Berk Öztürk", role: "Backend Geliştirici", desc: "API tasarımı ve veritabanı optimizasyonu konusunda uzman. 15 proje.", tags: ["Node.js", "PostgreSQL", "Docker"] },
        { initials: "EÇ", name: "Ela Çelik", role: "UI/UX + Frontend", desc: "Tasarım ve kod arasında köprü kuruyor. 10 tamamlanmış proje.", tags: ["Figma", "React", "Tailwind"] },
    ]

    const filtrelenmis = ustalar.filter((u) => {
        const aramaKucuk = arama.toLowerCase()
        return (
            u.name.toLowerCase().includes(aramaKucuk) ||
            u.role.toLowerCase().includes(aramaKucuk) ||
            u.tags.some((t) => t.toLowerCase().includes(aramaKucuk))
        )
    })

    return (
        <div className="min-h-screen bg-[#0D2626] px-6 py-16">
            <div className="max-w-5xl mx-auto">
                <Link to="/" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1]">
                    ← Anasayfaya dön
                </Link>
                <h1 className="text-[#F3ECE1] text-3xl font-bold mt-6 mb-2">
                    Tüm Ustalar
                </h1>
                <p className="text-[#9FC2BC] mb-8">
                    İsim, uzmanlık ya da teknoloji ile ara.
                </p>

                <input
                    type="text"
                    value={arama}
                    onChange={(e) => setArama(e.target.value)}
                    placeholder="örn. React, Merve, Mobil..."
                    className="w-full max-w-md bg-[#123434] border border-[#21504E] rounded px-4 py-3 text-[#F3ECE1] outline-none focus:border-[#C97D3C] mb-10"
                />

                {filtrelenmis.length === 0 ? (
                    <p className="text-[#9FC2BC]">Aramanla eşleşen usta bulunamadı.</p>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {filtrelenmis.map((usta) => (
                            <UstaCard key={usta.name} {...usta} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TumUstalar
