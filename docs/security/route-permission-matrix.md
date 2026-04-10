# Route Yetki Matrisi

## Public
- `/`
- `/api/leads`
- `/api/pre-registration-settings`
- `/api/pre-registrations`
- `/api/pre-registration-assets`

## Auth
- `/login`
- `/forgot-password`
- `/reset-password`
- `/invite`

## Admin
- `/admin/*`
  - `security_role`: `admin` veya `super_admin`
  - `app_role`: `admin`

## Manager
- `/manager/*`
  - `security_role`: `manager`, `admin`, `super_admin`
  - `app_role`: `manager`
  - admin override aktif

## Coach
- `/coach/*`
  - `security_role`: `staff`, `admin`, `super_admin`
  - `app_role`: `coach`
  - admin override aktif

## Parent
- `/parent/*`
  - `security_role`: `user`, `admin`, `super_admin`
  - `app_role`: `parent`
  - admin override aktif

## Hassas API Uclari
- `/api/admin/landing-assets`
  - yalnizca `admin`
- server actions:
  - admin mutasyonlari -> `admin`
  - manager operasyon mutasyonlari -> `manager+`
  - coach yoklama/detay -> `staff+`

## IDOR Kurali
- UUID tek basina yetmez
- her varlik icin:
  - organization baglami
  - rol kapsami
  - sahiplik / baglilik
  birlikte dogrulanir
