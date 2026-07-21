import { Link } from 'react-router-dom'
import UstaCard from './UstaCard'

function Ustalar() {
    const ustalar = [
        {
            initials: "AY",
            name: "Ad Soyad",
            role: "Frontend Geliştirici",
            desc: "React ve modern web arayüzleri konusunda uzman. 12 tamamlanmış proje.",
            tags: ["React", "Tailwind", "API"]
        },
        {
            initials: "MK",
            name: "Ad Soyad",
            role: "Full-Stack Geliştirici",
            desc: "E-ticaret ve işletme siteleri konusunda deneyimli. 20 tamamlanmış proje.",
            tags: ["Node.js", "React", "PostgreSQL"]
        },
        {
            initials: "SD",
            name: "Ad Soyad",
            role: "Mobil Uygulama Geliştirici",
            desc: "React Native ile iOS/Android uygulamaları. 8 tamamlanmış proje.",
            tags: ["React Native", "Expo"]
        }
    ]

    return (
        <section id="ustalar" className="bg-[#0D2626] py-24 px-6">

            <div className="max-w-5xl mx-auto">
                <span className="text-[#C97D3C] text-sm tracking-widest uppercase font-mono">
                    Öne Çıkanlar
                </span>
                <h2 className="text-[#F3ECE1] text-3xl font-bold mt-3 mb-12">
                    Ustalarımızdan örnekler
                </h2>
                <Link to="/ustalar" className="text-[#C97D3C] text-sm hover:underline mb-8 inline-block">
                    Tüm ustaları gör →
                </Link>

                <div className="grid md:grid-cols-3 gap-6">
                    {ustalar.map((usta) => (
                        <UstaCard key={usta.name + usta.role} {...usta} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Ustalar
