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
