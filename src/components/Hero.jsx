import { Link } from 'react-router-dom'

function Hero() {
    return (
        <section className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
            <span className="text-white/50 text-xs tracking-[0.2em] uppercase font-light mb-8">
                Türkiye'nin Yazılım Çarşısı
            </span>
            <h1 className="text-white text-6xl md:text-8xl font-semibold max-w-4xl leading-[1.05] tracking-tight">
                İşini emin ellere teslim et.
            </h1>
            <p className="text-white/50 max-w-xl mt-8 text-xl font-light leading-relaxed">
                Doğrulanmış Türk yazılımcılarla işletmeleri bir araya getiren bir pazaryeri.
            </p>
            <div className="mt-12 flex gap-4">
                <Link
                    to="/kayit-ol"
                    className="bg-white text-black font-medium px-8 py-4 rounded-full hover:scale-105 transition-transform text-sm"
                >
                    Yazılımcı Olarak Katıl
                </Link>
                <Link
                    to="/is-ver"
                    className="border border-white/20 text-white font-medium px-8 py-4 rounded-full hover:bg-white/10 hover:scale-105 transition-all text-sm"
                >
                    İş Vermek İstiyorum
                </Link>
            </div>
        </section>
    )
}

export default Hero
