import { Link } from 'react-router-dom'
import { Ok } from '../uzay/Hareket'
import './ornek.css'

// Çarşı küçükken liste sayfalarında ve anasayfada: ziyaretçiyi örnek vitrine (/ornek) çağırır.
// Gösterilip gösterilmeyeceğine sayfa karar verir.
export default function OrnekVitrinDaveti({ className = '' }) {
    return (
        <Link
            to="/ornek"
            className={`group flex items-center gap-3 rounded-2xl border border-dashed border-mor-acik/35 bg-gradient-to-r from-mor/[0.1] to-mor/[0.02] px-4 py-3 text-[14px] text-[#D4D4D8] transition-colors hover:border-mor-acik/60 hover:text-white ${className}`}
        >
            <span className="ornek-cip">Örnek</span>
            <span className="min-w-0 flex-1">
                Çarşı yeni açıldı. Bir işin baştan sona nasıl ilerlediğini <span className="font-medium text-mor-soluk group-hover:text-white">örnek vitrinde gör</span>.
            </span>
            <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-1">
                <Ok />
            </span>
        </Link>
    )
}
