import { Link } from 'react-router-dom'
function CtaFooter() {
    return (
        <>
            <section className="bg-[#0D2626] py-20 px-6">
                <div className="max-w-3xl mx-auto text-center bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-14 shadow-2xl shadow-black/30">
                    <h2 className="text-[#F3ECE1] text-3xl font-bold mb-4">
                        Bir işin mi var, bir hüner mi?
                    </h2>
                    <p className="text-[#9FC2BC] mb-8">Usta'ya katıl, ilk adımı at.</p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link
                            to="/kayit-ol"
                            className="bg-[#C97D3C] text-[#0D2626] font-semibold px-6 py-3 rounded-full hover:bg-[#E3B776] hover:scale-105 transition-all duration-300"
                        >
                            Yazılımcı Olarak Katıl
                        </Link>
                        <Link
                            to="/is-ver"
                            className="bg-white/[0.05] backdrop-blur-md border border-white/[0.12] text-[#F3ECE1] px-6 py-3 rounded-full hover:bg-white/[0.1] hover:border-[#C97D3C]/40 hover:scale-105 transition-all duration-300"
                        >
                            İş Vermek İstiyorum
                        </Link>
                    </div>
                </div>
            </section>
            <footer className="bg-[#0D2626] border-t border-white/[0.08] py-8 px-6">
                <div className="max-w-5xl mx-auto flex justify-between flex-wrap gap-2 text-[#9FC2BC] text-xs font-mono">
                    <div>USTA — TÜRKİYE'NİN YAZILIM ÇARŞISI</div>
                    <div>KONSEPT — REV. 2026</div>
                </div>
            </footer>
        </>
    )
}

export default CtaFooter
