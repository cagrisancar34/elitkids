# Mimari Guvenlik Dokumani

## Hedef Mimari
- Uygulama: Next.js App Router
- Backend: Supabase Postgres + Auth + Storage + RLS
- Edge / perimeter: Cloudflare Workers & dashboard guvenlik katmani

## Rol Katmanlari
- Uygulama rolleri:
  - `admin`
  - `manager`
  - `coach`
  - `parent`
- Guvenlik rolleri:
  - `super_admin`
  - `admin`
  - `manager`
  - `staff`
  - `user`

Varsayilan esleme:
- `admin -> admin`
- `manager -> manager`
- `coach -> staff`
- `parent -> user`

## Koruma Katmanlari
1. `proxy.ts`
   - panel route auth zorunlulugu
   - auth route temiz yonlendirme
   - request correlation id
   - panel/api cache-control no-store
2. Layout guard
   - `/admin/*`, `/manager/*`, `/coach/*`, `/parent/*`
3. Server Actions / Route Handlers
   - schema validation
   - rol ve baglam kontrolu
4. Supabase RLS
   - tenant izolasyonu
   - role daraltmasi
5. Cloudflare
   - WAF
   - rate limit
   - bot korumasi

## Secret Yonetimi
- Browser bundle:
  - sadece `SUPABASE_URL`
  - sadece `SUPABASE_PUBLISHABLE_KEY`
- Server-only:
  - `SUPABASE_SERVICE_ROLE_KEY`
- `src/lib/supabase/server-config.ts` server-only olarak ayrildi.

## Storage Ayrimi
- `homepage-assets`
  - public
  - yalnizca landing ve kamuya acik vitrin gorselleri
- `pre-registration-assets`
  - private
  - signed URL ile gecici erisim
  - public URL yasak

## Auth ve Session
- SSR + cookie tabanli oturum
- panel route’lari auth’suz acilmaz
- demo auth sadece lokal/gelistirme icin acik

## Audit ve Loglama
- `audit_logs` kritik mutasyonlari toplar
- failed auth denemeleri audit kapsaminda tutulur
- public submit guvenlik metadata’si:
  - `submitted_ip`
  - `forwarded_ip`
  - `user_agent`
  - `device_summary`

## Canliya Cikis Oncesi Zorunlu Kosullar
- tum business tablolari icin RLS
- private/public bucket ayrimi
- CSP ve security header’lari aktif
- Cloudflare WAF ve rate limit aktif
- client bundle secret leak kontrolu temiz
- security review checklist tamam
