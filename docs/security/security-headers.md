# Guvenlik Header Ciktilari

Uygulama `next.config.ts` uzerinden su header’lari gonderir:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`

## CSP Ozeti
- `default-src 'self'`
- `frame-ancestors 'none'`
- `object-src 'none'`
- `form-action 'self'`
- `font-src` sadece self + Google Fonts
- `connect-src` self + Supabase + Cloudflare dashboard
- `img-src` self + data + blob + https

## Dogrulama
Canli/staging ortaminda asagidaki komutlarla kontrol edilir:

```bash
curl -I https://elitsanatvesporkulubu.com
curl -I https://elitsanatvesporkulubu.com/login
curl -I https://elitsanatvesporkulubu.com/admin
```
