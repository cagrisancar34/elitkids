# Dört Mevsim Doğada Public Sitesi

Koyeb üzerinde ayrı Node.js servisi olarak çalışan Next.js + Payload public program vitrini ve yönetim merkezi. Ana domain trafiği Cloudflare Gateway üzerinden bu servise aktarılır.

## Çalıştırma

```bash
npm install
npm run dev
```

Public site: `http://localhost:3000`

Canlı yönetim paneli: `https://elitsanatvesporkulubu.com/admin2`

## Yayın Merkezi

- `/admin2`, Payload tabanlı yönetim merkezini açar.
- Sol menüde `Public Site CMS` ve `Events Yönetimi` alanları birlikte bulunur.
- `/cms-api`, Payload REST ve GraphQL uçlarını sunar.
- Koyeb origin adresinde `/health` dışındaki tüm yollar `CMS_ORIGIN_TOKEN` olmadan kapalıdır.
- Başvuru formu önce Payload `applications` koleksiyonuna, sonra mevcut ElitKids lead akışına yazılır.

## Production

Production image repository root'undan oluşturulur:

```bash
docker build -f apps/public-cms/Dockerfile .
```

Container başlangıcında production env doğrulaması ve bekleyen Payload migration'ları otomatik çalışır. İlk içerik yüklemesi Koyeb shell/job üzerinden bir kez yapılır:

```bash
npm run seed:public-site
```

Tüm Koyeb, Supabase ve Cloudflare ayarları için `../../docs/public-cms-deployment.md` dosyasını kullanın.

## Kapsam

- Program, kategori, lokasyon, medya, yorum, partner, içerik sayfası ve başvuru koleksiyonları
- Ana sayfada haber manşeti biçiminde, numaralı ve otomatik geçişli öne çıkan içerik alanı
- Manşetten açılan SEO uyumlu haber detay sayfaları
- Manşet görseli, tam haber içeriği, bağlantısı, görünürlüğü ve sıralaması için CMS koleksiyonu
- Kalınlık, başlık, bağlantı, hizalama, metin rengi ve yazı tipi destekli haber editörü
- Operasyon metrikleri, hızlı işlemler ve son başvurular içeren özel Türkçe yönetim paneli
- Ana sayfanın ilk ekranı için içerik, görsel ve buton sekmelerinden oluşan yönetim ekranı
- Tüm kurumsal, bilgilendirme ve yasal sayfalar için blok tabanlı içerik yönetimi
- İçerik sayfalarında kapak, zengin metin, görsel + metin, özellik listesi, çağrı alanı, form, program ve lokasyon blokları
- İçerik sayfalarının üst/alt menü görünürlüğü, sırası, taslakları, sürümleri ve SEO alanları
- Filtreli program listeleme
- Program detayında başvuru formu
- KVKK/Gizlilik/Çerez sayfa şablonları
- Sitemap, robots ve temel Event JSON-LD
- Production'da zorunlu Supabase Storage S3 uyumlu medya depolama ayarları
