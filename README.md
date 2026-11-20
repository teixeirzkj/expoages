# Horizonte — Programa de Reconhecimento e Valorização Profissional

Plataforma acadêmica da disciplina **Gestão de Comportamento de Pessoas**, aplicada à empresa fictícia
**Horizonte Soluções Integradas Ltda.** Reúne site público, ouvidoria anônima com protocolo, reconhecimentos e
feedbacks, pesquisa de pulso, painel administrativo com plano de ações e um modo de demonstração para a ExpoAgro.

> A empresa e todos os dados de exemplo são fictícios. Nenhum indicador exibido representa resultado real.

---

## Sumário

1. [Instalar e executar](#1-instalar-e-executar)
2. [Variáveis de ambiente](#2-variáveis-de-ambiente)
3. [Criar o banco](#3-criar-o-banco-supabase)
4. [Primeiro administrador](#4-primeiro-administrador)
5. [Acessar o painel](#5-acessar-o-painel)
6. [Modo demonstração](#6-modo-demonstração)
7. [Apresentação no iPad](#7-apresentação-no-ipad)
8. [Trocar logotipo e cores](#8-trocar-logotipo-e-cores)
9. [Editar conteúdos acadêmicos](#9-editar-conteúdos-acadêmicos)
10. [Deploy na Vercel com Supabase](#10-deploy-na-vercel-com-supabase)
11. [Arquitetura](#arquitetura) · [Segurança e privacidade](#segurança-e-privacidade) · [Solução de problemas](#solução-de-problemas)

---

## 1. Instalar e executar

Requisitos: **Node.js 20.9+** (testado com Node 24) e npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

Outros comandos:

```bash
npm run build        # build de produção (inclui checagem de tipos)
npm start            # servir o build de produção
npm run lint         # ESLint
```

Sem variáveis de ambiente, o projeto já funciona **inteiro em modo demonstração** (dados fictícios em memória).

## 2. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variável | Onde encontrar | Observação |
|---|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API | URL do projeto |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys | Chave publicável (`sb_publishable_…`). A chave `anon` legada também funciona (ou use `SUPABASE_ANON_KEY`). |

- As variáveis são lidas **somente no servidor** — nenhuma chave vai para o navegador.
- **Não** configure a `service_role` key: a aplicação não precisa dela; a segurança vem das políticas RLS.

## 3. Criar o banco (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra **SQL Editor**, cole o conteúdo de [`supabase/migrations/20261120000000_init.sql`](supabase/migrations/20261120000000_init.sql) e execute.
   (Ou, com a Supabase CLI: `supabase link` e `supabase db push`.)
3. Em **Authentication → Providers → Email**, mantenha o login por e-mail e **desative “Allow new users to sign up”**
   (Authentication → Sign In / Providers). Assim ninguém cria conta pela API.

A migration cria as tabelas `ouvidoria_submissions`, `feedback_submissions`, `pulse_responses`, `action_plans`,
`admin_profiles`, `admin_notes`, `admin_responses` e `submission_events`, além das políticas RLS e da função
`track_submission` (consulta por protocolo).

## 4. Primeiro administrador

Não existe cadastro público de administradores nem usuário/senha no código.

1. Supabase → **Authentication → Users → Add user → Create new user**. Informe e-mail e uma senha forte e marque
   “Auto Confirm User”.
2. Copie o **User UID** criado.
3. No **SQL Editor**, autorize a conta:

```sql
insert into public.admin_profiles (user_id, display_name)
values ('COLE-O-USER-UID-AQUI', 'Nome de exibição');
```

Para remover um acesso: `delete from public.admin_profiles where user_id = '…';`
Uma conta que existe no Auth mas não está em `admin_profiles` não acessa nada.

## 5. Acessar o painel

- **Painel real:** `/admin` → login com a conta do passo 4.
  Abas: Visão geral, Ouvidoria, Feedbacks, Pulso organizacional, Plano de ações, Relatórios e Configurações.
- **Painel demonstrativo:** `/demo` — sem login, apenas com dados fictícios.
- O link “Área administrativa” no rodapé é só um atalho, não uma proteção: a proteção é o login + RLS.

## 6. Modo demonstração

| Situação | Para onde vão os envios do site |
|---|---|
| Supabase **não** configurado | Sempre para o ambiente demonstrativo |
| Supabase configurado e aparelho em **modo demonstração** | Ambiente demonstrativo |
| Supabase configurado, modo demonstração desligado | Banco real (aparecem em `/admin`) |

- O ambiente demonstrativo vive na **memória do servidor**: é compartilhado entre os aparelhos ligados ao mesmo
  servidor e é reiniciado ao reiniciar o servidor ou pelo botão **Reiniciar demonstração**.
- Ative/desative por aparelho em `/apresentacao` ou em `/demo/configuracoes`.
- Um selo verde no site indica quando o aparelho está em modo demonstração.
- O painel `/demo` se atualiza sozinho a cada ~12 s, então um envio feito no iPad aparece no notebook sem recarregar.

## 7. Apresentação no iPad

Abra **`/apresentacao`**: roteiro de 10 passos, atalhos grandes e controles do aparelho.

**Opção A — notebook como servidor (mais confiável para a feira, funciona sem Supabase):**

```bash
npm run build
npm start -- -H 0.0.0.0 -p 3000
```

1. Conecte notebook e iPad à **mesma rede Wi-Fi** (o roteador do celular serve).
2. Descubra o IP do notebook (`ipconfig` no Windows) e abra `http://IP-DO-NOTEBOOK:3000` no Safari do iPad.
3. Libere a porta 3000 no firewall do Windows se o iPad não conseguir abrir.
4. No notebook, abra `http://localhost:3000/demo`.

**Opção B — publicado na Vercel com Supabase:** iPad e notebook acessam a URL pública. Desligue o modo
demonstração para gravar no banco real e use `/admin` no notebook — o envio aparece no painel sem intervenção.

> ⚠️ Na Vercel (serverless), o ambiente demonstrativo em memória **não é garantido entre aparelhos**: cada instância tem
> sua própria memória. Para demonstrar entre iPad e notebook na Vercel, use o Supabase configurado (Opção B) ou o
> notebook como servidor (Opção A).

Dicas: adicione o site à Tela de Início do iPad (Compartilhar → Adicionar à Tela de Início); ative o **modo
apresentação** para esconder elementos secundários e exibir a barra de atalhos; reinicie a demonstração entre
grupos de visitantes; peça que ninguém escreva dados reais.

## 8. Trocar logotipo e cores

- **Cores, raios, espaçamentos:** todos os tokens estão no topo de [`src/app/globals.css`](src/app/globals.css)
  (seção “Paleta da marca”). Troque os valores `--brand-*` — os componentes usam somente esses tokens.
- **Cores dos gráficos:** tokens `--chart-1…4` no mesmo arquivo. Foram validados para daltonismo e contraste; se
  trocar, mantenha cores com luminosidade média e boa separação entre si.
- **Tipografia:** [`src/config/fonts.ts`](src/config/fonts.ts) (Fraunces para títulos, Manrope para textos).
- **Logotipo:** coloque o arquivo em `public/` (ex.: `public/logo.svg`) e defina `logoSrc: "/logo.svg"` em
  [`src/config/site.ts`](src/config/site.ts). Vazio = marca provisória em SVG.

## 9. Editar conteúdos acadêmicos

- **Instituição, integrantes, orientador, evento, ano, logo da instituição:** campo `academic` em
  [`src/config/site.ts`](src/config/site.ts). Campos vazios aparecem como “A definir”.
- **Empresa fictícia:** campo `company` no mesmo arquivo.
- **Textos das seções:** cada seção está em [`src/components/sections/`](src/components/sections/)
  (`hero.tsx`, `problem.tsx`, `program.tsx`, `faq.tsx`, …).
- **Categorias, perguntas do pulso e limites de texto:** [`src/lib/domain.ts`](src/lib/domain.ts) (se mudar
  categorias, atualize também os `check` da migration SQL).
- **Dados fictícios da demonstração:** [`src/lib/demo/seed.ts`](src/lib/demo/seed.ts).
- **Mínimo de respostas para exibir indicadores do pulso:** `minAggregateSample` em `site.ts` (padrão 5).

## 10. Deploy na Vercel com Supabase

1. Faça o passo 3 (banco) e o passo 4 (administrador).
2. Na Vercel: **Add New → Project**, importe este repositório (framework detectado: Next.js).
3. Em **Settings → Environment Variables**, adicione `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`
   (Production e Preview).
4. **Redeploy** depois de adicionar as variáveis: as páginas estáticas são geradas no build e precisam enxergá-las.
5. Teste: envie uma manifestação no site → entre em `/admin` → ela aparece em Ouvidoria.

Sem as variáveis, o deploy funciona normalmente em modo demonstração (com a ressalva serverless da seção 7).

---

## Arquitetura

- **Next.js 16 (App Router, Cache Components) + React 19 + TypeScript**, Tailwind CSS v4, shadcn/ui (Base UI).
- **Animação:** Lenis (scroll suave só em desktop com mouse) + GSAP ScrollTrigger (storytelling por rolagem) +
  Motion (microinterações). Tudo respeita `prefers-reduced-motion`; sem JavaScript o conteúdo continua visível.
- **Gráficos:** Recharts, com tabela alternativa em cada gráfico.
- **Dados:** contrato único `Repository` com duas implementações — Supabase (live) e memória fictícia (demo).
  As telas do painel são as mesmas para `/admin` e `/demo`, recebendo o modo como parâmetro.
- **Validação:** Zod no cliente e no servidor (Server Actions).

```
src/
  app/                 rotas (site, /admin, /demo, /apresentacao, /design-lab, /api/export) e Server Actions
  components/
    sections/          seções do site público
    forms/             ouvidoria, feedback, pulso, consulta por protocolo, painel de participação
    motion/            AnimatedHeading, Reveal, Magnetic, ScrollProgress, LineGrow, Counter, SmoothScroll
    admin/             shell, sidebar, tabelas, Kanban, controles e telas (screens/)
    charts/            gráficos Recharts
    layout/ brand/ design-lab/ ui/
  config/              site.ts (conteúdo e identidade), fonts.ts
  lib/                 domínio, validação, análises, formatação, CSV
    server/            Supabase, autenticação, repositórios, protocolo, rate limit
    demo/              dados fictícios
supabase/migrations/   schema, RLS e funções
```

`/design-lab` mostra os três conceitos visuais de abertura (A — editorial humanizado, em uso; B — institucional
contemporâneo; C — experiência narrativa) e só existe em desenvolvimento.

## Segurança e privacidade

- Formulários **não pedem** nome, e-mail, telefone, CPF ou cadastro. A aplicação **não grava** IP nem fingerprint.
- O papel anônimo do banco só pode **inserir**, e apenas colunas permitidas (status e datas são sempre do banco).
  Leitura e gestão exigem usuário autenticado presente em `admin_profiles` (RLS + função `is_admin()`).
- **Protocolo** `HZ-XXXX-XXXX-XXXX-XXXX` (~80 bits aleatórios): a primeira metade é a referência exibida à gestão;
  a segunda é secreta e só o hash SHA-256 é armazenado. A consulta pública retorna apenas status e respostas
  autorizadas — nunca o texto da manifestação nem observações internas.
- Pulso: guarda só a data (sem horário); indicadores e pontos da série temporal só aparecem com ≥ 5 respostas; o CSV
  do pulso é apenas agregado.
- Anti-abuso: honeypot, tempo mínimo de preenchimento e limite de envios em memória (chave = HMAC do endereço de rede
  com sal rotativo, nunca persistida). Na Vercel cada instância tem seu contador — para produção real, considere
  Cloudflare Turnstile ou um rate limit compartilhado (ex.: Upstash).
- CSV protegido contra injeção de fórmulas; textos sempre renderizados como texto (sem HTML).
- Cabeçalhos de segurança (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`).
- **Limitação:** Vercel e Supabase podem manter logs técnicos próprios (IP, horário) fora do controle da aplicação.
  Por isso o site não promete anonimato absoluto (ver `/privacidade`).

## Solução de problemas

- **Mudanças de CSS não aparecem no `npm run dev`:** pare o servidor, apague a pasta `.next` e rode de novo
  (o cache em disco do Turbopack às vezes fica desatualizado, especialmente em pastas sincronizadas pelo OneDrive).
- **Projeto lento ou travando dentro do OneDrive:** exclua `node_modules` e `.next` da sincronização, ou mova o
  projeto para uma pasta fora do OneDrive.
- **Login diz “sem permissão”:** a conta existe no Auth mas falta a linha em `admin_profiles` (passo 4).
- **Envio falha com Supabase configurado:** confirme que a migration foi executada inteira e que a chave é a
  publicável/anon (não a service_role).
