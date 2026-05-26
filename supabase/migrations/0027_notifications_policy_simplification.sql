drop policy if exists "notifications self access" on public.notifications;

drop policy if exists "notifications operational read" on public.notifications;
create policy "notifications operational read"
on public.notifications
for select
using (profile_id = auth.uid() or public.is_admin_or_manager());
