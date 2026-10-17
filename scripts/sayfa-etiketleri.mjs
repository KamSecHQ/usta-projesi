// Derlemeden sonra çalışır (npm run build): paylaşım önizlemesi için sayfaya özel HTML üretir.
// Site tek sayfalık uygulama; LinkedIn, WhatsApp ve X bağlantıyı açarken JavaScript çalıştırmaz,
// yalnızca HTML'deki etiketleri okur. dist/index.html kopyalanır, başlık, açıklama, kanonik adres
// ve og/twitter etiketleri SAYFA_ETIKETLERI'ne (src/paylasimEtiketleri.js) göre değiştirilir.
// vercel.json her yolu kendi dosyasına yönlendirir. Etiket bulunamazsa derleme durur.
import { readFileSync, writeFileSync } from 'node:fs'
import { SAYFA_ETIKETLERI, etiketleriDegistir } from '../src/paylasimEtiketleri.js'

const kaynak = readFileSync('dist/index.html', 'utf8')
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'))

for (const sayfa of Object.values(SAYFA_ETIKETLERI)) {
    const dosya = `${sayfa.yol.slice(1)}.html`
    writeFileSync(`dist/${dosya}`, etiketleriDegistir(kaynak, sayfa))
    // Yönlendirme unutulursa dosya hiç sunulmaz: derleme burada uyarır
    if (!vercel.rewrites.some((r) => r.source === sayfa.yol && r.destination === `/${dosya}`)) {
        console.error(`sayfa-etiketleri: vercel.json'da ${sayfa.yol} → /${dosya} yönlendirmesi yok`)
        process.exit(1)
    }
    console.log(`yazıldı: dist/${dosya} (${sayfa.yol})`)
}
