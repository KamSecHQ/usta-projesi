-- İlk üç blog yazısı (17 Ekim 2026). Taslak olarak eklendi (yayinlandi = false), aynı gün
-- kullanıcının onayıyla yayınlandı. Yayınlama Blog yönetiminden (/admin/blog) de yapılabilir.
-- Biçim: components/yazi/yaziBicimi.js ("## başlık", "- madde", "1. madde", "> alıntı", **kalın**).
-- Aynı slug varsa dokunulmaz: dosya tekrar çalıştırılabilir.

insert into public.blog_yazilari (baslik, slug, kategori, ozet, icerik, yayinlandi)
values
(
'Yazılım bütçesi nasıl belirlenir? Kapsamdan teklife adım adım',
'yazilim-butcesi-nasil-belirlenir',
'Rehber',
'Bütçeyi kapsamdan önce koymak en sık yapılan hata. Kapsamı netleştirme, ilk sürümü küçültme, teklifleri karşılaştırma, ödemeyi aşamalara bölme ve gözden kaçan maliyetler üzerine pratik bir rehber.',
$yazi$Yazılım yaptırırken en sık yapılan hata, bütçeyi işin kapsamından önce belirlemektir. "Elimde şu kadar para var, buna bir site olur mu?" sorusunun cevabı çoğu zaman "olur"; ama hangi siteyi kastettiğin belli değilse gelen teklifler de birbirinden çok farklı olur. Bu rehberde kapsamı nasıl netleştireceğini, teklifleri nasıl karşılaştıracağını ve bütçeni nasıl koruyacağını adım adım anlatıyoruz.

## Önce kapsamı yaz

İyi bir ilan, ustanın soru sormadan anlayabileceği kadar açıktır. Uzun bir şartname gerekmez; şu dört soruya kısa cevaplar yeterli:

- Bu yazılım kimin hangi işini kolaylaştıracak?
- Olmazsa olmaz üç özellik hangisi?
- Hangi cihazlarda kullanılacak: telefon, bilgisayar, tablet?
- İlk sürüm ne zaman kullanıma açılmalı?

Elinde beğendiğin bir site ya da uygulama varsa bağlantısını ekle. "Şuna benzesin ama şu farkla" cümlesi, sayfalarca açıklamadan daha çok şey anlatır.

## İlk sürümü küçült

Bütçeyi en çok büyüten şey, ilk sürüme her şeyi sığdırmaya çalışmaktır. Özellik listeni ikiye ayır:

- **İlk sürüm:** Olmadan işin yürümeyeceği özellikler.
- **Sonra:** Güzel olur ama bekleyebilir dediklerin.

İlk sürüm kullanıma açıldığında gerçek kullanıcılardan öğrendiklerin, ikinci listenin bir kısmını gereksiz çıkarır. Hem daha az ödersin hem de daha erken kullanmaya başlarsın.

## Sabit fiyat mı, saatlik mi?

Kapsamı net, sınırları belli işlerde **sabit fiyat** iki taraf için de rahattır: ne ödeyeceğini baştan bilirsin. Kapsamı belirsiz, keşfederek ilerleyecek işlerde ise **saatlik ücret** daha adildir; usta belirsizliğin riskini fiyata eklemek zorunda kalmaz.

Arada bir yol da var: ilk aşamayı (tasarım ve kapsam çıkarma) sabit fiyatla yaptır, kalan işi o aşamada netleşen kapsama göre fiyatlandır.

## Teklifleri yan yana koy

Tutar tek başına bir şey söylemez. İki teklifi karşılaştırırken şunlara bak:

- Teklif ilanındaki her maddeyi kapsıyor mu, yoksa bir kısmını sessizce dışarıda mı bırakıyor?
- Teslim süresi ve ara teslimler belli mi?
- Kaç düzeltme hakkın var?
- Ustanın benzer bir işi daha önce yaptığını gösteren bir portföyü var mı?

Kalfahane'de İlanlarım sayfasındaki karşılaştırma görünümü bunun için var: her teklifin bütçene göre yerini, teknoloji uyumunu ve ustanın portföyünü aynı satırda görürsün.

> En ucuz teklif, çoğu zaman kapsamı en dar okunan tekliftir.

## Gözden kaçan maliyetleri unutma

Yazılımın kendisi kadar, onu ayakta tutan şeylerin de bir maliyeti vardır:

- Alan adı ve sunucu ya da barındırma ücreti
- Ücretli servisler: SMS, e-posta gönderimi, harita, ödeme altyapısı
- Uygulama mağazası hesapları
- Yayından sonraki bakım, güncelleme ve küçük düzeltmeler

Bunları teklif aşamasında sor ve hangisinin teklife dahil olduğunu yazılı hâle getir. Beklenmedik işler için bütçenin bir kısmını kenarda tutmak da iyi bir alışkanlıktır.

## Ödemeyi aşamalara böl

Tutarın tamamını başta ödemek de, sonda ödemek de iki taraftan birini riske sokar. Aşamalı ödeme ikisini de korur:

1. Tasarım ya da kapsam onayında ilk ödeme
2. Çalışan ilk sürümde ikinci ödeme
3. Yayından ve kabulden sonra son ödeme

Böylece iki taraf da her aşamada ne aldığını görür. Kalfahane şimdilik ödemeye aracılık etmiyor; aşamaları ve tutarları mesajlaşmada yazılı olarak netleştirmeni öneririz.

### Kısa kontrol listesi

- Kapsam yazılı mı?
- İlk sürümde neyin olup neyin olmadığı belli mi?
- Teslim tarihi ve ara teslimler belli mi?
- Ödeme hangi aşamalara bölündü?
- Kaynak kod ve hesaplar kime ait olacak?

Hazırsan ilanını birkaç dakikada açabilirsin: https://www.kalfahane.com/ilan-ver$yazi$,
false
),
(
'Usta gözünden: iş getiren teklif nasıl yazılır?',
'is-getiren-teklif-nasil-yazilir',
'Ustalar için',
'Tutarın yanında neler olmalı? İlanı kendi cümlelerinle özetlemek, benzer işini göstermek, takvimi, ara teslimleri ve kapsam dışını açıkça yazmak.',
$yazi$Bir ilana teklif veren tek usta sen değilsin. İş veren çoğu zaman birkaç teklifi yan yana açar ve kısa sürede karar verir. Bu kısa sürede öne çıkan teklif, en düşük tutarlı olan değil, işi anladığını en net gösteren tekliftir.

## İlanı kendi cümlelerinle özetle

Teklifin ilk iki cümlesi, ilanı okuduğunu kanıtlamalı. İlanı kopyalama; kendi cümlelerinle tekrar et:

> Kafenizde müşterilerin masadaki QR kodla menüyü görüp sipariş vermesini, siparişin mutfaktaki ekrana düşmesini ve menüyü sizin güncelleyebilmenizi istiyorsunuz.

Bu cümleyi okuyan iş veren "beni anlamış" der. Yanlış anladığın bir yer varsa da daha teklif aşamasında düzeltir.

## Benzer işini göster

"Yıllardır bu işi yapıyorum" cümlesi neredeyse her teklifte var. Onun yerine bu işe en çok benzeyen işini göster ve tek cümleyle bağla:

- Ne yaptın?
- Bu ilandaki işe neresi benziyor?
- Sonuç ne oldu?

Kalfahane'de portföyüne eklediğin işler profilinde görünür; teklifte o işin adını anman yeterli. Portföyün boşsa önce bir iki işini eklemek, yeni bir teklif yazmaktan daha çok işe yarar.

## Nasıl yapacağını kısaca anlat

Teknik ayrıntıya boğma; iş verenin anlayacağı dille yaklaşımını yaz. Hangi teknolojiyi neden seçtiğini bir cümleyle söyle. İlanda teknoloji belirtilmişse ona uy; farklı bir önerin varsa gerekçesini yaz, karar iş verende kalsın.

## Takvimi ve ara teslimleri yaz

"Üç haftada teslim ederim" yerine:

1. Birinci hafta: tasarım taslağı, onayına sunarım
2. İkinci hafta: çalışan ilk sürüm
3. Üçüncü hafta: düzeltmeler ve yayın

Ara teslimler hem iş verene hem sana güven verir: yanlış giden bir şey üçüncü haftada değil, birinci haftada ortaya çıkar. Ödemeyi bu aşamalara bağlamayı da önerebilirsin.

## Fiyatın neyi kapsadığını açıkça yaz

Tutarın yanında şunları belirt:

- Teklife dahil olanlar
- **Kapsam dışında** kalanlar (örneğin içerik girişi ya da ücretli servislerin bedeli)
- Kaç tur düzeltme hakkı olduğu
- Yayından sonra ne kadar süre ücretsiz hata düzelttiğin

Kapsam dışını baştan yazmak, iş bittiğinde çıkabilecek tartışmaların çoğunu önler.

## Gerekirse sor, ama az sor

İlanda gerçekten eksik bir bilgi varsa bir ya da iki net soru sor. Kalfahane'de teklif vermeden de ilan sahibine soru sorabilirsin; emin olmadığın bir işte önce sormak, yanlış bir teklif vermekten iyidir.

## Kısa tut

İyi bir teklif çoğu zaman tek ekrana sığar. Şu sırayı izleyebilirsin:

1. İlanın özeti (iki cümle)
2. Benzer işin (bir cümle)
3. Yaklaşımın (iki üç cümle)
4. Takvim ve ara teslimler
5. Tutar ve kapsam

### Gönder düğmesine basmadan önce

- İlandaki her maddeye değindin mi?
- Benzer bir işini gösterdin mi?
- Takvim ve ara teslimler belli mi?
- Kapsam dışı ve düzeltme sayısı yazılı mı?

Tamamlanan her iş kıdemine işlenir. İlk işin için açık ilanlara göz atabilirsin: https://www.kalfahane.com/is-ilanlari$yazi$,
false
),
(
'Serbest yazılım işinde sözleşmede olması gereken 7 madde',
'sozlesmede-olmasi-gereken-7-madde',
'Rehber',
'Kapsam, teslim ve kabul, ödeme planı, düzeltme hakkı, kaynak kod ve fikri haklar, gizlilik ve kişisel veriler, bakım ve fesih: kısa ve anlaşılır bir kontrol listesi.',
$yazi$Küçük bir iş için sözleşme yapmak gereksiz görünebilir. Ama yazılı olmayan her konu, iş bittiğinde iki tarafın farklı hatırladığı bir konudur. Sözleşmenin uzun ya da karmaşık olması gerekmez; aşağıdaki yedi maddeyi açıkça yazmak, sorunların çoğunu baştan önler.

> Bu yazı genel bilgi içindir, hukuki danışmanlık değildir. Büyük tutarlı ya da uzun süreli işlerde bir avukata danışmanı öneririz.

## 1. Kapsam

Ne yapılacağını madde madde yaz: hangi ekranlar, hangi özellikler, hangi cihazlar. Aynı açıklıkla neyin **yapılmayacağını** da yaz. İlan metni ve kabul edilen teklif iyi bir başlangıçtır; sözleşmeye ek olarak koyabilirsin.

## 2. Teslim takvimi ve kabul

Teslim tarihlerini ve ara teslimleri yaz. Bir teslimin ne zaman kabul edilmiş sayılacağını da belirle: örneğin iş veren teslimden sonraki yedi gün içinde itiraz etmezse o aşama kabul edilmiş sayılır. Bu madde, sonu gelmeyen "bir de şunu düzeltelim" döngüsünü önler.

## 3. Ödeme planı

Toplam tutarı, aşamaları ve her aşamanın ne zaman ödeneceğini yaz. Fatura kesilip kesilmeyeceğini ve vergilerin tutara dahil olup olmadığını da netleştir. Gecikme durumunda ne olacağını kısaca belirtmek iki tarafı da korur.

## 4. Düzeltme hakkı ve yeni istekler

Her aşamada kaç tur düzeltme hakkı olduğunu yaz. Kapsamda olmayan yeni bir istek geldiğinde nasıl fiyatlanacağını da baştan belirle: saatlik ücretle mi, ayrı bir teklifle mi? "Küçük bir ekleme" diye başlayan istekler, kapsamın sessizce büyümesinin en yaygın yoludur.

## 5. Kaynak kod ve fikri haklar

Ödemenin tamamı yapıldığında kaynak kodun, tasarım dosyalarının ve hesapların (alan adı, sunucu, uygulama mağazası) kime ait olacağını yaz. Ustanın daha önce yazdığı ve başka işlerde de kullandığı genel parçalar varsa bunların nasıl kullanılabileceğini belirt. Ustanın işi portföyünde gösterip gösteremeyeceğini de bu maddede konuşun.

## 6. Gizlilik ve kişisel veriler

Usta işi yaparken müşteri listeleri, siparişler ya da başka kişisel verilerle karşılaşabilir. Bu verilerin yalnızca iş için kullanılacağını, üçüncü kişilerle paylaşılmayacağını ve iş bitince nasıl silineceğini yaz. Kişisel veri işleyen işlerde 6698 sayılı Kişisel Verilerin Korunması Kanunu'na (KVKK) uygunluğu birlikte gözetin.

## 7. Bakım, garanti ve fesih

Yayından sonra hangi süre içinde hataların ücretsiz düzeltileceğini yaz. Sürekli bakım isteniyorsa bunun ayrı ve ücretli olduğunu belirt. Son olarak, taraflardan biri işi yarıda bırakmak isterse ne olacağını yaz: o güne kadar yapılan iş nasıl ödenir, teslim edilen dosyalar kime kalır.

### Kısa kontrol listesi

- Kapsam ve kapsam dışı yazılı mı?
- Teslim tarihleri ve kabul süresi belli mi?
- Ödeme aşamaları ve fatura durumu belli mi?
- Düzeltme sayısı ve yeni isteklerin fiyatı belli mi?
- Kaynak kod ve hesaplar kime kalacak?
- Kişisel veriler nasıl korunacak?
- İş yarıda kalırsa ne olacak?

Kalfahane'de teklif kabul edilince iki taraf arasında konuşma kendiliğinden açılır; bu maddeleri orada yazılı olarak netleştirebilirsin.$yazi$,
false
)
on conflict (slug) do nothing;
