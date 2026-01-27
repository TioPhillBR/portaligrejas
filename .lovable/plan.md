
# Plano: Transformar em SaaS "Portal Igrejas"

## Visão Geral

Transformar o site atual de igreja em uma plataforma SaaS onde qualquer igreja pode criar seu próprio site em poucos minutos.

**Nome:** Portal Igrejas  
**Slogan:** "Seu site no ar em poucos minutos"

---

## Arquitetura Multi-Tenant

```text
┌─────────────────────────────────────────────────────────────┐
│                    PORTAL IGREJAS (SaaS)                    │
├─────────────────────────────────────────────────────────────┤
│  Landing Page (/)          │  Plataforma Admin (/plataforma)│
│  • Verificar URL           │  • Dashboard SaaS              │
│  • Criar igreja            │  • Gerenciar igrejas           │
│  • Pricing                 │  • Suporte                     │
├─────────────────────────────────────────────────────────────┤
│                    SITES DAS IGREJAS                        │
│  /igreja/:slug             │  Admin: /igreja/:slug/admin    │
│  • Homepage dinâmica       │  • Gestão de conteúdo          │
│  • Blog, eventos           │  • Usuários, ministérios       │
│  • Área do membro          │  • Configurações               │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Novas Tabelas do Banco de Dados

### Tabela `churches` (Igrejas/Tenants)
```sql
CREATE TABLE public.churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  
  -- Plano e status
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  
  -- Configurações
  settings JSONB DEFAULT '{}',
  theme_settings JSONB DEFAULT '{}',
  
  -- Owner
  owner_id UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabela `church_members` (Membros por Igreja)
```sql
CREATE TABLE public.church_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(church_id, user_id)
);
```

### Novos Roles do Enum `app_role`
```sql
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'platform_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'church_owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'church_admin';
```

### Atualizar Tabelas Existentes
Adicionar coluna `church_id` em todas as tabelas de conteúdo:
- `events`
- `ministries`
- `ministry_members`
- `gallery`
- `blog_posts`
- `blog_categories`
- `blog_tags`
- `service_schedules`
- `home_sections`
- `contact_messages`
- `prayer_requests`
- `site_settings`
- `theme_settings`

---

## 2. Novas Páginas

### Landing Page SaaS (`/`)
- Hero com slogan "Seu site no ar em poucos minutos"
- Campo de verificação de disponibilidade de URL
- Seção de recursos/features
- Planos e preços
- Depoimentos
- CTA para criar igreja

### Página de Criação (`/criar-igreja`)
- Formulário de cadastro da igreja
- Escolha do slug/URL
- Dados básicos (nome, logo, contato)
- Criação automática do admin

### Dashboard da Plataforma (`/plataforma`)
- Para `platform_admin` gerenciar todas as igrejas
- Estatísticas globais
- Lista de igrejas cadastradas
- Suporte e tickets

### Site da Igreja (`/igreja/:slug`)
- Exibe o site da igreja baseado no slug
- Usa as mesmas seções dinâmicas
- Isolado por `church_id`

### Admin da Igreja (`/igreja/:slug/admin`)
- Mesmo admin atual, mas filtrado por `church_id`
- Gestão de conteúdo isolada

---

## 3. Estrutura de Arquivos

```text
src/
├── pages/
│   ├── landing/
│   │   ├── LandingPage.tsx      # Nova landing SaaS
│   │   ├── CreateChurch.tsx     # Criar nova igreja
│   │   └── Pricing.tsx          # Planos e preços
│   ├── platform/
│   │   ├── PlatformLayout.tsx   # Layout admin plataforma
│   │   ├── PlatformDashboard.tsx
│   │   ├── PlatformChurches.tsx
│   │   └── PlatformSupport.tsx
│   ├── church/
│   │   ├── ChurchSite.tsx       # Site público da igreja
│   │   ├── ChurchAdmin.tsx      # Admin da igreja
│   │   └── ChurchMember.tsx     # Área do membro
│   └── ...
├── contexts/
│   ├── AuthContext.tsx
│   └── ChurchContext.tsx        # Novo: contexto da igreja atual
├── hooks/
│   └── useChurch.ts             # Novo: hook para dados da igreja
├── components/
│   ├── landing/
│   │   ├── LandingHero.tsx
│   │   ├── UrlChecker.tsx       # Verificador de URL
│   │   ├── Features.tsx
│   │   └── PricingCards.tsx
│   └── platform/
│       └── ...
```

---

## 4. Componentes da Landing Page

### Hero Section
- Gradiente moderno com cores da marca
- Título: "Portal Igrejas"
- Slogan: "Seu site no ar em poucos minutos"
- Campo de input para verificar URL
- Botão "Verificar Disponibilidade"

### URL Checker (Verificador de URL)
```typescript
interface UrlCheckerProps {
  onAvailable: (slug: string) => void;
}

// Verifica se o slug já existe na tabela churches
// Mostra feedback visual: ✓ Disponível ou ✗ Já existe
```

### Features Section
- Gestão de eventos
- Blog integrado
- Ministérios e grupos
- Área do membro
- Comunicação via broadcast
- Personalização de tema

### Pricing Section
- Plano Gratuito (limitações básicas)
- Plano Pro (recursos avançados)
- Plano Igreja+ (ilimitado)

---

## 5. Políticas RLS Multi-Tenant

### Função de Verificação de Igreja
```sql
CREATE OR REPLACE FUNCTION public.is_church_member(_user_id UUID, _church_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.church_members
    WHERE user_id = _user_id AND church_id = _church_id AND is_active = true
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_church_admin(_user_id UUID, _church_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.church_members
    WHERE user_id = _user_id 
      AND church_id = _church_id 
      AND role IN ('owner', 'admin')
      AND is_active = true
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### Exemplo de Policy para Events
```sql
-- Público pode ver eventos ativos da igreja
CREATE POLICY "Public can view church events"
ON public.events FOR SELECT
USING (is_active = true);

-- Admins da igreja podem gerenciar
CREATE POLICY "Church admins can manage events"
ON public.events FOR ALL
USING (is_church_admin(auth.uid(), church_id));
```

---

## 6. Contexto de Igreja (ChurchContext)

```typescript
interface ChurchContextType {
  church: Church | null;
  loading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
}

// Detecta a igreja baseado na URL /igreja/:slug
// Carrega dados da igreja e permissões do usuário
```

---

## 7. Fluxo de Criação de Igreja

```text
1. Usuário acessa Landing Page
2. Digita o slug desejado (ex: "igreja-vida-nova")
3. Sistema verifica disponibilidade em tempo real
4. Se disponível → Redireciona para cadastro
5. Preenche dados: nome, logo, email, telefone
6. Cria conta (se não logado) ou usa conta existente
7. Sistema cria:
   - Registro na tabela `churches`
   - Membro com role `owner` em `church_members`
   - Seções padrão em `home_sections`
   - Configurações padrão em `site_settings`
8. Redireciona para /igreja/slug/admin
```

---

## 8. Rotas Atualizadas

```typescript
// Landing e Plataforma
<Route path="/" element={<LandingPage />} />
<Route path="/criar-igreja" element={<CreateChurch />} />
<Route path="/precos" element={<Pricing />} />
<Route path="/login" element={<Login />} />
<Route path="/cadastro" element={<Register />} />

// Plataforma Admin (super admins)
<Route path="/plataforma" element={<PlatformLayout />}>
  <Route index element={<PlatformDashboard />} />
  <Route path="igrejas" element={<PlatformChurches />} />
  <Route path="suporte" element={<PlatformSupport />} />
</Route>

// Sites das Igrejas
<Route path="/igreja/:slug" element={<ChurchSite />} />
<Route path="/igreja/:slug/evento/:id" element={<EventDetails />} />
<Route path="/igreja/:slug/blog" element={<Blog />} />
<Route path="/igreja/:slug/blog/:postSlug" element={<BlogPost />} />

// Admin da Igreja
<Route path="/igreja/:slug/admin" element={<ChurchAdminLayout />}>
  <Route index element={<AdminDashboard />} />
  {/* mesmas rotas admin atuais */}
</Route>

// Área do Membro da Igreja
<Route path="/igreja/:slug/membro" element={<ChurchMemberLayout />}>
  <Route index element={<MemberDashboard />} />
  {/* mesmas rotas membro atuais */}
</Route>
```

---

## 9. Componentes de Branding

### Novo Logo "Portal Igrejas"
```typescript
// src/components/PortalLogo.tsx
// Logo específico da plataforma SaaS
// Ícone de portal/igreja estilizado
```

### Novo Header Landing
```typescript
// Header para a landing page
// Links: Recursos, Preços, Login, Criar Igreja
```

---

## Sequência de Implementação

1. **Fase 1: Banco de Dados**
   - Criar tabela `churches`
   - Criar tabela `church_members`
   - Adicionar novos roles ao enum
   - Adicionar `church_id` às tabelas existentes
   - Criar funções e policies RLS

2. **Fase 2: Landing Page**
   - Criar componente `LandingPage`
   - Criar `UrlChecker` (verificador de URL)
   - Criar `LandingHero`, `Features`, `Pricing`
   - Criar novo `PortalLogo`

3. **Fase 3: Fluxo de Criação**
   - Página `CreateChurch`
   - Edge function para criar igreja e dados iniciais
   - Redirecionamento pós-criação

4. **Fase 4: Multi-Tenancy**
   - Criar `ChurchContext`
   - Atualizar rotas para incluir `:slug`
   - Modificar queries para filtrar por `church_id`
   - Adaptar admin e área do membro

5. **Fase 5: Plataforma Admin**
   - Dashboard da plataforma
   - Listagem e gestão de igrejas
   - Métricas globais

---

## Estimativa de Arquivos

| Tipo | Quantidade |
|------|------------|
| Novas páginas | ~10 |
| Novos componentes | ~15 |
| Contextos | 1 |
| Hooks | 2-3 |
| Migrações SQL | 2-3 |

---

## Resultado Final

- **Landing page profissional** com verificação de URL em tempo real
- **Criação de igreja em 2 minutos** com wizard simplificado
- **Isolamento completo** de dados entre igrejas
- **Admin reutilizado** do sistema atual
- **Escalável** para centenas de igrejas
