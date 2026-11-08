-- ============================================================
-- ENGLISH NOW — tabela de solicitações de aula
-- Rode este script no SQL Editor do Supabase.
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  phone       text not null,
  level       text,
  level_label text,
  message     text,
  source      text not null default 'site',
  page_url    text,
  user_agent  text
);

comment on table public.leads is 'Solicitações de aula enviadas pelo site ENGLISH NOW.';

-- ------------------------------------------------------------
-- Segurança (RLS)
-- O site usa a chave "anon", então liberamos apenas INSERT.
-- Leitura, alteração e exclusão ficam restritas ao painel do
-- Supabase / service_role.
-- ------------------------------------------------------------
alter table public.leads enable row level security;

drop policy if exists "leads_insert_anon" on public.leads;

create policy "leads_insert_anon"
  on public.leads
  for insert
  to anon
  with check (true);

-- ------------------------------------------------------------
-- Índices para consultas no painel
-- ------------------------------------------------------------
create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

create index if not exists leads_email_idx
  on public.leads (lower(email));
