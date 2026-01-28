
# Plano de Correção: Tela Branca Após Login

## Diagnóstico

Após análise profunda dos logs, código-fonte e fluxo de navegação, identifiquei **três problemas críticos** que causam a tela branca:

### Problema 1: Redirecionamento Inválido no Login

**Arquivo:** `src/pages/Login.tsx` (linhas 27-29)

O código atual redireciona para:
- `/admin` quando o usuário é admin
- `/membro` quando não é admin

Essas rotas **não existem** no sistema multi-tenant. As rotas corretas devem incluir o slug da igreja:
- `/${slug}/admin`
- `/${slug}/membro`

### Problema 2: Links do Sidebar com Rotas Absolutas

**Arquivo:** `src/components/admin/AdminLayout.tsx` (linhas 38-58)

Os itens do sidebar usam caminhos absolutos como `/admin/eventos`, quando deveriam usar caminhos relativos baseados no slug atual da igreja.

### Problema 3: Link "Ver Site" Apontando para Raiz

**Arquivo:** `src/components/admin/AdminLayout.tsx` (linha 149)

O link "Ver Site" aponta para `/` em vez de `/${slug}`.

## Solução Técnica

### 1. Corrigir Login.tsx

Alterar o redirecionamento para buscar a igreja do usuário e redirecionar corretamente:

```typescript
useEffect(() => {
  const checkAndRedirect = async () => {
    if (user) {
      // Buscar a igreja do usuário
      const { data: membership } = await supabase
        .from("church_members")
        .select("church_id, role, churches(slug)")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (membership?.churches?.slug) {
        const slug = membership.churches.slug;
        const isChurchAdmin = membership.role === 'owner' || membership.role === 'admin';
        
        if (isChurchAdmin) {
          navigate(`/${slug}/admin`);
        } else {
          navigate(`/${slug}/membro`);
        }
      } else {
        // Verificar se é admin da plataforma
        const { data: isPlatformAdmin } = await supabase.rpc("is_platform_admin", { _user_id: user.id });
        if (isPlatformAdmin) {
          navigate("/plataforma");
        } else {
          // Usuário sem igreja associada - redirecionar para lista de igrejas
          navigate("/igrejas");
        }
      }
    }
  };
  checkAndRedirect();
}, [user, navigate]);
```

### 2. Corrigir AdminLayout.tsx

Modificar os links para usar rotas relativas ao slug:

```typescript
// Alterar sidebarItems para usar função que gera href dinâmico
const getSidebarItems = (slug: string) => [
  { icon: LayoutDashboard, label: "Dashboard", href: `/${slug}/admin`, tutorialId: "dashboard" },
  { icon: BarChart3, label: "Analytics", href: `/${slug}/admin/analytics` },
  { icon: Home, label: "Seções da Home", href: `/${slug}/admin/secoes` },
  // ... demais itens
];

// No componente:
const items = getSidebarItems(slug || '');

// E corrigir o link "Ver Site":
<a href={`/${slug}`} target="_blank" ...>
```

### 3. Verificar isActive no Sidebar

A comparação de rota ativa também precisa considerar o slug:

```typescript
const isActive = location.pathname === item.href || 
  (item.href === `/${slug}/admin` && location.pathname === `/${slug}/admin`);
```

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Login.tsx` | Corrigir lógica de redirecionamento pós-login |
| `src/components/admin/AdminLayout.tsx` | Usar rotas dinâmicas baseadas no slug |

## Fluxo Corrigido

```text
┌─────────────────────────────────────────────────────────────┐
│                     FLUXO DE LOGIN                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Usuário faz login                                         │
│         │                                                   │
│         ▼                                                   │
│   Busca church_members do usuário                           │
│         │                                                   │
│         ├── Tem igreja? ─────────────────┐                  │
│         │                                │                  │
│         │   SIM                          │   NÃO            │
│         ▼                                ▼                  │
│   É owner/admin?              É platform_admin?             │
│    │         │                    │         │               │
│   SIM       NÃO                  SIM       NÃO              │
│    │         │                    │         │               │
│    ▼         ▼                    ▼         ▼               │
│ /:slug/   /:slug/           /plataforma   /igrejas          │
│   admin    membro                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Impacto

- **Login funcional**: Usuários serão redirecionados para a página correta
- **Navegação do admin**: Todos os links funcionarão corretamente dentro do contexto da igreja
- **Multi-tenancy mantido**: Cada igreja mantém seu próprio espaço isolado
