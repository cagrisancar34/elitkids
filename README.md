# Elit Sanat ve Spor Kulubu

Next.js 16, Supabase ve shadcn/ui temelli cok rollu spor okulu platformu.

## Uygulama kapsami

- Public landing, galeri ve SEO landing sayfalari
- `admin`, `manager`, `coach` ve `parent` rolleri icin ayri panel deneyimleri
- On kayit, ogrenci aktivasyonu, 8 hak allocation modeli ve seans operasyonlari
- Aylik tahakkuk, parcali odeme, borc takibi ve tahsilat ekranlari
- WhatsApp mesaj merkezi, konu bazli mesaj sablonlari ve panel bildirimleri
- Admin icerik yonetimi: landing, SEO, on kayit formu, testimonial ve galeri

## Gelistirme

```bash
npm install
npm run dev
```

Ortam degiskenleri icin:

```bash
cp .env.example .env.local
```

## Komutlar

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run cms:dev
npm run cms:build
npm run cms:bootstrap
npm run cms:migrate
npm run cms:test
npm run gateway:deploy
```

## Public CMS route dagilimi

- `/`: Dört Mevsim public ana sayfasi
- `/admin2`: Koyeb uzerindeki gercek Payload Yonetim Merkezi
- `/admin2/events`: Events Yonetimi ve basvuru takibi
- `/admin2/public-site`: Dört Mevsim public site yayin merkezi
- `/cms-api/basvuru`: Basvuruyu once Payload'a, sonra mevcut lead operasyonuna yazan guvenli Gateway rotasi
- `/site/*`: Program, haber, galeri ve custom public sayfalar
- `/anasayfa2`: Mevcut ElitKids ana sayfasi
- `/admin`: Mevcut ElitKids operasyon paneli

Koyeb, Supabase ve Cloudflare Gateway kurulum/yayin sirasi icin `docs/public-cms-deployment.md` dosyasini kullanin.

## Notlar

- Supabase ortam degiskenleri tanimli oldugunda auth ve veri akisinin canli hali kullanilir.
- Gelistirme ortaminda rol bazli onizleme oturumu acilabilir; production ortaminda kapali kalir.
- Veritabani degisiklikleri `supabase/migrations` altinda tutulur.
