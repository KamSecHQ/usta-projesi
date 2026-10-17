// Yalnızca geliştirmede: /blog?onizleme=1 ve /blog/:slug?onizleme=1
// Yayınlanmış yazı yokken liste ve okuma düzenini örnek içerikle görmeyi sağlar. Canlıda çağrılmaz.
const gunOnce = (g) => new Date(Date.now() - g * 86400000).toISOString()

const ICERIK = `Yazılım yaptırırken en sık yapılan hata, bütçeyi işin kapsamından önce belirlemektir. Bu yazıda kapsamı nasıl netleştireceğini ve gelen teklifleri nasıl karşılaştıracağını adım adım anlatıyoruz.

## Önce kapsamı yaz

İyi bir ilan, ustanın soru sormadan anlayabileceği kadar açıktır. Şu üç soruya cevap ver:

- Bu yazılım kimin hangi işini kolaylaştıracak?
- Olmazsa olmaz üç özellik hangisi?
- İlk sürüm ne zaman kullanıma açılmalı?

## Teklifleri yan yana koy

Tutar tek başına bir şey söylemez. **Teslim süresi, ara teslimler ve revizyon hakkı** aynı satırda olmalı. Kalfahane'de İlanlarım sayfasındaki karşılaştırma tablosu bunun için var.

> En ucuz teklif, çoğu zaman kapsamı en dar okunan tekliftir.

## Ödemeyi aşamalara böl

1. Tasarım onayında ilk ödeme
2. Çalışan sürümde ikinci ödeme
3. Yayından sonra son ödeme

Böylece iki taraf da her aşamada ne aldığını görür.

### Kısa kontrol listesi

- Kapsam yazılı mı?
- Teslim tarihi belli mi?
- Kaynak kod kime ait?

Daha fazlası için https://www.kalfahane.com/is-ilanlari adresindeki açık ilanlara bakabilirsin.`

export function blogOnizlemesi(acik) {
    if (acik !== '1') return null
    return [
        { id: 'b1', slug: 'yazilim-butcesi-nasil-belirlenir', baslik: 'Yazılım bütçesi nasıl belirlenir? Kapsamdan teklife adım adım', kategori: 'Rehber', ozet: 'Bütçeyi kapsamdan önce koymak en sık yapılan hata. Kapsamı netleştirme, teklifleri karşılaştırma ve ödemeyi aşamalara bölme üzerine pratik bir rehber.', icerik: ICERIK, kapak_gorseli_url: null, created_at: gunOnce(2), yayinlandi: true },
        { id: 'b2', slug: 'iyi-teklif-nasil-yazilir', baslik: 'Usta gözünden: iş getiren teklif nasıl yazılır?', kategori: 'Ustalar için', ozet: 'Tutarın yanında neler olmalı: benzer işler, ara teslimler ve açık bir takvim.', icerik: ICERIK, kapak_gorseli_url: null, created_at: gunOnce(9), yayinlandi: true },
        { id: 'b3', slug: 'react-mi-vue-mu', baslik: 'React mı Vue mu? İş veren için teknoloji seçimi', kategori: 'Teknoloji', ozet: 'Teknolojiyi ustaya bırakmak ne zaman doğru, ne zaman değil.', icerik: ICERIK, kapak_gorseli_url: null, created_at: gunOnce(15), yayinlandi: true },
        { id: 'b4', slug: 'sozlesmede-olmasi-gerekenler', baslik: 'Serbest yazılım işinde sözleşmede olması gereken 7 madde', kategori: 'Rehber', ozet: 'Kapsam, teslim, revizyon, kaynak kod ve gizlilik: kısa ve anlaşılır bir şablon.', icerik: ICERIK, kapak_gorseli_url: null, created_at: gunOnce(30), yayinlandi: true },
    ]
}
