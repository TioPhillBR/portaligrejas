
# Plano: Sistema de Emails de Pagamento e Suspensão Automática

## Resumo
Implementar notificações por email para eventos de pagamento usando Resend e expandir o webhook do Asaas para gerenciar suspensão/reativação automática de igrejas com base no status dos pagamentos.

## Arquitetura da Solução

```text
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│     Asaas       │─────▶│  asaas-webhook   │─────▶│    Supabase     │
│   (Eventos)     │      │ (Edge Function)  │      │   (Database)    │
└─────────────────┘      └────────┬─────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  send-payment   │
                         │  -email (Nova)  │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │     Resend      │
                         │   (Emails)      │
                         └─────────────────┘
```

## Implementação

### 1. Adicionar Campos de Controle de Pagamentos no Banco
Adicionar colunas na tabela `churches` para rastrear o status de pagamentos:

```sql
-- Nova migration
ALTER TABLE public.churches 
ADD COLUMN IF NOT EXISTS payment_overdue_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT DEFAULT NULL;

COMMENT ON COLUMN public.churches.payment_overdue_at IS 'Data do primeiro pagamento em atraso';
COMMENT ON COLUMN public.churches.asaas_subscription_id IS 'ID da assinatura no Asaas';
COMMENT ON COLUMN public.churches.asaas_customer_id IS 'ID do cliente no Asaas';
```

### 2. Criar Edge Function para Envio de Emails
Nova função `send-payment-email`:

```typescript
// supabase/functions/send-payment-email/index.ts
import { Resend } from "npm:resend@2.0.0";

type EmailType = "payment_confirmed" | "payment_overdue" | "subscription_cancelled";

interface EmailPayload {
  type: EmailType;
  to: string;
  churchName: string;
  ownerName: string;
  planName?: string;
  daysOverdue?: number;
}

// Templates HTML personalizados para cada tipo de email
// - Pagamento Confirmado: Boas-vindas + detalhes do plano
// - Pagamento em Atraso: Aviso + orientações para regularização
// - Assinatura Cancelada: Notificação + benefícios perdidos
```

### 3. Expandir o Webhook do Asaas
Atualizar `asaas-webhook/index.ts` para:

**a) Pagamento Confirmado (`PAYMENT_CONFIRMED`/`PAYMENT_RECEIVED`):**
- Ativar igreja (`status: "active"`)
- Limpar data de atraso (`payment_overdue_at: null`)
- Atualizar plano se houver `pending_plan`
- Enviar email de confirmação

**b) Pagamento em Atraso (`PAYMENT_OVERDUE`):**
- Registrar primeira data de atraso se não existir
- Calcular dias em atraso
- **Se >= 7 dias:** Suspender igreja (`status: "suspended"`)
- Enviar email de aviso (informando dias restantes ou suspensão)

**c) Assinatura Cancelada (`SUBSCRIPTION_DELETED`/`SUBSCRIPTION_INACTIVATED`):**
- Rebaixar para plano free
- Limpar campos de assinatura
- Enviar email de cancelamento

```typescript
// Lógica de suspensão automática
if (event === "PAYMENT_OVERDUE") {
  const { data: church } = await supabase
    .from("churches")
    .select("payment_overdue_at, email, name, ...")
    .eq("id", churchId)
    .single();

  let overdueDate = church.payment_overdue_at;
  
  if (!overdueDate) {
    // Primeiro atraso - registrar data
    overdueDate = new Date().toISOString();
    await supabase.from("churches")
      .update({ payment_overdue_at: overdueDate })
      .eq("id", churchId);
  }
  
  const daysOverdue = Math.floor(
    (Date.now() - new Date(overdueDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysOverdue >= 7) {
    // Suspender igreja
    await supabase.from("churches")
      .update({ status: "suspended" })
      .eq("id", churchId);
  }
  
  // Enviar email de atraso
  await sendEmail("payment_overdue", { daysOverdue, ... });
}
```

### 4. Obter Email do Owner
Para enviar emails ao proprietário da igreja, buscar o email através de:
1. `church.email` (email da igreja cadastrado)
2. Se não existir, buscar o owner via `church_members` com `role = 'owner'`
3. Usar `auth.admin.getUserById()` para obter email do Supabase Auth

```typescript
async function getOwnerEmail(supabase, churchId: string): Promise<{email: string, name: string} | null> {
  // 1. Tentar email da igreja primeiro
  const { data: church } = await supabase
    .from("churches")
    .select("email, name, owner_id")
    .eq("id", churchId)
    .single();
    
  if (church?.email) {
    return { email: church.email, name: church.name };
  }
  
  // 2. Buscar owner via church_members
  const { data: owner } = await supabase
    .from("church_members")
    .select("user_id, profiles(full_name)")
    .eq("church_id", churchId)
    .eq("role", "owner")
    .single();
    
  if (owner?.user_id) {
    // 3. Obter email via Supabase Admin API
    const { data: { user } } = await supabase.auth.admin.getUserById(owner.user_id);
    return { email: user?.email, name: owner.profiles?.full_name };
  }
  
  return null;
}
```

### 5. Configuração Necessária

**Secret a adicionar:**
- `RESEND_API_KEY` - Chave da API do Resend para envio de emails

**Pré-requisitos do usuário:**
1. Criar conta em https://resend.com
2. Validar domínio em https://resend.com/domains
3. Criar API key em https://resend.com/api-keys

### 6. Templates de Email

| Tipo | Assunto | Conteúdo Principal |
|------|---------|-------------------|
| Pagamento Confirmado | "🎉 Pagamento confirmado - {Igreja}" | Boas-vindas, detalhes do plano ativado |
| Pagamento em Atraso | "⚠️ Pagamento pendente - {Igreja}" | Aviso, dias restantes antes da suspensão |
| Igreja Suspensa | "🚫 Igreja suspensa - {Igreja}" | Notificação, instruções para regularizar |
| Assinatura Cancelada | "📋 Assinatura cancelada - {Igreja}" | Confirmação, plano rebaixado para free |

## Fluxo de Eventos

```text
PAGAMENTO_CONFIRMADO
    ├── Ativar igreja (status: active)
    ├── Limpar payment_overdue_at
    ├── Aplicar pending_plan se existir
    └── Enviar email de confirmação ✉️

PAGAMENTO_EM_ATRASO
    ├── Registrar payment_overdue_at (se primeiro atraso)
    ├── Calcular dias em atraso
    ├── SE dias >= 7: Suspender (status: suspended)
    └── Enviar email de aviso ✉️

ASSINATURA_CANCELADA
    ├── Rebaixar para free
    ├── Limpar campos Asaas
    └── Enviar email de cancelamento ✉️
```

## Arquivos a Modificar/Criar

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/xxx.sql` | Criar - campos de controle |
| `supabase/functions/send-payment-email/index.ts` | Criar - envio de emails |
| `supabase/functions/asaas-webhook/index.ts` | Modificar - lógica expandida |
| `supabase/config.toml` | Modificar - registrar nova função |

## Detalhes Técnicos

### RLS e Segurança
- A edge function usa `SUPABASE_SERVICE_ROLE_KEY` para bypass de RLS
- Email enviado apenas para o owner/email cadastrado da igreja
- Webhook do Asaas deve ter `verify_jwt = false` (já configurado)

### Tratamento de Erros
- Logs detalhados para cada evento processado
- Fallback se email não puder ser enviado (não bloqueia o webhook)
- Retry automático do Asaas em caso de falha 5xx

### Reativação Automática
Quando um pagamento atrasado é regularizado:
- `PAYMENT_CONFIRMED` limpa `payment_overdue_at`
- Igreja volta para `status: "active"`
- Email de confirmação é enviado
