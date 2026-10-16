import { Sahne, SatirBaslik, HapLink } from './uzay/Hareket'

// Kapanış: hero'nun aynası. Ufukta yükselen kürenin mor ışığı, ortada iki satırlık davet.
function CtaFooter() {
    return (
        <Sahne as="section" className="relative overflow-hidden px-4 pb-32 pt-36 sm:px-8 lg:pb-44 lg:pt-48">
            {/* Ufuktan doğan küre kenarı */}
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-[58%] h-[1400px] w-[1400px] -translate-x-1/2 rounded-full border border-mor-acik/40 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.28),rgba(6,6,10,0)_42%)] shadow-[0_-30px_120px_-20px_rgba(139,92,246,0.55),inset_0_40px_80px_-40px_rgba(196,181,253,0.35)] sm:top-[56%]" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-black" />
            <div className="relative mx-auto max-w-[1100px] text-center">
                <SatirBaslik
                    satirlar={['Bir işin mi var,', 'bir hünerin mi?']}
                    className="font-pjs text-[clamp(2.6rem,7vw,5.6rem)] font-medium leading-[1.01] tracking-[-0.03em] text-white"
                />
                <p className="uz-sub mx-auto mt-5 max-w-[44ch] text-[17px] font-light leading-[1.6] text-[#f6f6f6]" style={{ '--d': '0.3s' }}>
                    İş verenler ilan açar, ustalar teklif verir. Kalfahane'de ikisi de ücretsiz başlar.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                    <HapLink to="/hesap-olustur?rol=yazilimci" className="uz-otur" gecikme={0.45}>
                        Yazılımcı olarak katıl
                    </HapLink>
                    <HapLink to="/hesap-olustur?rol=is-veren" tur="cam" className="uz-otur" gecikme={0.52}>
                        İş vermek istiyorum
                    </HapLink>
                </div>
            </div>
        </Sahne>
    )
}

export default CtaFooter
