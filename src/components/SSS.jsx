import { Sahne, SatirBaslik } from './uzay/Hareket'
import { useState } from 'react'

const sorular = [
    {
        soru: "Kalfahane tam olarak nedir?",
        cevap: "Kalfahane, Türk yazılımcılarla iş sahiplerini bir araya getiren bir pazaryeri. Yazılımcılar profil ve portföylerini oluşturur, iş verenler bu portföylere bakarak doğrudan iletişime geçer."
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
        cevap: "Kalfahane şu an geliştirme aşamasında ve profil oluşturmak, arama yapmak, iletişime geçmek tamamen ücretsiz. Ödeme ve komisyon sistemi ileride ayrıca duyurulacak."
    },
    {
        soru: "Verilerim güvende mi?",
        cevap: "Hesap bilgilerin Supabase altyapısında saklanır ve yalnızca sen kendi profilini düzenleyebilirsin. Başvuru/iletişim verilerine yalnızca yetkili yöneticiler erişebilir."
    },
]

function SSSOgesi({ soru, cevap, acik, onClick, sira }) {
    return (
        <div className="uz-kalk border-b border-white/[0.08] last:border-b-0" style={{ '--d': `${0.2 + sira * 0.06}s` }}>
            <button
                onClick={onClick}
                aria-expanded={acik}
                className="group flex w-full items-center justify-between gap-6 px-5 py-5 text-left sm:px-7 sm:py-6"
            >
                <span className="text-[17px] font-medium tracking-[-0.01em] text-white transition-colors duration-300 group-hover:text-mor-soluk sm:text-[19px]">
                    {soru}
                </span>
                <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${acik ? 'border-white bg-white text-black' : 'border-white/[0.12] text-white'}`} aria-hidden>
                    <span className="absolute h-[1.5px] w-3 bg-current" />
                    <span className={`absolute h-3 w-[1.5px] bg-current transition-transform duration-500 ease-(--ease-cekic) ${acik ? 'scale-y-0' : ''}`} />
                </span>
            </button>
            <div
                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-(--ease-cekic) ${acik ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
                <div className="overflow-hidden">
                    <p className="max-w-[64ch] px-5 pb-6 pr-14 text-[15.5px] font-light leading-relaxed text-gri sm:px-7">
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
        <Sahne as="section" className="uz-ufuk px-4 py-28 sm:px-8 lg:py-36">
            <div className="mx-auto max-w-[1100px] text-center">
                <SatirBaslik
                    satirlar={['Çarşıya girmeden önce.']}
                    className="font-pjs text-[clamp(2.4rem,5.6vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.025em] text-white"
                />
            </div>
            <div className="uz-panel uz-otur mx-auto mt-12 max-w-[860px]" style={{ '--d': '0.2s' }}>
                {sorular.map((s, i) => (
                    <SSSOgesi
                        key={s.soru}
                        soru={s.soru}
                        cevap={s.cevap}
                        sira={i}
                        acik={acikIndex === i}
                        onClick={() => setAcikIndex(acikIndex === i ? -1 : i)}
                    />
                ))}
            </div>
        </Sahne>
    )
}

export default SSS
