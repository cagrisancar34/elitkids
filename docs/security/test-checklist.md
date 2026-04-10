# Security Test Checklist

## Auth ve Route
- [ ] Anonymous kullanici tum panel route’larinda `/login`’e dusuyor
- [ ] Authenticated kullanici login ekranindan kendi home route’una yonleniyor
- [ ] Demo auth production/staging’de kapali

## RBAC
- [ ] `admin` admin ekranlarina girebiliyor
- [ ] `manager` admin ekranlarina giremiyor
- [ ] `coach` yalnizca coach yuzeylerini kullanabiliyor
- [ ] `parent` yalnizca kendi bagli verisini goruyor

## IDOR
- [ ] Baska organization ogrencisi okunamiyor
- [ ] Baska student payment/support kaydina UUID ile erisim olmuyor
- [ ] Baska on kayit kaydina organization disindan erisim olmuyor

## RLS
- [ ] 0015 migration sonrasi yeni tablolar RLS aktif
- [ ] `program_types`, `categories`, `areas` manager tarafinda read-only
- [ ] `student_package_cycles` parent icin sadece kendi ogrencisi kadar gorunuyor

## Storage
- [ ] `pre-registration-assets` public URL ile acilmiyor
- [ ] signed URL sure bitince dosya ulasilamaz oluyor
- [ ] `homepage-assets` public kalmaya devam ediyor

## Rate Limit
- [ ] login rate limit tetikleniyor
- [ ] password reset rate limit tetikleniyor
- [ ] pre-registration submit rate limit tetikleniyor
- [ ] upload rate limit tetikleniyor

## Secret Leak
- [ ] build ciktisinda `SUPABASE_SERVICE_ROLE_KEY` yok
- [ ] client bundle’da server-only env gorunmuyor

## Header
- [ ] CSP donuyor
- [ ] HSTS donuyor
- [ ] X-Frame-Options donuyor
- [ ] nosniff donuyor

## Audit
- [ ] failed login audit’e yaziliyor
- [ ] admin mutasyonlari audit’te
- [ ] pre-registration submit audit’te
