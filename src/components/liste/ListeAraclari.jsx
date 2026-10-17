import { useId } from 'react'
import '../uzay/uzay.css'

// Liste sayfalarının (/ustalar, /is-ilanlari) ortak araçları: arama kutusu, filtre çipi,
// açma-kapama anahtarı ve sıralama seçicisi. Görünüm uzay/uzay.css içindeki .liste-* sınıflarında.

export function AramaKutusu({ deger, degisti, yerTutucu, etiket }) {
    return (
        <label className="liste-arama">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-gri" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="sr-only">{etiket}</span>
            <input type="search" value={deger} onChange={(e) => degisti(e.target.value)} placeholder={yerTutucu} enterKeyHint="search" />
            {deger && (
                <button type="button" onClick={() => degisti('')} className="liste-temizle" aria-label="Aramayı temizle">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
                        <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                </button>
            )}
        </label>
    )
}

export function FiltreCipi({ secili, tikla, children, kod = false }) {
    return (
        <button type="button" aria-pressed={secili} onClick={tikla} className={`liste-cip ${kod ? 'font-kod text-[12.5px]' : ''}`}>
            {children}
        </button>
    )
}

export function Anahtar({ acik, degisti, children }) {
    return (
        <button type="button" role="switch" aria-checked={acik} onClick={() => degisti(!acik)} className="liste-anahtar">
            <span className="liste-anahtar-yol" aria-hidden>
                <span />
            </span>
            {children}
        </button>
    )
}

export function SiralamaSecici({ deger, degisti, secenekler }) {
    const id = useId()
    return (
        <span className="liste-secici">
            <label htmlFor={id} className="sr-only">
                Sıralama
            </label>
            <select id={id} value={deger} onChange={(e) => degisti(e.target.value)}>
                {secenekler.map(([d, ad]) => (
                    <option key={d} value={d}>
                        {ad}
                    </option>
                ))}
            </select>
            <svg viewBox="0 0 12 12" className="pointer-events-none h-3 w-3 text-gri" fill="none" aria-hidden>
                <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </span>
    )
}

// Sonuç yokken: neden boş olduğunu ve nasıl düzeleceğini söyler.
// Sayfanın tek içeriği buysa başlık h1 olarak verilir (BaslikEtiketi="h1").
export function SonucYok({ baslik, metin, eylem, BaslikEtiketi = 'p' }) {
    return (
        <div className="mx-auto max-w-[520px] rounded-[22px] border border-dashed border-white/[0.14] bg-[linear-gradient(180deg,rgba(139,92,246,0.08),rgba(255,255,255,0.01)_62%)] px-8 py-14 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" role="status">
            <BaslikEtiketi className="text-[20px] font-medium tracking-[-0.015em] text-white">{baslik}</BaslikEtiketi>
            <p className="mt-2 text-[15px] font-light leading-relaxed text-gri">{metin}</p>
            {eylem && <div className="mt-6 flex justify-center">{eylem}</div>}
        </div>
    )
}
