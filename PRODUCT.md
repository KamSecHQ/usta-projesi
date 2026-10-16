# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Yazılımcılar ("ustalar")**: Türkiye'deki serbest çalışan yazılımcılar, ajanslar ve ekipler. Portföy oluşturur, iş ilanlarına teklif verir.
- **İş verenler**: Web sitesi, mobil uygulama, entegrasyon gibi yazılım işi yaptırmak isteyen işletmeler. İlan açar, teklif toplar, usta seçer.
- **Yöneticiler**: Başvuru ve blog yönetimi yapan admin kullanıcılar.

## Product Purpose
Doğrulanmış Türk yazılımcılarla işletmeleri bir araya getiren bir pazaryeri ("Türkiye'nin Yazılım Çarşısı"). Başarı: iş verenin güvenerek doğru ustayı bulması, ustanın görünür bir portföyle iş alması.

## Positioning
Yerel bir çarşı: Türkçe, TL ile, Türkiye'nin iş kültürüne göre. Global freelance platformlarındaki kur/komisyon şoku ve yabancı dilde destek yerine yerel ödeme, Türkçe destek ve doğrulanmış profiller.

## Operating Context
İş verenler ilan açar (/ilan-ver), ustalar teklif verir (/tekliflerim), profiller ve portföy projeleri herkese açıktır (/ustalar, /proje/:id). Ajans/takım profilleri, blog ve kullanıcı paneli (/panel) vardır.

## Capabilities and Constraints
- Stack: Vite + React 19 + React Router 7 + Tailwind CSS 4 + Supabase (Auth + Postgres, RLS). Vercel'de yayında (kalfahane.com).
- Aşama: **Erken erişim** — kayıt, profil, ilan ve teklif sistemi gerçek kullanıcılarla çalışıyor. **Ödeme/emanet (escrow) sistemi henüz yok**; site bunu çalışan bir özellik gibi sunmamalı.
- Ana sayfadaki istatistikler Supabase'den gerçek sayılardır.

## Brand Commitments
- Marka adı: **Kalfahane** (domain kalfahane.com). Platformdaki yazılımcılara "usta" denir.
- Dil: Türkçe. Ton: sıcak, güven veren, esnaf/çarşı kültürüne saygılı ama modern.

## Evidence on Hand
- Gerçek kullanıcı, ilan ve proje sayıları Supabase'de.
- Müşteri yorumu, basın, logo duvarı, vaka çalışması **yok** — uydurulmamalı.

## Product Principles
1. Güven önce gelir: her iddia doğrulanabilir olmalı.
2. Yerel ve samimi: çarşı ruhu, Türkçe, TL.
3. Usta görünür olsun: portföy ve gerçek iş, pazarlama dilinden önce gelir.
4. Erken erişimde dürüstlük: henüz olmayan özellik "yakında" olarak sunulur.
