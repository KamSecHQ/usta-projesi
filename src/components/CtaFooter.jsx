function CtaFooter() {
    return (
        <>
            <section className="bg-[#0D2626] py-20 px-6">
                <div className="max-w-3xl mx-auto text-center bg-[#123434] border border-[#21504E] rounded p-14">
                    <h2 className="text-[#F3ECE1] text-3xl font-bold mb-4">
                        Bir işin mi var, bir hüner mi?
                    </h2>
                    <p className="text-[#9FC2BC] mb-8">Usta'ya katıl, ilk adımı at.</p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <button className="bg-[#C97D3C] text-[#0D2626] font-semibold px-6 py-3 rounded">
                            Yazılımcı Olarak Katıl
                        </button>
                        <button className="border border-[#21504E] text-[#F3ECE1] px-6 py-3 rounded">
                            İş Vermek İstiyorum
                        </button>
                    </div>
                </div>
            </section>
            <footer className="border-t border-[#21504E] py-8 px-6">
                <div className="max-w-5xl mx-auto flex justify-between flex-wrap gap-2 text-[#9FC2BC] text-xs font-mono">
                    <div>USTA — TÜRKİYE'NİN YAZILIM ÇARŞISI</div>
                    <div>KONSEPT — REV. 2026</div>
                </div>
            </footer>
        </>
    )
}

export default CtaFooter
