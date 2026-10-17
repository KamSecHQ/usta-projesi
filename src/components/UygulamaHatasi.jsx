import { Component } from 'react'

// Sayfalardan biri çökerse beyaz ekran yerine kurtarma ekranı gösterilir.
// Hata varken başka bir adrese geçilince sınır kendini sıfırlar; hata yokken
// adres değişimi sayfayı yeniden kurmaz (ör. /mesajlar/:id içinde konuşma değişimi).
export default class UygulamaHatasi extends Component {
    constructor(props) {
        super(props)
        this.state = { hata: null, konum: props.konum }
    }

    static getDerivedStateFromError(hata) {
        return { hata }
    }

    static getDerivedStateFromProps(props, durum) {
        if (props.konum === durum.konum) return null
        return { konum: props.konum, hata: null }
    }

    componentDidCatch(hata, bilgi) {
        console.error('Sayfa hatası:', hata, bilgi?.componentStack)
    }

    render() {
        if (!this.state.hata) return this.props.children
        return (
            <div role="alert" className="flex min-h-[80vh] flex-col items-center justify-center bg-black px-6 text-center font-pjs">
                <span className="font-kod text-sm tracking-widest text-mor-acik">BEKLENMEYEN HATA</span>
                <h1 className="mt-4 text-[clamp(2rem,4vw,2.6rem)] font-semibold tracking-[-0.03em] text-white">Bu sayfa açılırken bir sorun çıktı</h1>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-gri">
                    Bilgilerin güvende; yalnızca bu ekran çizilemedi. Sayfayı yenilemek çoğu zaman yeterli olur.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={() => window.location.reload()} className="isik isik-birincil rounded-full px-6 py-3 font-semibold">
                        Sayfayı yenile
                    </button>
                    <a href="/" className="isik isik-cam rounded-full px-6 py-3">
                        Anasayfaya dön
                    </a>
                </div>
            </div>
        )
    }
}
