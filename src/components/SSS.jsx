import { useState } from 'react'

const sorular = [
    {
        soru: "Usta tam olarak nedir?",
        cevap: "Usta, Türk yazılımcılarla iş sahiplerini bir araya getiren bir pazaryeri. Yazılımcılar profil ve portföylerini oluşturur, iş verenler bu portföylere bakarak doğrudan iletişime geçer."
    },
    {
        soru: "Yazılımcı olarak nasıl katılırım?",
        cevap: "Sağ üstteki \"Yazılımcı Olarak Katıl\" butonuna basarak hesap oluştur, ardından profilini (unvan, teknolojiler, projelerin) doldur. Profilin tamamlanır tamamlanmaz Ustalar listesinde görünmeye başlar."
    },
    {
        soru: "İş veren olarak güvenilir bir yazılımcıyı nasıl bulurum?",
        cevap: "Ustalar sayfasında isim, uzmanlık ya da teknolojiye göre arama yapabilir, her ustanın portföyünü ve tamamladığı projeleri inceleyebilirsin. Onaylı Usta rozeti, platform tarafından ekstra incelenmiş profilleri gösterir."
    },
    {
        soru: "Platformu kullanmak ücretli mi?",
        cevap: "Usta şu an geliştirme aşamasında ve profil oluşturmak, arama yapmak, iletişime geçmek tamamen ücretsiz. Ödeme ve komisyon sistemi ileride ayrıca duyurulacak."
    },
    {
        soru: "Verilerim güvende mi?",
        cevap: "Hesap bilgilerin Supabase altyapısında saklanır ve yalnızca sen kendi profilini düzenleyebilirsin. Başvuru/iletişim verilerine yalnızca yetkili yöneticiler erişebilir."
    },
]

function SSSOgesi({ soru, cevap, acik, onClick }) {
    return (
        <div className="border-b border-white/[0.08]">
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
            >
                <span className="text-[#F3ECE1] font-medium group-hover:text-[#C97D3C] transition-colors duration-300">
                    {soru}
                </span>
                <span className={`shrink-0 text-[#C97D3C] text-xl transition-transform duration-300 ${acik ? "rotate-45" : ""}`}>
                    +
                </span>
            </button>
            <div
                className={`grid transition-all duration-300 ease-out ${acik ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
                <div className="overflow-hidden">
                    <p className="text-[#9FC2BC] text-sm leading-relaxed pb-5 pr-8">
                        {cevap}
                    </p>
                </div>
            </div>
        </div>
    )
}

function SSS() {
    const [acikIndex, setAcikIndex] = useState(0)

    return (
        <section className="relative bg-[#0D2626] py-24 px-6">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
            <div className="max-w-2xl mx-auto">
                <span className="text-[#C97D3C] text-sm tracking-widest uppercase font-mono">
                    Merak Ettiklerin
                </span>
                <h2 className="text-[#F3ECE1] text-3xl font-bold mt-3 mb-10">
                    Sıkça Sorulan Sorular
                </h2>

                <div>
                    {sorular.map((s, i) => (
                        <SSSOgesi
                            key={s.soru}
                            soru={s.soru}
                            cevap={s.cevap}
                            acik={acikIndex === i}
                            onClick={() => setAcikIndex(acikIndex === i ? -1 : i)}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default SSS
