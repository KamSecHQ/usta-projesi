import { Fragment } from 'react'
import { basliktanKimlik, bloklaraAyir } from './yaziBicimi'

const BAGLANTI = /(https?:\/\/[^\s<>"']*[^\s<>"'.,;:!?)\]])/g
const KALIN = /\*\*([^*]+)\*\*/g

function satirIci(metin, anahtar) {
    return metin.split(BAGLANTI).map((parca, i) => {
        if (i % 2 === 1) {
            return (
                <a key={`${anahtar}-${i}`} href={parca} target="_blank" rel="noopener noreferrer nofollow">
                    {parca.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
            )
        }
        return parca.split(KALIN).map((p, j) =>
            j % 2 === 1 ? <strong key={`${anahtar}-${i}-${j}`}>{p}</strong> : <Fragment key={`${anahtar}-${i}-${j}`}>{p}</Fragment>
        )
    })
}

// Okuma metni: blog yazısı ve benzeri uzun içerik. Biçim kuralları yaziBicimi.js'te.
function YaziGovdesi({ metin, className = '' }) {
    const bloklar = bloklaraAyir(metin)
    return (
        <div className={`yazi-govdesi ${className}`}>
            {bloklar.map((b, i) => {
                if (b.tur === 'h2') return <h2 key={i} id={basliktanKimlik(b.metin)}>{satirIci(b.metin, i)}</h2>
                if (b.tur === 'h3') return <h3 key={i}>{satirIci(b.metin, i)}</h3>
                if (b.tur === 'ul' || b.tur === 'ol') {
                    const Liste = b.tur
                    return (
                        <Liste key={i}>
                            {b.maddeler.map((m, j) => <li key={j}>{satirIci(m, `${i}-${j}`)}</li>)}
                        </Liste>
                    )
                }
                if (b.tur === 'alinti') {
                    return <blockquote key={i}>{b.satirlar.map((s, j) => <p key={j}>{satirIci(s, `${i}-${j}`)}</p>)}</blockquote>
                }
                return (
                    <p key={i}>
                        {b.satirlar.map((s, j) => (
                            <Fragment key={j}>
                                {j > 0 && <br />}
                                {satirIci(s, `${i}-${j}`)}
                            </Fragment>
                        ))}
                    </p>
                )
            })}
        </div>
    )
}

export default YaziGovdesi
