# RLS Policy Listesi

## Cekirdek Tablolar
- `profiles`
  - self read
  - admin/manager manage
- `user_roles`
  - self/admin read
  - admin manage
- `students`
  - admin/manager full
  - parent own student read
- `programs`
  - admin/manager full
  - coach own program read
  - parent bagli program read
- `sessions`
  - admin/manager full
  - coach own session manage
  - parent bagli session read
- `attendance_records`
  - admin/manager full
  - coach own student manage
  - parent own student read
- `charges`, `payments`, `support_threads`, `support_messages`
  - organization + role scope ile daraltilmis

## On Kayit Ailesi
- `pre_registration_settings`
  - admin write
  - manager read
- `pre_registrations`
  - admin/manager read-write
- `pre_registration_assets`
  - admin/manager read-write
- `pre_registration_notes`
  - admin/manager read-write
- `pre_registration_status_logs`
  - admin/manager read-write

## Program Workspace Tablolari
- `program_types`
  - admin write
  - manager read
- `categories`
  - admin write
  - manager read
- `sports_branches`
  - admin write
  - manager read
- `areas`
  - admin write
  - manager read
- `session_series`
  - admin/manager write
  - coach own series read
  - parent bagli program read
- `student_package_cycles`
  - admin/manager write
  - coach own student read
  - parent own student read
- `enrollment_session_allocations`
  - admin/manager write
  - coach own student read
  - parent own student read

## Detay ve Karne
- `student_detail_profiles`
  - admin/manager write
  - coach own student write
  - parent own student read
- `report_cards`
  - admin/manager write
  - coach own student write
  - parent own student read

## Not
- `current_role()` uygulama rolu icin kullanilmaya devam eder.
- `current_security_role()` ek enterprise rol katmanidir.
- Uretim oncesi SQL migration:
  - `/Users/spor/Local Sites/elitkids/supabase/migrations/0015_enterprise_security_hardening.sql`
