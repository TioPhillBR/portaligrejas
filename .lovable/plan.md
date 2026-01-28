
# Plano para Corrigir Erro "Slug já existe" no Wizard

## Problema Identificado

Após análise profunda dos logs do PostgreSQL, identifiquei **a causa raiz exata**:

```
ERROR: duplicate key value violates unique constraint "site_settings_key_key"
```

### Análise Técnica

A tabela `site_settings` possui uma constraint UNIQUE incorreta:
- **Atual:** `UNIQUE (key)` - constraint global
- **Correto:** `UNIQUE (church_id, key)` - constraint por igreja

Isso é o **mesmo problema** que corrigimos anteriormente na tabela `home_sections`, só que agora afeta a tabela `site_settings`.

### Fluxo do Erro

```text
1. Usuário tenta criar igreja "plenagraca"
2. Função create_church_with_defaults() executa:
   - INSERT INTO churches ✓
   - INSERT INTO church_members ✓
   - INSERT INTO home_sections ✓ (já corrigido)
   - INSERT INTO site_settings com key='general' ✗ FALHA!
3. Erro: 23505 (violação de constraint única)
4. Sistema interpreta como "slug já existe" (código genérico para 23505)
```

### Prova nos Logs

Os logs do PostgreSQL mostram múltiplas tentativas falhando:
- `duplicate key value violates unique constraint "site_settings_key_key"` (repetido várias vezes)

---

## Solução

### Migração SQL

Criar migração para corrigir a constraint da tabela `site_settings`:

```sql
-- Remover constraint UNIQUE global incorreta
ALTER TABLE public.site_settings 
DROP CONSTRAINT IF EXISTS site_settings_key_key;

-- Criar constraint UNIQUE composta correta (por igreja)
ALTER TABLE public.site_settings 
ADD CONSTRAINT site_settings_church_key_unique 
UNIQUE (church_id, key);
```

### Arquivos a Modificar

1. **Nova Migração SQL**
   - Arquivo: `supabase/migrations/[timestamp]_fix_site_settings_unique_constraint.sql`
   - Conteúdo: Query SQL acima

### Por Que Isso Resolve

| Antes | Depois |
|-------|--------|
| `key='general'` pode existir apenas 1 vez no banco todo | `key='general'` pode existir 1 vez por `church_id` |
| Igreja A com `general` bloqueia Igreja B | Cada igreja pode ter suas próprias configurações |

---

## Validação

Após a migração, o fluxo de criação de igreja funcionará assim:

```text
1. Usuário cria igreja "plenagraca"
2. Função create_church_with_defaults():
   - INSERT INTO churches ✓ 
   - INSERT INTO church_members ✓
   - INSERT INTO home_sections ✓
   - INSERT INTO site_settings (church_id='xxx', key='general') ✓
   - INSERT INTO theme_settings ✓
3. Igreja criada com sucesso!
```

---

## Detalhes Técnicos

### Constraint Atual (Problemática)
```
site_settings_key_key | UNIQUE (key)
```

### Constraint Corrigida
```
site_settings_church_key_unique | UNIQUE (church_id, key)
```

Esta é a mesma correção que aplicamos em `home_sections`, onde também tínhamos `UNIQUE (section_key)` que foi corrigido para `UNIQUE (church_id, section_key)`.
