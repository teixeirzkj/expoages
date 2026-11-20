-- =============================================================================
-- Projeto Horizonte — avaliações profissionais ("Meu Feedback")
-- Migration ADITIVA: cria tabelas novas. Não altera nem converte os registros
-- do antigo feedback anônimo (feedback_submissions), que continuam preservados.
--
-- Papéis:
--   administrador → admin_profiles (já existente)
--   colaborador   → employee_profiles (nova)
-- Tudo é identificado e privado, e não tem nenhuma relação com a ouvidoria
-- anônima nem com as inscrições em cursos.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Perfis de colaboradores (1:1 com auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.employee_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 3 and 80),
  email text not null check (char_length(email) between 5 and 120),
  area text check (area is null or char_length(area) <= 60),
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Avaliações mensais preparadas pela gestão
-- -----------------------------------------------------------------------------
create table if not exists public.performance_reviews (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employee_profiles (user_id) on delete cascade,
  period_month smallint not null check (period_month between 1 and 12),
  period_year smallint not null check (period_year between 2020 and 2100),
  strengths text not null check (char_length(strengths) <= 2000),
  improvements text not null check (char_length(improvements) <= 2000),
  recommendations text not null default '' check (char_length(recommendations) <= 2000),
  goals text[] not null default '{}' check (cardinality(goals) <= 3),
  suggested_course text check (
    suggested_course is null
    or suggested_course in ('rotinas_administrativas', 'informatica_basica', 'ingles_basico', 'oratoria')
  ),
  manager_message text check (manager_message is null or char_length(manager_message) <= 1500),
  reviewer_name text check (reviewer_name is null or char_length(reviewer_name) <= 80),
  status text not null default 'rascunho' check (status in ('rascunho', 'publicado')),
  published_at timestamptz,
  viewed_at timestamptz,        -- primeira abertura pelo colaborador
  acknowledged_at timestamptz,  -- "Marcar como lido" (ciência, não concordância)
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, period_year, period_month)
);
create index if not exists performance_reviews_employee_idx on public.performance_reviews (employee_id, period_year desc, period_month desc);

drop trigger if exists performance_reviews_touch on public.performance_reviews;
create trigger performance_reviews_touch before update on public.performance_reviews
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- Histórico de correções de avaliações já publicadas
-- -----------------------------------------------------------------------------
create table if not exists public.review_revisions (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.performance_reviews (id) on delete cascade,
  note text not null check (char_length(note) between 3 and 300),
  snapshot jsonb not null,      -- conteúdo ANTES da correção
  changed_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Notificações internas (preparado para e-mail no futuro: coluna email_sent_at)
-- -----------------------------------------------------------------------------
create table if not exists public.employee_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.employee_profiles (user_id) on delete cascade,
  title text not null check (char_length(title) <= 120),
  body text not null check (char_length(body) <= 300),
  review_id uuid references public.performance_reviews (id) on delete set null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  email_sent_at timestamptz     -- preenchida somente por uma integração real de e-mail
);
create index if not exists employee_notifications_user_idx on public.employee_notifications (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Privilégios: nada para anon; authenticated depende das políticas abaixo.
-- -----------------------------------------------------------------------------
revoke all on public.employee_profiles, public.performance_reviews, public.review_revisions,
  public.employee_notifications from anon, authenticated;

grant select on public.employee_profiles to authenticated;
grant update (full_name, area) on public.employee_profiles to authenticated;
grant delete on public.employee_profiles to authenticated;
grant select, insert, update, delete on public.performance_reviews to authenticated;
grant select, insert on public.review_revisions to authenticated;
grant select, insert on public.employee_notifications to authenticated;

alter table public.employee_profiles enable row level security;
alter table public.performance_reviews enable row level security;
alter table public.review_revisions enable row level security;
alter table public.employee_notifications enable row level security;

-- Colaborador: lê somente o próprio perfil.
create policy "colaborador le o proprio perfil" on public.employee_profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy "admin le perfis" on public.employee_profiles
  for select to authenticated using ((select public.is_admin()));
create policy "admin atualiza perfis" on public.employee_profiles
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin remove perfis" on public.employee_profiles
  for delete to authenticated using ((select public.is_admin()));

-- Colaborador: lê somente as PRÓPRIAS avaliações PUBLICADAS. Rascunhos nunca.
create policy "colaborador le avaliacoes publicadas" on public.performance_reviews
  for select to authenticated using (employee_id = (select auth.uid()) and status = 'publicado');
create policy "admin gerencia avaliacoes" on public.performance_reviews
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin le revisoes" on public.review_revisions
  for select to authenticated using ((select public.is_admin()));
create policy "admin registra revisoes" on public.review_revisions
  for insert to authenticated with check ((select public.is_admin()));

create policy "colaborador le as proprias notificacoes" on public.employee_notifications
  for select to authenticated using (user_id = (select auth.uid()));
create policy "admin le notificacoes" on public.employee_notifications
  for select to authenticated using ((select public.is_admin()));
create policy "admin cria notificacoes" on public.employee_notifications
  for insert to authenticated with check ((select public.is_admin()));

-- -----------------------------------------------------------------------------
-- Funções: ações do colaborador sobre os próprios registros (sem UPDATE direto)
-- -----------------------------------------------------------------------------
create or replace function public.mark_review_viewed(p_review uuid)
returns void language sql security definer set search_path = '' as $$
  update public.performance_reviews
     set viewed_at = coalesce(viewed_at, now())
   where id = p_review and employee_id = (select auth.uid()) and status = 'publicado';
$$;

create or replace function public.acknowledge_review(p_review uuid)
returns void language sql security definer set search_path = '' as $$
  update public.performance_reviews
     set acknowledged_at = coalesce(acknowledged_at, now()),
         viewed_at = coalesce(viewed_at, now())
   where id = p_review and employee_id = (select auth.uid()) and status = 'publicado';
$$;

create or replace function public.mark_notification_read(p_notification uuid)
returns void language sql security definer set search_path = '' as $$
  update public.employee_notifications
     set read_at = coalesce(read_at, now())
   where id = p_notification and user_id = (select auth.uid());
$$;

-- Administrador: vincula uma conta já criada no Supabase Auth a um perfil de colaborador.
create or replace function public.register_employee(p_email text, p_full_name text, p_area text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  select id into v_id from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if v_id is null then
    raise exception 'user_not_found' using errcode = 'P0002';
  end if;
  insert into public.employee_profiles (user_id, full_name, email, area)
  values (v_id, trim(p_full_name), lower(trim(p_email)), nullif(trim(coalesce(p_area, '')), ''))
  on conflict (user_id) do update set full_name = excluded.full_name, area = excluded.area;
  return v_id;
end;
$$;

revoke all on function public.mark_review_viewed(uuid), public.acknowledge_review(uuid),
  public.mark_notification_read(uuid), public.register_employee(text, text, text) from public;
grant execute on function public.mark_review_viewed(uuid), public.acknowledge_review(uuid),
  public.mark_notification_read(uuid), public.register_employee(text, text, text) to authenticated;
