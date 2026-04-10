alter table public.pre_registrations
add column if not exists submitted_ip text,
add column if not exists forwarded_ip text,
add column if not exists user_agent text,
add column if not exists device_summary text,
add column if not exists client_platform text,
add column if not exists client_browser text,
add column if not exists client_device_type text;

alter table public.pre_registration_settings
alter column helper_note set default 'IP adresiniz ve tarayici / cihaz bilgileriniz guvenlik ve basvuru dogrulama amaciyla kaydedilir.';

update public.pre_registration_settings
set helper_note = 'IP adresiniz ve tarayici / cihaz bilgileriniz guvenlik ve basvuru dogrulama amaciyla kaydedilir.',
    updated_at = now()
where helper_note is null
   or helper_note = ''
   or helper_note = 'IP adresiniz ve cihaz bilgileriniz guvenlik amaciyla kaydedilebilir.';
