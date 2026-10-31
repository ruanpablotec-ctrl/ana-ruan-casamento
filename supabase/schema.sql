-- Run this script in Supabase SQL Editor. Create the first wedding row in the admin panel.
create extension if not exists pgcrypto;
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
create table if not exists public.weddings (id uuid primary key default gen_random_uuid(), couple_names text not null default 'Ana & Ruan', wedding_date timestamptz not null default '2027-07-10 18:00:00-03', ceremony_name text, ceremony_address text, ceremony_time text, reception_name text, reception_address text, reception_time text, story_title text, story_text text, story_image_url text, hero_image_url text, pix_key text, pix_beneficiary text, pix_bank text, pix_qr_url text, accent_color text default '#687457', created_at timestamptz not null default now());
create table if not exists public.guests (id uuid primary key default gen_random_uuid(), name text not null, phone text, group_name text, group_id uuid, rsvp_status text not null default 'pending' check (rsvp_status in ('pending','confirmed','declined')), confirmed_at timestamptz, notes text, created_at timestamptz not null default now());
alter table public.guests add constraint guests_group_id_fkey foreign key(group_id) references public.guests(id) on delete set null;
create table if not exists public.guest_companions (id uuid primary key default gen_random_uuid(), guest_id uuid not null references public.guests(id) on delete cascade, companion_guest_id uuid not null references public.guests(id) on delete cascade, unique(guest_id,companion_guest_id));
create table if not exists public.gifts (id uuid primary key default gen_random_uuid(), name text not null, description text, image_url text, price numeric(12,2) not null check(price > 0), active boolean not null default true, status text not null default 'available', sort_order integer not null default 0, created_at timestamptz not null default now());
insert into public.gifts(name,description,price,sort_order)
select seed.name,seed.description,seed.price,seed.sort_order from (values
 ('Lua de mel','Uma contribuição para as lembranças da nossa viagem.',300,1),
 ('Jantar romântico','Uma noite especial para brindar nossa nova vida.',150,2),
 ('Hospedagem','Uma ajuda para os dias da lua de mel.',500,3),
 ('Passagem aérea','Uma contribuição para chegarmos ao nosso destino.',800,4),
 ('Café da manhã especial','Um começo de dia gostoso para os recém-casados.',100,5),
 ('Contribuição para nossa casa','Um carinho para construirmos nosso lar.',200,6)
) as seed(name,description,price,sort_order)
where not exists (select 1 from public.gifts existing where existing.name=seed.name);
create table if not exists public.contributions (id uuid primary key default gen_random_uuid(), gift_id uuid references public.gifts(id) on delete set null, gift_name text not null, amount numeric(12,2) not null check(amount > 0), contributor_name text not null, status text not null default 'pending' check(status in ('pending','received')), created_at timestamptz not null default now());
create table if not exists public.event_schedule (id uuid primary key default gen_random_uuid(), title text not null, event_time text, description text, sort_order integer not null default 0);
create table if not exists public.gallery (id uuid primary key default gen_random_uuid(), image_url text not null, caption text, sort_order integer not null default 0, created_at timestamptz not null default now());
create or replace function public.is_admin() returns boolean language sql security definer set search_path=public as $$ select exists(select 1 from public.admins where user_id=auth.uid()) $$;
alter table public.admins enable row level security; alter table public.weddings enable row level security; alter table public.guests enable row level security; alter table public.guest_companions enable row level security; alter table public.gifts enable row level security; alter table public.contributions enable row level security; alter table public.event_schedule enable row level security; alter table public.gallery enable row level security;
create policy "admin reads admins" on public.admins for select to authenticated using (public.is_admin());
-- Wedding details (including configured venue and PIX display fields) are intentionally public.
create policy "public reads wedding" on public.weddings for select to anon, authenticated using (true);
create policy "admin manages wedding" on public.weddings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads gifts" on public.gifts for select to anon, authenticated using (active or public.is_admin());
create policy "admin manages gifts" on public.gifts for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads schedule" on public.event_schedule for select to anon, authenticated using (true);
create policy "admin manages schedule" on public.event_schedule for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads gallery" on public.gallery for select to anon, authenticated using (true);
create policy "admin manages gallery" on public.gallery for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manages guests" on public.guests for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manages companions" on public.guest_companions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin manages contributions" on public.contributions for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- Guests and contributions are never exposed to the anon/authenticated client; server routes use service role only after validation.
