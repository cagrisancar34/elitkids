# Operasyon, Backup ve Secret Rotation

## Environment Ayrimi
- `dev`
  - lokal veya gelistirme Supabase
  - demo auth acik olabilir
- `staging`
  - production benzeri ama ayri veri
  - demo auth kapali
- `prod`
  - ayri secret seti
  - ayri Cloudflare kurallari

## Env Dosyalari
- `.env*` repoya girmez
- `.env.example` sadece placeholder tutar
- `SUPABASE_SERVICE_ROLE_KEY` sadece server environment icinde tanimli olur

## Secret Rotation
Donme listesi:
- `SUPABASE_SERVICE_ROLE_KEY`
- auth provider secret’lari
- Cloudflare deploy token / API token

Plan:
1. yeni secret olustur
2. staging’e uygula
3. smoke test
4. prod’a uygula
5. eski secret’i iptal et

## Backup
- Supabase DB backup:
  - gunluk otomatik snapshot
  - kritik deploy oncesi manuel export
- Storage backup:
  - `homepage-assets` low critical
  - `pre-registration-assets` high critical
  - private asset listesi ve path envanteri saklanmali

## Restore Proseduru
1. hedef ortam secilir
2. en guncel saglam backup belirlenir
3. staging uzerinde restore testi yapilir
4. uygulama smoke test gecerse prod restore onayi verilir

## Minimum Restore Testi
- login
- admin panel acilisi
- on kayit listesi
- ogrenci listesi
- odeme listesi
- private asset signed URL erisimi
