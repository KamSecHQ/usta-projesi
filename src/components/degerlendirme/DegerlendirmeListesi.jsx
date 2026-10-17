import { zamanFarki } from '../../ustaYardimcilari'
import { degerlendirmeOzeti } from './degerlendirmeVerisi'
import { YildizGosterge } from './Yildizlar'

// Profildeki değerlendirmeler: ortalama, dağılım ve yorumlar. Hepsi tamamlanmış işlerden gelir.
export default function DegerlendirmeListesi({ liste, kimeAit = 'Bu usta' }) {
    const ozet = degerlendirmeOzeti(liste)

    if (!ozet.adet) {
        return (
            <div className="rounded-[20px] border border-dashed border-white/[0.14] px-6 py-8 text-center">
                <p className="text-[15px] text-white">Henüz değerlendirme yok</p>
                <p className="mx-auto mt-1.5 max-w-[48ch] text-[14px] text-gri">
                    {kimeAit} bir işi tamamladığında, karşı taraf burada puan ve yorum bırakabilir. Değerlendirmeler yalnızca gerçekten tamamlanan işlerden gelir.
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.02] p-5 md:sticky md:top-24 md:self-start">
                <p className="rakam text-[40px] font-medium leading-none tracking-[-0.03em] text-white">{ozet.ortalama.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</p>
                <div className="mt-2">
                    <YildizGosterge puan={ozet.ortalama} />
                </div>
                <p className="rakam mt-1.5 text-[13px] text-gri">{ozet.adet} değerlendirme</p>
                <ul className="mt-5 flex flex-col gap-1.5" aria-label="Puan dağılımı">
                    {ozet.dagilim.map(({ puan, adet }) => (
                        <li key={puan} className="flex items-center gap-2 text-[12px] text-gri">
                            <span className="rakam w-3">{puan}</span>
                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]" aria-hidden>
                                <span className="block h-full rounded-full bg-mor-acik" style={{ width: `${(adet / ozet.adet) * 100}%` }} />
                            </span>
                            <span className="rakam w-4 text-right">{adet}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <ul className="flex flex-col gap-3">
                {liste.map((d) => (
                    <li key={d.id} className="rounded-[18px] border border-white/[0.08] bg-white/[0.02] p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <YildizGosterge puan={d.puan} />
                            <time dateTime={d.created_at} className="text-[12.5px] text-gri-koyu">
                                {zamanFarki(d.created_at)}
                            </time>
                        </div>
                        {d.yorum && <p className="mt-3 whitespace-pre-line text-[14.5px] leading-relaxed text-[#D4D4D8]">{d.yorum}</p>}
                        <p className="mt-3 text-[12.5px] text-gri">
                            {d.degerlendiren?.ad_soyad || 'Kalfahane üyesi'}
                            {d.ilan?.baslik && <> · {d.ilan.baslik}</>}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    )
}
