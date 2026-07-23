import { Link } from 'react-router-dom'

function Footer() {
    return (
        <footer className="bg-[#0D2626] border-t border-white/[0.08] px-6 pt-16 pb-8">
            <div className="max-w-5xl mx-auto">
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 pb-12">

                    <div className="col-span-2 sm:col-span-1">
                        <div className="text-[#F3ECE1] font-semibold text-lg mb-3">
                            USTA<span className="text-[#C97D3C]">.</span>
                        </div>
                        <p className="text-[#9FC2BC] text-sm leading-relaxed max-w-[220px]">
                            Doğrulanmış Türk yazılımcılarla işletmeleri bir araya getiren pazaryeri.
                        </p>
                    </div>

                    <div>
                        <div className="text-[#9FC2BC] text-xs uppercase tracking-wider font-mono mb-4">Platform</div>
                        <div className="flex flex-col gap-2.5">
                            <Link to="/ustalar" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">Tüm Ustalar</Link>
                            <Link to="/hesap-olustur?rol=yazilimci" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">Yazılımcı Olarak Katıl</Link>
                            <Link to="/hesap-olustur?rol=is-veren" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">İş Vermek İstiyorum</Link>
                        </div>
                    </div>

                    <div>
                        <div className="text-[#9FC2BC] text-xs uppercase tracking-wider font-mono mb-4">Hesap</div>
                        <div className="flex flex-col gap-2.5">
                            <Link to="/giris" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">Giriş Yap</Link>
                            <Link to="/hesap-olustur" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">Hesap Oluştur</Link>
                            <Link to="/profilim" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">Profilim</Link>
                        </div>
                    </div>

                    <div>
                        <div className="text-[#9FC2BC] text-xs uppercase tracking-wider font-mono mb-4">İletişim</div>
                        <div className="flex flex-col gap-2.5">
                            <a href="mailto:merhaba@usta.app" className="text-[#9FC2BC] text-sm hover:text-[#F3ECE1] transition-colors">merhaba@usta.app</a>
                            <span className="text-[#9FC2BC]/60 text-sm">İstanbul, Türkiye</span>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-white/[0.08]" />

                <div className="flex justify-between flex-wrap gap-2 text-[#9FC2BC]/60 text-xs font-mono pt-6">
                    <div>USTA — TÜRKİYE'NİN YAZILIM ÇARŞISI</div>
                    <div>KONSEPT — REV. 2026</div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
