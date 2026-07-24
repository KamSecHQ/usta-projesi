import { Link } from 'react-router-dom'
import useSayfaBasligi from '../useSayfaBasligi'

function SayfaBulunamadi() {
    useSayfaBasligi('Sayfa Bulunamadı')
    return (
        <div className="min-h-screen bg-[#0D2626] flex flex-col items-center justify-center text-center px-6">
            <span className="text-[#C97D3C] font-mono text-sm tracking-widest">HATA 404</span>
            <h1 className="text-[#F3ECE1] text-4xl font-bold mt-4 mb-3">Sayfa bulunamadı</h1>
            <p className="text-[#9FC2BC] mb-8 max-w-sm">
                Aradığın sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
                <Link
                    to="/"
                    className="bg-[#C97D3C] text-[#0D2626] font-semibold px-6 py-3 rounded-full hover:bg-[#E3B776] transition-all duration-300"
                >
                    Anasayfaya Dön
                </Link>
                <Link
                    to="/ustalar"
                    className="bg-white/[0.05] border border-white/[0.1] text-[#F3ECE1] px-6 py-3 rounded-full hover:bg-white/[0.1] transition-all duration-300"
                >
                    Ustalara Göz At
                </Link>
            </div>
        </div>
    )
}

export default SayfaBulunamadi
