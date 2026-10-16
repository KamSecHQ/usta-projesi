import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import VideoHero from '../components/VideoHero'
import FizikPaneli from '../components/FizikPaneli'
import HizmetKategorileri from '../components/HizmetKategorileri'
import Surec from '../components/Surec'
import KidemCetveli from '../components/KidemCetveli'
import TeknolojiBolumu from '../components/TeknolojiBolumu'
import Ustalar from '../components/Ustalar'
import Istatistikler from '../components/Istatistikler'
import NedenUsta from '../components/NedenUsta'
import SSS from '../components/SSS'
import CtaFooter from '../components/CtaFooter'
import Footer from '../components/Footer'
import AtolyeTuvali from '../components/atolye/AtolyeTuvali'
import Yukleyici from '../components/hareket/Yukleyici'
import '../components/uzay/uzay.css'
import HataSiniri from '../components/hareket/HataSiniri'
import useSayfaBasligi from '../useSayfaBasligi'

function hareketAzaltilsinMi() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function Anasayfa() {
    useSayfaBasligi(null)
    const [heroHazir, setHeroHazir] = useState(false)
    const [yaziHazir, setYaziHazir] = useState(false)

    // Anasayfa, videolu hero'nun uzay temasında; diğer sayfalar kendi temalarında kalır.
    // Videolu hero kendi menüsünü taşır: sitenin menü çubuğu hero geçilince yukarıdan iner.
    useEffect(() => {
        const html = document.documentElement
        html.classList.add('uzay-tema', 'video-hero')
        const hero = document.getElementById('giris')
        let g
        if (hero) {
            g = new IntersectionObserver(([e]) => html.classList.toggle('hero-gecildi', !e.isIntersecting), { threshold: 0, rootMargin: '-64px 0px 0px 0px' })
            g.observe(hero)
        }
        return () => {
            g?.disconnect()
            html.classList.remove('uzay-tema', 'video-hero', 'hero-gecildi')
        }
    }, [])

    // Ataletli, yumuşak kaydırma (yalnızca anasayfa)
    useEffect(() => {
        if (hareketAzaltilsinMi()) return
        const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true })
        let kare
        function dongu(t) {
            lenis.raf(t)
            kare = requestAnimationFrame(dongu)
        }
        kare = requestAnimationFrame(dongu)
        return () => {
            cancelAnimationFrame(kare)
            lenis.destroy()
        }
    }, [])

    // Yükleme perdesi: yazı tipleri ve hero sahnesi hazır olunca kalkar; en geç 5 sn
    useEffect(() => {
        document.fonts.ready.then(() => setYaziHazir(true))
        const id = setTimeout(() => setHeroHazir(true), 4000)
        return () => clearTimeout(id)
    }, [])

    return (
        <div className="uzay">
            <div className="uz-yildizlar" aria-hidden />
            <Yukleyici hedef={yaziHazir ? 85 : 70} bitti={heroHazir && yaziHazir} />
            <VideoHero onHazir={() => setHeroHazir(true)} />
            <FizikPaneli />
            <Surec />
            <TeknolojiBolumu />
            <HizmetKategorileri />
            <KidemCetveli />
            <Ustalar />
            <Istatistikler />
            <NedenUsta />
            <SSS />
            <CtaFooter />
            <Footer />
            <HataSiniri>
                <AtolyeTuvali />
            </HataSiniri>
        </div>
    )
}

export default Anasayfa
