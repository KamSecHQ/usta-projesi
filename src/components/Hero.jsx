import { Link } from 'react-router-dom'

function Hero() {
    return (
        <section className="relative min-h-screen bg-[#0D2626] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_20%,rgba(201,125,60,0.12),transparent)]" />

            <span className="relative text-[#9FC2BC] text-xs tracking-[0.2em] uppercase font-light mb-8">
                Türkiye'nin Yazılım Çarşısı
            </span>
            <h1 className="relative text-[#F3ECE1] text-6xl md:text-8xl font-semibold max-w-4xl leading-[1.05] tracking-tight">
                İşini emin ellere teslim et.
            </h1>
            <p className="relative text-[#9FC2BC] max-w-xl mt-8 text-xl font-light leading-relaxed">
                Doğrulanmış Türk yazılımcılarla işletmeleri bir araya getiren bir pazaryeri.
            </p>
            <div className="relative mt-12 flex gap-4 flex-wrap justify-center">
                <Link
                    to="/hesap-olustur?rol=yazilimci"
                    className="bg-[#C97D3C] text-[#0D2626] font-semibold px-8 py-4 rounded-full hover:bg-[#E3B776] hover:scale-105 transition-all duration-300 text-sm"
                >
                    Yazılımcı Olarak Katıl
                </Link>
                <Link
                    to="/hesap-olustur?rol=is-veren"
                    className="bg-white/[0.05] backdrop-blur-md border border-white/[0.12] text-[#F3ECE1] font-medium px-8 py-4 rounded-full hover:bg-white/[0.1] hover:border-[#C97D3C]/40 hover:scale-105 transition-all duration-300 text-sm"
                >
                    İş Vermek İstiyorum
                </Link>
            </div>
        </section>
    )
}

export default Hero
