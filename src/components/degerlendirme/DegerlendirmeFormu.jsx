import { useId, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useBildirim } from '../bildirim/bildirimBaglami'
import { YildizSecici, YildizGosterge } from './Yildizlar'

// Tamamlanan bir işten sonra karşı tarafı değerlendirme. Değerlendirme herkese açıktır ve
// değerlendirilen kişinin profilinde görünür.
export default function DegerlendirmeFormu({ ilanId, kullaniciId, degerlenenId, degerlenenAd, mevcut, onTamam, onizleme = false }) {
    const bildir = useBildirim()
    const kok = useId()
    const [acik, setAcik] = useState(false)
    const [puan, setPuan] = useState(0)
    const [yorum, setYorum] = useState('')
    const [hata, setHata] = useState('')
    const [gonderiliyor, setGonderiliyor] = useState(false)

    if (mevcut) {
        return (
            <div className="rounded-[16px] border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[13.5px] text-gri">
                        <span className="text-white">{degerlenenAd}</span> için değerlendirmen
                    </p>
                    <YildizGosterge puan={mevcut.puan} />
                </div>
                {mevcut.yorum && <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-gri">{mevcut.yorum}</p>}
            </div>
        )
    }

    if (!acik) {
        return (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-mor/30 bg-mor/[0.08] p-4">
                <p className="text-[14px] text-white">
                    İş tamamlandı. <span className="text-gri">{degerlenenAd} ile çalışmak nasıldı?</span>
                </p>
                <button type="button" onClick={() => setAcik(true)} className="isik isik-mor rounded-full px-4 py-2 text-[13px] font-semibold">
                    Değerlendir
                </button>
            </div>
        )
    }

    async function gonder(e) {
        e.preventDefault()
        if (!puan) {
            setHata('Bir puan seç.')
            return
        }
        setHata('')
        if (onizleme) {
            bildir('Önizleme modunda değerlendirme kaydedilmez.')
            return
        }
        setGonderiliyor(true)
        const { error } = await supabase.from('degerlendirmeler').insert({
            ilan_id: ilanId,
            degerlendiren_id: kullaniciId,
            degerlenen_id: degerlenenId,
            puan,
            yorum: yorum.trim() || null,
        })
        setGonderiliyor(false)
        if (error) {
            bildir('Değerlendirme kaydedilemedi. Tekrar dene.', { tur: 'hata' })
            return
        }
        bildir('Değerlendirmen kaydedildi. Teşekkürler!', { tur: 'basari' })
        onTamam?.()
    }

    return (
        <form onSubmit={gonder} className="flex flex-col gap-5 rounded-[16px] border border-white/[0.1] bg-white/[0.025] p-5" aria-label={`${degerlenenAd} için değerlendirme`}>
            <YildizSecici deger={puan} degisti={setPuan} etiket={`${degerlenenAd} için puanın`} />
            <div>
                <label htmlFor={`${kok}-yorum`} className="alan-etiket">
                    Yorumun <span className="font-normal text-gri-koyu">(isteğe bağlı)</span>
                </label>
                <textarea
                    id={`${kok}-yorum`}
                    className="alan"
                    rows={3}
                    maxLength={1000}
                    value={yorum}
                    onChange={(e) => setYorum(e.target.value)}
                    placeholder="İletişim, zamanlama, işin kalitesi: başkalarının bilmesi gereken ne var?"
                />
                <p className="alan-ipucu">Değerlendirmen herkese açık görünür; adın ve işin başlığıyla birlikte.</p>
            </div>
            {hata && (
                <p className="alan-hata" role="alert">
                    {hata}
                </p>
            )}
            <div className="flex flex-wrap justify-end gap-2.5">
                <button type="button" onClick={() => setAcik(false)} className="isik isik-cam rounded-full px-4 py-2 text-[13px] font-medium">
                    Vazgeç
                </button>
                <button type="submit" disabled={gonderiliyor} className="isik isik-birincil rounded-full px-5 py-2 text-[13px] font-semibold disabled:opacity-60">
                    {gonderiliyor ? 'Kaydediliyor…' : 'Değerlendirmeyi gönder'}
                </button>
            </div>
        </form>
    )
}
