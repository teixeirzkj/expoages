-- =============================================================================
-- Horizonte — instalação completa do banco (cole tudo no SQL Editor do Supabase)
-- Equivale às 3 migrations de supabase/migrations, na ordem. Rode UMA vez.
-- =============================================================================

-- >>> supabase/migrations/20261120000000_init.sql
-- =============================================================================
-- Projeto Horizonte — schema inicial
-- Princípios:
--   * Envios públicos são anônimos: nenhuma coluna de IP, e-mail ou nome.
--   * O papel `anon` só pode INSERIR, e apenas colunas permitidas.
--   * Leitura e gestão exigem usuário autenticado presente em admin_profiles.
--   * O hash do segredo do protocolo nunca é legível por ninguém via API.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- Administradores
-- -----------------------------------------------------------------------------
create table public.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Administrador' check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_profiles where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Ouvidoria
-- -----------------------------------------------------------------------------
create table public.ouvidoria_submissions (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^HZ-[0-9A-Z]{4}-[0-9A-Z]{4}$'),
  access_hash text not null check (access_hash ~ '^[0-9a-f]{64}$'),
  category text not null check (category in ('sugestao', 'reclamacao', 'dificuldade', 'condicoes', 'outro')),
  topic text not null check (char_length(topic) between 3 and 80),
  description text not null check (char_length(description) between 15 and 2000),
  impact smallint check (impact between 1 and 5),
  status text not null default 'recebido' check (status in ('recebido', 'em_analise', 'acao_planejada', 'concluido')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ouvidoria_created_idx on public.ouvidoria_submissions (created_at desc);
create index ouvidoria_status_idx on public.ouvidoria_submissions (status);
create trigger ouvidoria_touch before update on public.ouvidoria_submissions
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- Reconhecimentos e feedbacks
-- -----------------------------------------------------------------------------
create table public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^HZ-[0-9A-Z]{4}-[0-9A-Z]{4}$'),
  access_hash text not null check (access_hash ~ '^[0-9a-f]{64}$'),
  kind text not null check (kind in ('reconhecimento', 'construtivo', 'outro')),
  topic text not null check (char_length(topic) between 3 and 80),
  area text check (char_length(area) <= 60),
  message text not null check (char_length(message) between 15 and 2000),
  rating smallint check (rating between 1 and 5),
  status text not null default 'recebido' check (status in ('recebido', 'em_analise', 'acao_planejada', 'concluido')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index feedback_created_idx on public.feedback_submissions (created_at desc);
create trigger feedback_touch before update on public.feedback_submissions
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- Pulso organizacional (sem horário: apenas a data, para reduzir reidentificação)
-- -----------------------------------------------------------------------------
create table public.pulse_responses (
  id uuid primary key default gen_random_uuid(),
  created_on date not null default current_date,
  valorizacao smallint not null check (valorizacao between 1 and 5),
  escuta smallint not null check (escuta between 1 and 5),
  bem_estar smallint not null check (bem_estar between 1 and 5),
  feedback smallint not null check (feedback between 1 and 5)
);
create index pulse_created_idx on public.pulse_responses (created_on);

-- -----------------------------------------------------------------------------
-- Gestão: observações internas, respostas e histórico de status
-- (cada linha pertence a exatamente uma manifestação ou um feedback)
-- -----------------------------------------------------------------------------
create table public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  ouvidoria_id uuid references public.ouvidoria_submissions (id) on delete cascade,
  feedback_id uuid references public.feedback_submissions (id) on delete cascade,
  body text not null check (char_length(body) between 2 and 1500),
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (num_nonnulls(ouvidoria_id, feedback_id) = 1)
);

create table public.admin_responses (
  id uuid primary key default gen_random_uuid(),
  ouvidoria_id uuid references public.ouvidoria_submissions (id) on delete cascade,
  feedback_id uuid references public.feedback_submissions (id) on delete cascade,
  body text not null check (char_length(body) between 5 and 1500),
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (num_nonnulls(ouvidoria_id, feedback_id) = 1)
);

create table public.submission_events (
  id uuid primary key default gen_random_uuid(),
  ouvidoria_id uuid references public.ouvidoria_submissions (id) on delete cascade,
  feedback_id uuid references public.feedback_submissions (id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_id uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (num_nonnulls(ouvidoria_id, feedback_id) = 1)
);
create index notes_ouv_idx on public.admin_notes (ouvidoria_id);
create index notes_fb_idx on public.admin_notes (feedback_id);
create index responses_ouv_idx on public.admin_responses (ouvidoria_id);
create index responses_fb_idx on public.admin_responses (feedback_id);
create index events_ouv_idx on public.submission_events (ouvidoria_id);
create index events_fb_idx on public.submission_events (feedback_id);

-- Registra automaticamente cada mudança de status.
create or replace function public.log_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    if tg_table_name = 'ouvidoria_submissions' then
      insert into public.submission_events (ouvidoria_id, from_status, to_status) values (new.id, old.status, new.status);
    else
      insert into public.submission_events (feedback_id, from_status, to_status) values (new.id, old.status, new.status);
    end if;
  end if;
  return new;
end;
$$;
create trigger ouvidoria_status_log after update of status on public.ouvidoria_submissions
  for each row execute function public.log_status_change();
create trigger feedback_status_log after update of status on public.feedback_submissions
  for each row execute function public.log_status_change();

-- -----------------------------------------------------------------------------
-- Plano de ações
-- -----------------------------------------------------------------------------
create table public.action_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '' check (char_length(description) <= 1500),
  category text not null check (category in ('reconhecimento', 'comunicacao', 'bem_estar', 'processos', 'desenvolvimento', 'condicoes')),
  priority text not null default 'media' check (priority in ('baixa', 'media', 'alta')),
  owner text not null check (char_length(owner) between 2 and 80),
  status text not null default 'planejada' check (status in ('planejada', 'em_andamento', 'concluida')),
  due_date date,
  linked_reference text check (linked_reference ~ '^HZ-[0-9A-Z]{4}-[0-9A-Z]{4}$'),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger action_plans_touch before update on public.action_plans
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- Privilégios (substituem os padrões amplos do schema public)
-- =============================================================================
revoke all on public.admin_profiles, public.ouvidoria_submissions, public.feedback_submissions,
  public.pulse_responses, public.admin_notes, public.admin_responses, public.submission_events,
  public.action_plans from anon, authenticated;

-- Envio público: somente INSERT e somente colunas permitidas
-- (status, datas e id ficam com os valores padrão do banco).
grant insert (reference, access_hash, category, topic, description, impact)
  on public.ouvidoria_submissions to anon;
grant insert (reference, access_hash, kind, topic, area, message, rating)
  on public.feedback_submissions to anon;
grant insert (valorizacao, escuta, bem_estar, feedback)
  on public.pulse_responses to anon;

-- Administração: leitura sem a coluna access_hash; atualização apenas do status.
grant select (id, reference, category, topic, description, impact, status, created_at, updated_at)
  on public.ouvidoria_submissions to authenticated;
grant update (status) on public.ouvidoria_submissions to authenticated;
grant select (id, reference, kind, topic, area, message, rating, status, created_at, updated_at)
  on public.feedback_submissions to authenticated;
grant update (status) on public.feedback_submissions to authenticated;
grant select on public.pulse_responses to authenticated;
grant select, insert on public.admin_notes, public.admin_responses to authenticated;
grant select on public.submission_events to authenticated;
grant select, insert, update, delete on public.action_plans to authenticated;
grant select on public.admin_profiles to authenticated;

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.admin_profiles enable row level security;
alter table public.ouvidoria_submissions enable row level security;
alter table public.feedback_submissions enable row level security;
alter table public.pulse_responses enable row level security;
alter table public.admin_notes enable row level security;
alter table public.admin_responses enable row level security;
alter table public.submission_events enable row level security;
alter table public.action_plans enable row level security;

create policy "anon envia manifestacao" on public.ouvidoria_submissions
  for insert to anon with check (status = 'recebido');
create policy "anon envia feedback" on public.feedback_submissions
  for insert to anon with check (status = 'recebido');
create policy "anon envia pulso" on public.pulse_responses
  for insert to anon with check (true);

create policy "admin le manifestacoes" on public.ouvidoria_submissions
  for select to authenticated using ((select public.is_admin()));
create policy "admin atualiza manifestacoes" on public.ouvidoria_submissions
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin le feedbacks" on public.feedback_submissions
  for select to authenticated using ((select public.is_admin()));
create policy "admin atualiza feedbacks" on public.feedback_submissions
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin le pulso" on public.pulse_responses
  for select to authenticated using ((select public.is_admin()));

create policy "admin le notas" on public.admin_notes
  for select to authenticated using ((select public.is_admin()));
create policy "admin cria notas" on public.admin_notes
  for insert to authenticated with check ((select public.is_admin()) and author_id = (select auth.uid()));
create policy "admin le respostas" on public.admin_responses
  for select to authenticated using ((select public.is_admin()));
create policy "admin cria respostas" on public.admin_responses
  for insert to authenticated with check ((select public.is_admin()) and author_id = (select auth.uid()));
create policy "admin le eventos" on public.submission_events
  for select to authenticated using ((select public.is_admin()));

create policy "admin gerencia acoes" on public.action_plans
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin le administradores" on public.admin_profiles
  for select to authenticated using ((select public.is_admin()));
-- Não há política de INSERT/UPDATE em admin_profiles: administradores são
-- cadastrados apenas pelo SQL Editor do Supabase (ver README).

-- =============================================================================
-- Consulta pública por protocolo
-- Recebe a referência e o hash do segredo; devolve apenas status e respostas
-- autorizadas. Nunca devolve o conteúdo da manifestação nem observações internas.
-- =============================================================================
create or replace function public.track_submission(p_reference text, p_hash text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_kind text;
  v_id uuid;
  v_label text;
  v_status text;
  v_created timestamptz;
  v_updated timestamptz;
begin
  if p_reference !~ '^HZ-[0-9A-Z]{4}-[0-9A-Z]{4}$' or p_hash !~ '^[0-9a-f]{64}$' then
    return null;
  end if;

  select 'ouvidoria', id, category, status, created_at, updated_at
    into v_kind, v_id, v_label, v_status, v_created, v_updated
    from public.ouvidoria_submissions
   where reference = p_reference and access_hash = p_hash;

  if v_id is null then
    select 'feedback', id, kind, status, created_at, updated_at
      into v_kind, v_id, v_label, v_status, v_created, v_updated
      from public.feedback_submissions
     where reference = p_reference and access_hash = p_hash;
  end if;

  if v_id is null then
    return null;
  end if;

  return jsonb_build_object(
    'reference', p_reference,
    'kind', v_kind,
    'label', v_label,
    'status', v_status,
    'created_at', v_created,
    'updated_at', v_updated,
    'responses', coalesce((
      select jsonb_agg(jsonb_build_object('body', r.body, 'created_at', r.created_at) order by r.created_at)
        from public.admin_responses r
       where (v_kind = 'ouvidoria' and r.ouvidoria_id = v_id)
          or (v_kind = 'feedback' and r.feedback_id = v_id)
    ), '[]'::jsonb)
  );
end;
$$;
revoke all on function public.track_submission(text, text) from public;
grant execute on function public.track_submission(text, text) to anon, authenticated;

-- >>> supabase/migrations/20261121000000_course_enrollments.sql
-- =============================================================================
-- Projeto Horizonte — inscrições em cursos profissionalizantes
-- Migration ADITIVA: cria apenas uma tabela nova; não altera dados existentes.
--
-- Diferente da ouvidoria, a inscrição é IDENTIFICADA (nome e e-mail para
-- contato). Os dados ficam numa tabela própria, sem relação com os canais
-- anônimos, e só administradores podem lê-los.
-- =============================================================================

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 3 and 80),
  email text not null check (char_length(email) between 5 and 120 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  course text not null check (course in ('rotinas_administrativas', 'informatica_basica', 'ingles_basico', 'oratoria')),
  shift text not null check (shift in ('manha', 'tarde', 'noite', 'flexivel')),
  area text check (area is null or char_length(area) <= 60),
  consent boolean not null check (consent),
  status text not null default 'recebida' check (status in ('recebida', 'contatado', 'confirmada', 'cancelada')),
  created_at timestamptz not null default now()
);

create index if not exists course_enrollments_created_idx on public.course_enrollments (created_at desc);

revoke all on public.course_enrollments from anon, authenticated;

-- Envio público: somente INSERT, somente estas colunas.
grant insert (full_name, email, course, shift, area, consent) on public.course_enrollments to anon;
-- Gestão: leitura, mudança de status e exclusão (atendimento a pedidos de remoção).
grant select, delete on public.course_enrollments to authenticated;
grant update (status) on public.course_enrollments to authenticated;

alter table public.course_enrollments enable row level security;

create policy "anon envia inscricao" on public.course_enrollments
  for insert to anon with check (status = 'recebida' and consent);
create policy "admin le inscricoes" on public.course_enrollments
  for select to authenticated using ((select public.is_admin()));
create policy "admin atualiza inscricoes" on public.course_enrollments
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin remove inscricoes" on public.course_enrollments
  for delete to authenticated using ((select public.is_admin()));

-- >>> supabase/migrations/20261122000000_professional_reviews.sql
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
