import Hero from '../components/Hero'
import HizmetKategorileri from '../components/HizmetKategorileri'
import Steps from '../components/Steps'
import Ustalar from '../components/Ustalar'
import Istatistikler from '../components/Istatistikler'
import NedenUsta from '../components/NedenUsta'
import SSS from '../components/SSS'
import CtaFooter from '../components/CtaFooter'
import Footer from '../components/Footer'

function Anasayfa() {
    return (
        <div>
            <Hero />
            <HizmetKategorileri />
            <Steps />
            <Ustalar />
            <Istatistikler />
            <NedenUsta />
            <SSS />
            <CtaFooter />
            <Footer />
        </div>
    )
}

export default Anasayfa
