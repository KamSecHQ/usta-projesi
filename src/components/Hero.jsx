import { Link } from 'react-router-dom'
function Hero() {
    return (
        <section className="min-h-screen bg-[#0D2626] flex flex-col items-center justify-center text-center px-6">
            <span className="text-[#C97D3C] text-sm tracking-widest uppercase font-mono mb-6">
                Türkiye'nin Yazılım Çarşısı
            </span>
            <h1 className="text-[#F3ECE1] text-5xl md:text-6xl font-bold max-w-2xl leading-tight">
                İşini <span className="text-[#E3B776] italic">emin ellere</span> teslim et.
            </h1>
            <p className="text-[#9FC2BC] max-w-xl mt-6 text-lg">
                Usta, doğrulanmış Türk yazılımcılarla işletmeleri bir araya getiren bir pazaryeri.
            </p>
            <div className="mt-8 flex gap-4">
                <Link to="/kayit-ol" className="bg-[#C97D3C] text-[#0D2626] font-semibold px-6 py-3 rounded hover:scale-105 transition-transform
                ">
                    Yazılımcı Olarak Katıl

                </Link>


                <Link to="/is-ver" className="border border-[#21504E] text-[#F3ECE1] px-6 py-3 rounded  hover:scale-105 transition-transform
">
                    İş Vermek İstiyorum
                </Link>

            </div>
        </section>
    )
}

export default Hero
