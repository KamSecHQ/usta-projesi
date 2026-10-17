// Derlemeden sonra çalışır (npm run build): paylaşım önizlemesi için sayfaya özel HTML üretir.
// Site tek sayfalık uygulama; LinkedIn, WhatsApp ve X bağlantıyı açarken JavaScript çalıştırmaz,
// yalnızca HTML'deki etiketleri okur. Bu yüzden dist/index.html kopyalanır ve başlık, açıklama,
// kanonik adres ile og/twitter etiketleri sayfaya göre değiştirilir. vercel.json o adresi bu
// dosyaya yönlendirir. Etiketlerden biri bulunamazsa derleme durur (sessizce eski etiket kalmasın).
import { readFileSync, writeFileSync } from 'node:fs'

const SITE = 'https://www.kalfahane.com'

const SAYFALAR = [
    {
        dosya: 'ornek.html',
        yol: '/ornek',
        baslik: 'Örnek vitrin: bir iş baştan sona — Kalfahane',
        aciklama: "Kalfahane'de bir iş nasıl ilerler: ilan, teklif, konuşma, teslim ve kıdem. Örnek bir işle adım adım gör; farklı sektörlerden örnek ilanlar ve ustalar.",
        gorsel: '/og-ornek.png',
        gorselAlt: 'Kalfahane örnek vitrin: Bir iş, baştan sona. Örnek ilan ve kabul edilen teklif.',
    },
]

const kacis = (m) => m.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const kaynak = readFileSync('dist/index.html', 'utf8')

for (const s of SAYFALAR) {
    const adres = `${SITE}${s.yol}`
    const gorsel = `${SITE}${s.gorsel}`
    const degisimler = [
        [/<title>[^<]*<\/title>/, `<title>${kacis(s.baslik)}</title>`],
        [/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${kacis(s.aciklama)}$2`],
        [/(<link rel="canonical" href=")[^"]*(")/, `$1${adres}$2`],
        [/(<meta property="og:url" content=")[^"]*(")/, `$1${adres}$2`],
        [/(<meta property="og:title" content=")[^"]*(")/, `$1${kacis(s.baslik)}$2`],
        [/(<meta property="og:description" content=")[^"]*(")/, `$1${kacis(s.aciklama)}$2`],
        [/(<meta property="og:image" content=")[^"]*(")/, `$1${gorsel}$2`],
        [/(<meta property="og:image:alt" content=")[^"]*(")/, `$1${kacis(s.gorselAlt)}$2`],
        [/(<meta name="twitter:title" content=")[^"]*(")/, `$1${kacis(s.baslik)}$2`],
        [/(<meta name="twitter:description" content=")[^"]*(")/, `$1${kacis(s.aciklama)}$2`],
        [/(<meta name="twitter:image" content=")[^"]*(")/, `$1${gorsel}$2`],
        [/(<meta name="twitter:image:alt" content=")[^"]*(")/, `$1${kacis(s.gorselAlt)}$2`],
    ]
    let html = kaynak
    for (const [desen, yerine] of degisimler) {
        if (!desen.test(html)) {
            console.error(`sayfa-etiketleri: ${s.dosya} için etiket bulunamadı: ${desen}`)
            process.exit(1)
        }
        html = html.replace(desen, yerine)
    }
    writeFileSync(`dist/${s.dosya}`, html)
    console.log(`yazıldı: dist/${s.dosya} (${s.yol})`)
}
