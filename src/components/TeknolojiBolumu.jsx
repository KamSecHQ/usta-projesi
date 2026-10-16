import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { View, PerspectiveCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import AtolyeIsigi from './atolye/AtolyeIsigi'
import { Sahne, SatirBaslik } from './uzay/Hareket'
import TeknolojiBandi, { TEKNOLOJILER } from './atolye/TeknolojiBandi'

function hareketAzaltilsinMi() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Dar ekranda bant ve pres birlikte görünsün diye kamera geri çekilir
function BantKamerasi() {
    const dar = useThree((s) => s.size.width < 768)
    return (
        <PerspectiveCamera
            key={dar ? 'dar' : 'genis'}
            makeDefault
            position={dar ? [0.6, 5.2, 11.5] : [0.6, 4.0, 7.6]}
            fov={34}
            onUpdate={(c) => c.lookAt(0, 0.7, 0)}
        />
    )
}

function TeknolojiBolumu() {
    const navigate = useNavigate()
    const [azalt] = useState(hareketAzaltilsinMi)
    const git = (arama) => navigate(`/ustalar?arama=${encodeURIComponent(arama)}`)

    return (
        <Sahne as="section" className="uz-ufuk pt-28 lg:pt-36">
            <div className="mx-auto max-w-[1100px] px-4 text-center sm:px-8">
                <SatirBaslik
                    satirlar={['Her dilde usta,', 'her plaka onaylı.']}
                    className="font-pjs text-[clamp(2.4rem,5.6vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.025em] text-white"
                />
                <p className="uz-sub mx-auto mt-5 max-w-[44ch] text-[17px] font-light leading-[1.6] text-gri" style={{ '--d': '0.25s' }}>
                    Bant hiç durmuyor. Aradığın teknolojinin plakasına tıkla, o işte uzman ustaları sıralayalım.
                </p>
            </div>

            {/* Tam genişlik bant: panel yok, sahne sayfanın siyahında süzülür */}
            <div data-3d className="uz-otur relative mt-10 h-[72svh] min-h-[380px] w-full" style={{ '--d': '0.35s' }}>
                <View className="absolute inset-0">
                    <BantKamerasi />
                    <AtolyeIsigi />
                    <TeknolojiBandi git={git} azalt={azalt} />
                </View>
            </div>

            {/* Erişilebilir karşılık: aynı teknolojiler hap düğmeler olarak */}
            <ul className="mx-auto flex max-w-[1100px] flex-wrap justify-center gap-2 px-4 pb-10 pt-8 sm:px-8">
                {TEKNOLOJILER.map((t, i) => (
                    <li key={t.ad} className="uz-kalk" style={{ '--d': `${0.45 + i * 0.03}s` }}>
                        <button onClick={() => git(t.arama)} className="uz-hap uz-hap-cam h-9 px-4 font-kod text-[13px]">
                            {t.ad}
                        </button>
                    </li>
                ))}
            </ul>
        </Sahne>
    )
}

export default TeknolojiBolumu
