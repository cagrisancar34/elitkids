# Public CMS: Koyeb + Supabase + Cloudflare Gateway

Gerçek Payload yönetim paneli Koyeb üzerinde çalışan ayrı Node.js servisine taşınır. Kullanıcılar servise yalnızca ana domain üzerinden erişir:

- Mevcut yönetim merkezi: `https://elitsanatvesporkulubu.com/admin`
- Payload yönetimi: `https://elitsanatvesporkulubu.com/admin2`
- Events Yönetimi: `https://elitsanatvesporkulubu.com/admin2/events`
- Public Site CMS: `https://elitsanatvesporkulubu.com/admin2/public-site`

## 1. Supabase Hazırlığı

`supabase/migrations/0028_public_cms_infrastructure.sql` migration'ını mevcut projeye uygula. Migration:

- Data API rollerinden ayrılmış `public_cms` şemasını oluşturur.
- Şema sahibi olarak parolasız ve giriş yapamayan `payload_cms` rolünü oluşturur.
- Yalnız public okumaya açık `public-cms-media` bucket'ını oluşturur.

Supabase SQL Editor'da güçlü ve benzersiz bir parola belirleyerek rol girişini aç:

```sql
alter role payload_cms login password 'SUPABASE_PASSWORD_MANAGERDAN_URETILEN_GUCLU_PAROLA';
```

Session Pooler bağlantısını kullan. Kullanıcı adı `payload_cms.<project-ref>`, port `5432` olmalıdır. Transaction Pooler portu `6543` Payload migration'ları için kullanılmamalıdır.

Supabase Storage ayarlarından S3 bağlantısını etkinleştir ve yalnız Koyeb secret'larında tutulacak S3 access key üret.

Doğrulama sorguları:

```sql
select rolname, rolcanlogin, rolsuper, rolcreatedb, rolcreaterole
from pg_roles
where rolname = 'payload_cms';

select schema_name, schema_owner
from information_schema.schemata
where schema_name = 'public_cms';

select id, public, file_size_limit
from storage.buckets
where id = 'public-cms-media';
```

## 2. Koyeb Servisi

GitHub deposundan yeni bir Web Service oluştur:

- Builder: Dockerfile
- Dockerfile: `apps/public-cms/Dockerfile`
- Build context: repository root
- Port: `8000`
- Health check: `GET /health`
- Instance: Free

Koyeb secret/env değerleri:

```text
DATABASE_URI=Supabase Session Pooler URI, payload_cms kullanıcısı
PAYLOAD_DB_SCHEMA=public_cms
PAYLOAD_SECRET=en az 32 karakterlik benzersiz secret
CMS_ORIGIN_TOKEN=en az 32 karakterlik farklı bir secret
NEXT_PUBLIC_SITE_URL=https://elitsanatvesporkulubu.com
NEXT_PUBLIC_CMS_ASSET_PREFIX=/cms-assets
S3_ENABLED=true
S3_BUCKET=public-cms-media
S3_REGION=Supabase projesinin region değeri
S3_ENDPOINT=https://<project-ref>.storage.supabase.co/storage/v1/s3
S3_ACCESS_KEY_ID=Supabase Storage S3 access key
S3_SECRET_ACCESS_KEY=Supabase Storage S3 secret key
S3_PUBLIC_URL=https://<project-ref>.supabase.co/storage/v1/object/public/public-cms-media
```

Container her başlangıçta production env değerlerini doğrular ve bekleyen Payload migration'larını güvenli biçimde uygular. İlk deploy sonrasında Koyeb shell/job üzerinden:

```bash
npm run db:migrate:status
npm run seed:public-site
```

Koyeb origin adresinde yalnız `/health` doğrudan açılır. Diğer yollar `CMS_ORIGIN_TOKEN` olmadan `403` döner.

## 3. Cloudflare Gateway

Koyeb servis URL'sini ve aynı origin token'ı gateway secret'ı olarak tanımla:

```bash
cd apps/gateway
npx wrangler secret put CMS_ORIGIN
npx wrangler secret put CMS_ORIGIN_TOKEN
npm run deploy
```

Gateway route sahipliği:

- `/`, `/site/*`, `/cms-assets/*`, `/admin2/*`, `/cms-api/*`: Koyeb Payload servisi
- `/admin/*` ve diğer tüm eski yollar: mevcut `elitkids` Worker'ı
- `/sitemap.xml`, `/robots.txt`: gateway

Rollback için `apps/gateway/wrangler.jsonc` içindeki `CMS_USE_ROLLBACK` değerini `true` yapıp gateway'i yeniden deploy et. Trafik mevcut `elitkids-public-cms` service binding'ine döner.

## 4. İlk Kullanıcı ve Canlı Kontrol

Gateway deploy edildikten sonra `https://elitsanatvesporkulubu.com/admin2/create-first-user` üzerinden ilk Payload admin kullanıcısını oluştur. İlk kullanıcı oluşturulduğunda bu yol Payload tarafından otomatik kapanır.

Kontrol listesi:

1. `/admin` eski yönetim merkezini açar.
2. `/admin2`, `/admin2/events` ve `/admin2/public-site` Payload oturumu ile açılır.
3. Public Site CMS değişikliği ana sayfaya yansır.
4. Medya yükleme Supabase bucket'ına yazılır.
5. Form başvurusu hem Payload Başvurular listesinde hem mevcut ElitKids lead akışında görünür.
6. Koyeb origin `/admin2` isteği token olmadan `403` döner.
