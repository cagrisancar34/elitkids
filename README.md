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
```

## Notlar

- Supabase ortam degiskenleri tanimli oldugunda auth ve veri akisinin canli hali kullanilir.
- Gelistirme ortaminda rol bazli onizleme oturumu acilabilir; production ortaminda kapali kalir.
- Veritabani degisiklikleri `supabase/migrations` altinda tutulur.
