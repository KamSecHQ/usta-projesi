import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import useSayfaBasligi from '../useSayfaBasligi'
import { aramaIcinKatla, sikEtiketler } from '../ustaYardimcilari'
import { AramaKutusu, FiltreCipi, Anahtar, SiralamaSecici, SonucYok } from '../components/liste/ListeAraclari'
import { Sahne, HapLink } from '../components/uzay/Hareket'
import IlanKarti, { IskeletIlan } from '../components/ilan/IlanKarti'
import { BosTezgah } from '../components/usta/UstaIcazeti'
import OrnekVitrinDaveti from '../components/ornek/OrnekVitrinDaveti'

const SIRALAMALAR = [
    ['yeni', 'En yeni'],
    ['butce-yuksek', 'Bütçe (yüksekten)'],
    ['butce-dusuk', 'Bütçe (düşükten)'],
]
// Sıralama için ilanın bütçe değeri: üst sınır yoksa alt sınır
const butceDegeri = (ilan) => ilan.butce_max ?? ilan.butce_min ?? null

// Bu sayıdan az kayıt varken örnek vitrin daveti görünür
const ORNEK_DAVET_ESIGI = 10

function IsIlanlari() {
    useSayfaBasligi('İş ilanları', 'İşletmelerin açtığı güncel yazılım işleri: web sitesi, mobil uygulama, entegrasyon. Bütçeyi gör, teklifini ver.')

    // Süzme adres çubuğunda tutulur: paylaşılabilir ve geri tuşuyla korunur
    const [parametreler, setParametreler] = useSearchParams()
    const arama = parametreler.get('arama') || ''
    const teknoloji = parametreler.get('teknoloji') || ''
    const butceli = parametreler.get('butceli') === '1'
    const siralama = parametreler.get('sirala') || 'yeni'
    function ayarla(anahtar, deger) {
        const yeni = new URLSearchParams(parametreler)
        if (deger) yeni.set(anahtar, deger)
        else yeni.delete(anahtar)
        setParametreler(yeni, { replace: true })
    }

    const [ilanlar, setIlanlar] = useState([])
    const [isVerenler, setIsVerenler] = useState({})
    const [yukleniyor, setYukleniyor] = useState(true)

    useEffect(() => {
        let iptal = false
        async function ilanlariGetir() {
            const { data, error } = await supabase
                .from('ilanlar')
                .select('id, is_veren_id, baslik, aciklama, butce_min, butce_max, gerekli_teknolojiler, created_at')
                .eq('durum', 'acik')
                .order('created_at', { ascending: false })
            if (iptal) return
            if (error || !data) {
                setYukleniyor(false)
                return
            }
            // İlan sahiplerinin adları tek sorguda
            const idler = [...new Set(data.map((i) => i.is_veren_id))]
            const { data: profilData } = idler.length ? await supabase.from('profiller').select('id, ad_soyad').in('id', idler) : { data: [] }
            if (iptal) return
            setIlanlar(data)
            setIsVerenler(Object.fromEntries((profilData || []).map((p) => [p.id, p])))
            setYukleniyor(false)
        }
        ilanlariGetir()
        return () => {
            iptal = true
        }
    }, [])

    const teknolojiler = useMemo(() => sikEtiketler(ilanlar.map((i) => i.gerekli_teknolojiler)), [ilanlar])

    const sonuclar = useMemo(() => {
        const aranan = aramaIcinKatla(arama.trim())
        const secilenTek = aramaIcinKatla(teknoloji)
        const liste = ilanlar.filter((ilan) => {
            const tekler = (ilan.gerekli_teknolojiler || []).map(aramaIcinKatla)
            if (secilenTek && !tekler.includes(secilenTek)) return false
            if (butceli && butceDegeri(ilan) === null) return false
            if (!aranan) return true
            return aramaIcinKatla(ilan.baslik).includes(aranan) || aramaIcinKatla(ilan.aciklama).includes(aranan) || tekler.some((t) => t.includes(aranan))
        })
        if (siralama === 'butce-yuksek') liste.sort((a, b) => (butceDegeri(b) ?? -1) - (butceDegeri(a) ?? -1))
        if (siralama === 'butce-dusuk') liste.sort((a, b) => (butceDegeri(a) ?? Infinity) - (butceDegeri(b) ?? Infinity))
        return liste
    }, [ilanlar, arama, teknoloji, butceli, siralama])

    const suzuluyor = Boolean(arama || teknoloji || butceli)

    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />
            <section className="px-4 pb-28 pt-14 sm:px-8 lg:pt-20">
                <div className="mx-auto max-w-[1180px]">
                    <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
                        <div>
                            <h1 className="font-pjs text-[clamp(2.4rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.03em] text-white">İş ilanları</h1>
                            <p className="mt-4 max-w-[54ch] text-pretty text-[16px] font-light leading-[1.6] text-gri">
                                İşletmelerin açtığı güncel işler. Bütçeye ve teknolojiye göre süz, uygun olana teklif ver.
                            </p>
                        </div>
                        <div className="flex items-center gap-5">
                            {!yukleniyor && (
                                <p className="rakam text-[14px] text-gri" aria-live="polite">
                                    {suzuluyor ? `${ilanlar.length} ilandan ${sonuclar.length} tanesi` : `${ilanlar.length} açık ilan`}
                                </p>
                            )}
                            <HapLink to="/ilan-ver">İlan ver</HapLink>
                        </div>
                    </header>

                    {/* Çarşı küçükken: işleyişi örnek vitrinde göster */}
                    {!yukleniyor && ilanlar.length < ORNEK_DAVET_ESIGI && <OrnekVitrinDaveti className="mt-8 max-w-[760px]" />}

                    {ilanlar.length > 0 && (
                        <div className="liste-cubuk mt-10 flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
                            <div className="lg:w-[340px] lg:shrink-0">
                                <AramaKutusu deger={arama} degisti={(d) => ayarla('arama', d)} yerTutucu="Başlık, açıklama ya da teknoloji" etiket="İlan ara" />
                            </div>
                            <div className="liste-serit min-w-0 flex-1" role="group" aria-label="Teknolojiye göre süz">
                                <FiltreCipi secili={!teknoloji} tikla={() => ayarla('teknoloji', '')}>
                                    Tümü
                                </FiltreCipi>
                                {teknolojiler.map((t) => {
                                    const secili = aramaIcinKatla(teknoloji) === aramaIcinKatla(t.ad)
                                    return (
                                        <FiltreCipi key={t.ad} kod secili={secili} tikla={() => ayarla('teknoloji', secili ? '' : t.ad)}>
                                            {t.ad}
                                            <span className="rakam text-[11px] text-gri">{t.sayi}</span>
                                        </FiltreCipi>
                                    )
                                })}
                            </div>
                            <div className="flex shrink-0 items-center justify-between gap-3 lg:justify-end">
                                <Anahtar acik={butceli} degisti={(a) => ayarla('butceli', a ? '1' : '')}>
                                    Bütçesi belli
                                </Anahtar>
                                <SiralamaSecici deger={siralama} degisti={(d) => ayarla('sirala', d === 'yeni' ? '' : d)} secenekler={SIRALAMALAR} />
                            </div>
                        </div>
                    )}

                    <Sahne className="mt-8" esik={0.01}>
                        {yukleniyor ? (
                            <div className="grid gap-5 md:grid-cols-2">
                                <IskeletIlan />
                                <IskeletIlan />
                            </div>
                        ) : ilanlar.length === 0 ? (
                            <SonucYok
                                baslik="Şu an açık ilan yok"
                                metin="Bir işin varsa ilk ilanı sen aç; ustalar teklif getirsin. Yazılımcıysan profilini tamamla, yeni ilanlar açıldığında hazır ol."
                                eylem={
                                    <div className="flex flex-wrap justify-center gap-2.5">
                                        <HapLink to="/ilan-ver">İlan ver</HapLink>
                                        <HapLink to="/profilim" tur="cam">
                                            Profilimi tamamla
                                        </HapLink>
                                    </div>
                                }
                            />
                        ) : sonuclar.length === 0 ? (
                            <SonucYok
                                baslik="Bu süzgece uyan ilan yok"
                                metin="Aramayı kısaltmayı ya da filtreleri kaldırmayı dene."
                                eylem={
                                    <button type="button" onClick={() => setParametreler({}, { replace: true })} className="isik-hap rounded-full px-5 py-2.5 text-[14px] font-medium">
                                        Filtreleri temizle
                                    </button>
                                }
                            />
                        ) : (
                            <ul className="grid gap-5 md:grid-cols-2">
                                {sonuclar.map((ilan, i) => (
                                    <li key={ilan.id}>
                                        <IlanKarti ilan={ilan} isVeren={isVerenler[ilan.is_veren_id]} sira={Math.min(i, 6)} />
                                    </li>
                                ))}
                                {/* Satır yarım kalırsa iş verene açık davet */}
                                {!suzuluyor && sonuclar.length % 2 === 1 && (
                                    <li className="hidden md:block">
                                        <BosTezgah sira={Math.min(sonuclar.length, 6)} tur="ilan" />
                                    </li>
                                )}
                            </ul>
                        )}
                    </Sahne>
                </div>
            </section>
        </div>
    )
}

export default IsIlanlari
