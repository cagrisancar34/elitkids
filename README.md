# Elit Kids Akademi

Next.js 16, Supabase ve shadcn/ui temelli cok rollu spor okulu platformu.

## Neler Var

- Kurumsal landing page
- `admin`, `manager`, `coach`, `parent` rolleri icin ayri paneller
- Supabase istemci ve middleware omurgasi
- Baslangic migration dosyasi ve RLS taslagi
- shadcn/ui tarzinda tema katmani ve ortak UI bilesenleri
- Vitest ile temel domain testleri

## Calistirma

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

- Login ekranindaki demo rol butonlari cookie tabanli onizleme oturumu acar.
- Supabase bilgileri tanimlandiginda auth ve veri akisi gercek servis baglantisina genisleyebilir.
- Supabase migration taslagi `supabase/migrations/0001_initial_schema.sql` altindadir.
