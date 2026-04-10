# Cloudflare Kural Listesi

## WAF
Dashboard-first uygulanacak.

### Rule 1
- Ad: `panel-auth-protect`
- Hedef:
  - `/admin/*`
  - `/manager/*`
  - `/coach/*`
  - `/parent/*`
- Aksiyon:
  - managed rules + bot score monitor

### Rule 2
- Ad: `api-sensitive-protect`
- Hedef:
  - `/api/*`
  - `/auth/*`
- Aksiyon:
  - WAF managed rules

## Rate Limit
### Login
- Ad: `rate-login`
- Hedef: `/login`
- Esik: 10 istek / 5 dk / IP
- Aksiyon: block 5 dk

### Password reset
- Ad: `rate-password-reset`
- Hedef:
  - `/forgot-password`
  - `/reset-password`
- Esik: 5 istek / 15 dk / IP
- Aksiyon: managed challenge

### Public form submit
- Ad: `rate-pre-registration-submit`
- Hedef:
  - `/api/pre-registrations`
  - `/api/leads`
- Esik: 5-6 istek / 15 dk / IP
- Aksiyon: managed challenge

### Public upload
- Ad: `rate-pre-registration-upload`
- Hedef: `/api/pre-registration-assets`
- Esik: 8 istek / 10 dk / IP
- Aksiyon: managed challenge

### Admin mutasyon
- Ad: `rate-admin-mutations`
- Hedef:
  - `/api/admin/*`
  - `/admin/*`
- Esik: org guvenlik politikasina gore
- Aksiyon: block / challenge

## Opsiyonel Sertlestirme
- Admin panel icin IP allowlist
- Ulke bazli kisit
- Public submit icin Bot Fight Mode / managed challenge
