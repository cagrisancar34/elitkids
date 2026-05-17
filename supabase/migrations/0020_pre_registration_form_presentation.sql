alter table public.pre_registration_settings
add column if not exists form_eyebrow text not null default 'Hemen Kayit',
add column if not exists form_title text not null default 'Cocugunuz icin ilk adimi burada atiyoruz.',
add column if not exists form_description text not null default 'Hemen Kayit Ol butonuna bastiginizda acilan bu modal uzerinden basvurunuzu iletebilirsiniz. Form kesin kayit degildir; once incelenir, sonra uygun programa aktivasyon yapilir.',
add column if not exists form_logo_url text,
add column if not exists form_logo_path text;

update public.pre_registration_settings
set
  form_eyebrow = coalesce(nullif(trim(form_eyebrow), ''), 'Hemen Kayit'),
  form_title = coalesce(nullif(trim(form_title), ''), 'Cocugunuz icin ilk adimi burada atiyoruz.'),
  form_description = coalesce(
    nullif(trim(form_description), ''),
    'Hemen Kayit Ol butonuna bastiginizda acilan bu modal uzerinden basvurunuzu iletebilirsiniz. Form kesin kayit degildir; once incelenir, sonra uygun programa aktivasyon yapilir.'
  );
