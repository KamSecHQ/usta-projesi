import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import useSayfaBasligi from '../useSayfaBasligi'
import UstaIcazeti, { BosTezgah, IskeletIcazet } from '../components/usta/UstaIcazeti'
import FavoriButonu from '../components/FavoriButonu'
import { AramaKutusu, FiltreCipi, Anahtar, SiralamaSecici, SonucYok } from '../components/liste/ListeAraclari'
import { Sahne } from '../components/uzay/Hareket'
import { USTA_ALANLARI, kartVerisiniTamamla, favorileriGetir } from '../ustaVerisi'
import { aramaIcinKatla, sikEtiketler } from '../ustaYardimcilari'

const SIRALAMALAR = [
    ['yeni', 'En yeni'],
    ['portfoy', 'Portföyü en zengin'],
    ['kidem', 'Tamamlanan işe göre'],
    ['ucret', 'Saatlik ücret (artan)'],
]

function TumUstalar() {
    useSayfaBasligi('Ustalar', 'Doğrulanmış Türk yazılımcıların portföylerini incele: React, mobil, e-ticaret ve daha fazlası. Teknolojiye göre ara, ustanı seç.')
    const { user } = useAuth()

    // Süzme adres çubuğunda: paylaşılabilir, geri tuşuyla korunur, bant plakasından gelince güncellenir
    const [parametreler, setParametreler] = useSearchParams()
    const arama = parametreler.get('arama') || ''
    const teknoloji = parametreler.get('teknoloji') || ''
    const yalnizMusait = parametreler.get('musait') === '1'
    const siralama = parametreler.get('sirala') || 'yeni'
    function ayarla(anahtar, deger) {
        const yeni = new URLSearchParams(parametreler)
        if (deger) yeni.set(anahtar, deger)
        else yeni.delete(anahtar)
        setParametreler(yeni, { replace: true })
    }

    const [ustalar, setUstalar] = useState([])
    const [projeler, setProjeler] = useState({})
    const [favoriler, setFavoriler] = useState(null)
    const [yukleniyor, setYukleniyor] = useState(true)

    useEffect(() => {
        let iptal = false
        async function veriGetir() {
            const { data, error } = await supabase
                .from('profiller')
                .select(USTA_ALANLARI)
                .eq('rol', 'yazilimci')
                .eq('onayli', true)
                .not('unvan', 'is', null)
                .order('created_at', { ascending: false })
            if (iptal) return
            if (error || !data) {
                setYukleniyor(false)
                return
            }
            const kart = await kartVerisiniTamamla(supabase, data)
            if (iptal) return
            setUstalar(kart.ustalar)
            setProjeler(kart.projeler)
            setYukleniyor(false)
        }
        veriGetir()
        return () => {
            iptal = true
        }
    }, [])

    // Favoriler kart başına değil, tek sorguda
    useEffect(() => {
        let iptal = false
        if (!user) {
            setFavoriler(null)
            return
        }
        favorileriGetir(supabase, user.id).then((kume) => !iptal && setFavoriler(kume))
        return () => {
            iptal = true
        }
    }, [user])

    const teknolojiler = useMemo(() => sikEtiketler(ustalar.map((u) => u.teknolojiler)), [ustalar])

    const sonuclar = useMemo(() => {
        const aranan = aramaIcinKatla(arama.trim())
        const secilenTek = aramaIcinKatla(teknoloji)
        const liste = ustalar.filter((u) => {
            const tekler = (u.teknolojiler || []).map(aramaIcinKatla)
            if (secilenTek && !tekler.includes(secilenTek)) return false
            if (yalnizMusait && (u.musaitlik || 'musait') !== 'musait') return false
            if (!aranan) return true
            return (
                aramaIcinKatla(u.ad_soyad).includes(aranan) ||
                aramaIcinKatla(u.unvan).includes(aranan) ||
                aramaIcinKatla(u.bio).includes(aranan) ||
                tekler.some((t) => t.includes(aranan))
            )
        })
        if (siralama === 'portfoy') liste.sort((a, b) => (projeler[b.id]?.length || 0) - (projeler[a.id]?.length || 0))
        if (siralama === 'kidem') liste.sort((a, b) => (b.tamamlanan || 0) - (a.tamamlanan || 0) || (projeler[b.id]?.length || 0) - (projeler[a.id]?.length || 0))
        if (siralama === 'ucret') liste.sort((a, b) => (a.saatlik_ucret_min ?? Infinity) - (b.saatlik_ucret_min ?? Infinity))
        return liste
    }, [ustalar, projeler, arama, teknoloji, yalnizMusait, siralama])

    const suzuluyor = Boolean(arama || teknoloji || yalnizMusait)
    const bosYer = !suzuluyor ? Math.max(0, 3 - sonuclar.length) : 0

    return (
        <div className="uzay min-h-screen">
            <div className="uz-yildizlar" aria-hidden />
            <section className="px-4 pb-28 pt-14 sm:px-8 lg:pt-20">
                <div className="mx-auto max-w-[1240px]">
                    <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
                        <div>
                            <h1 className="font-pjs text-[clamp(2.4rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.03em] text-white">Ustalar</h1>
                            <p className="mt-4 max-w-[54ch] text-pretty text-[16px] font-light leading-[1.6] text-gri">
                                Platformun incelediği onaylı yazılımcılar. Teknolojiye ve müsaitliğe göre süz, portföyüne bak, ustanı seç.
                            </p>
                        </div>
                        {!yukleniyor && (
                            <p className="rakam text-[14px] text-gri" aria-live="polite">
                                {suzuluyor ? `${ustalar.length} ustadan ${sonuclar.length} tanesi` : `${ustalar.length} onaylı usta`}
                            </p>
                        )}
                    </header>

                    <div className="liste-cubuk mt-10 flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
                        <div className="lg:w-[340px] lg:shrink-0">
                            <AramaKutusu deger={arama} degisti={(d) => ayarla('arama', d)} yerTutucu="İsim, uzmanlık ya da teknoloji" etiket="Usta ara" />
                        </div>
                        <div className="liste-serit min-w-0 flex-1" role="group" aria-label="Teknolojiye göre süz">
                            <FiltreCipi secili={!teknoloji} tikla={() => ayarla('teknoloji', '')}>
                                Tümü
                            </FiltreCipi>
                            {teknolojiler.map((t) => (
                                <FiltreCipi key={t.ad} kod secili={aramaIcinKatla(teknoloji) === aramaIcinKatla(t.ad)} tikla={() => ayarla('teknoloji', aramaIcinKatla(teknoloji) === aramaIcinKatla(t.ad) ? '' : t.ad)}>
                                    {t.ad}
                                    <span className="rakam text-[11px] text-gri">{t.sayi}</span>
                                </FiltreCipi>
                            ))}
                        </div>
                        <div className="flex shrink-0 items-center justify-between gap-3 lg:justify-end">
                            <Anahtar acik={yalnizMusait} degisti={(a) => ayarla('musait', a ? '1' : '')}>
                                Yalnızca müsait
                            </Anahtar>
                            <SiralamaSecici deger={siralama} degisti={(d) => ayarla('sirala', d === 'yeni' ? '' : d)} secenekler={SIRALAMALAR} />
                        </div>
                    </div>

                    <Sahne className="mt-8" esik={0.01}>
                        {yukleniyor ? (
                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                <IskeletIcazet />
                                <IskeletIcazet />
                                <IskeletIcazet />
                            </div>
                        ) : ustalar.length === 0 ? (
                            <BosTezgah sira={0} genis />
                        ) : sonuclar.length === 0 ? (
                            <SonucYok
                                baslik="Bu süzgece uyan usta yok"
                                metin="Aramayı kısaltmayı ya da teknoloji filtresini kaldırmayı dene. Aradığın usta henüz çarşıda değilse ilan aç; teklifler sana gelsin."
                                eylem={
                                    <button type="button" onClick={() => setParametreler({}, { replace: true })} className="isik-hap rounded-full px-5 py-2.5 text-[14px] font-medium">
                                        Filtreleri temizle
                                    </button>
                                }
                            />
                        ) : (
                            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {sonuclar.map((usta, i) => (
                                    <li key={usta.id}>
                                        <UstaIcazeti
                                            usta={usta}
                                            projeler={projeler[usta.id] || []}
                                            sira={Math.min(i, 5)}
                                            favori={favoriler && <FavoriButonu ustaId={usta.id} boyut="kucuk" baslangic={favoriler.has(usta.id)} />}
                                        />
                                    </li>
                                ))}
                                {Array.from({ length: bosYer }, (_, i) => (
                                    <li key={`bos-${i}`} className={i > 0 ? 'hidden lg:block' : ''}>
                                        <BosTezgah sira={sonuclar.length + i} tur={i === bosYer - 1 && bosYer > 1 ? 'isVeren' : 'usta'} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Sahne>
                </div>
            </section>
        </div>
    )
}

export default TumUstalar
