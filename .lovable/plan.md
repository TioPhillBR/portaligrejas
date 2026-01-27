
# Plano de Implementação: VAPID Keys e Correção do Wizard de Cadastro

## Resumo das Alterações

Este plano aborda duas funcionalidades principais:
1. **Configuração das VAPID Keys** para habilitar notificações push reais via Web Push API
2. **Correção do fluxo do wizard de cadastro de igrejas** para seguir a jornada correta do usuário

---

## 1. Configuração das VAPID Keys

### 1.1 Adicionar Secrets no Backend
- Adicionar as seguintes chaves como secrets do projeto:
  - `VAPID_PUBLIC_KEY`: `BCOmRoQhm50hjCYwqhJNp699R4bokxD8cnByV3fyVzD5QKJyQPGgMclDIohLQ7Ey3QmvggJL_ASt1k2I88BlAuw`
  - `VAPID_PRIVATE_KEY`: `1t3xL6aLgqTgQ2s4lPHGlVD6BRcaMOuD2CI3ANUicyc`

### 1.2 Atualizar Hook `usePushNotifications.ts`
- Substituir a VAPID_PUBLIC_KEY hardcoded pela chave pública fornecida
- A chave atual no código é: `BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U`
- Nova chave: `BCOmRoQhm50hjCYwqhJNp699R4bokxD8cnByV3fyVzD5QKJyQPGgMclDIohLQ7Ey3QmvggJL_ASt1k2I88BlAuw`

### 1.3 Atualizar Edge Function `send-push-notification`
- Implementar o envio real de notificações push usando a biblioteca `web-push` para Deno
- Utilizar as VAPID keys configuradas como secrets
- Incluir tratamento de erros e remoção de subscriptions inválidas

---

## 2. Correção do Fluxo do Wizard de Cadastro

### Fluxo Atual (Problemático)
O wizard atual tem os seguintes problemas:
- Cria a igreja ANTES do pagamento ser confirmado
- Não aguarda confirmação do webhook do Asaas
- Fluxo de passos confuso entre usuários logados e não logados

### Novo Fluxo Proposto

```text
USUÁRIO NÃO CADASTRADO:
┌──────────────────────────────────────────────────────────────────┐
│ Landing Page                                                      │
│ └─> Verificar disponibilidade do slug                            │
│     └─> Clicar "Criar meu site Agora"                            │
│         └─> Wizard Passo 1: Cadastrar usuário                    │
│             └─> Wizard Passo 2: Escolher plano + Checkout Asaas  │
│                 └─> Webhook confirma pagamento                    │
│                     └─> Wizard Passo 3: Cadastrar igreja         │
│                         └─> Atribuir role church_owner           │
│                             └─> Redirecionar para admin          │
└──────────────────────────────────────────────────────────────────┘

USUÁRIO JÁ CADASTRADO:
┌──────────────────────────────────────────────────────────────────┐
│ Landing Page                                                      │
│ └─> Fazer login                                                  │
│     └─> Verificar disponibilidade do slug                        │
│         └─> Clicar "Criar meu site Agora"                        │
│             └─> Wizard Passo 2: Escolher plano + Checkout Asaas  │
│                 └─> Webhook confirma pagamento                    │
│                     └─> Wizard Passo 3: Cadastrar igreja         │
│                         └─> Atribuir role church_owner           │
│                             └─> Redirecionar para admin          │
└──────────────────────────────────────────────────────────────────┘
```

### 2.1 Reestruturar `ChurchWizard.tsx`
Modificações necessárias:

**Novo Fluxo de Passos:**
- **Passo 1 (apenas não logados)**: Cadastro do usuário
- **Passo 2**: Seleção do plano e redirecionamento para checkout do Asaas
- **Passo 3**: Cadastro da igreja (só acessível após pagamento confirmado)

**Estado Pendente de Pagamento:**
- Salvar dados do wizard em `localStorage` antes do checkout
- Incluir `slug` nos dados persistidos
- Após retorno do Asaas, verificar status do pagamento via parâmetro URL ou polling

### 2.2 Atualizar Componente `WizardStepPlan.tsx`
- Ao selecionar plano, ir para checkout imediatamente (não para passo 3)
- Para contas gratuitas pré-aprovadas, pular checkout e ir direto para cadastro da igreja

### 2.3 Modificar Fluxo de Checkout
O checkout atual (`Checkout.tsx`) exige que a igreja já exista. Novo fluxo:

**Opção A - Checkout Integrado no Wizard:**
- Incorporar formulário de checkout (dados do cliente) diretamente no `WizardStepPlan`
- Gerar link de pagamento Asaas sem criar a igreja primeiro
- Usar `externalReference` com dados temporários (user_id + slug + timestamp)
- Após pagamento confirmado, permitir criação da igreja

**Opção B - Criar Igreja Pendente:**
- Criar igreja com `status: 'pending_payment'` 
- Usar church_id como referência no Asaas
- Webhook atualiza status para 'active' após pagamento

Recomendação: **Opção B** é mais simples e mantém compatibilidade com o fluxo atual do webhook.

### 2.4 Novo Status de Igreja
Adicionar suporte para status `pending_payment`:
- Igreja criada mas pagamento não confirmado
- Não aparece em listagens públicas
- Se pagamento não confirmado em X dias, igreja é removida

### 2.5 Modificar `asaas-webhook/index.ts`
Quando `PAYMENT_CONFIRMED`:
- Atualizar status da igreja de `pending_payment` para `active`
- Atribuir role `church_owner` ao usuário (owner_id da igreja)
- Enviar notificações configuradas

### 2.6 Atualizar `LandingHero.tsx`
- Modificar botão "Criar meu site agora" para redirecionar ao wizard com o slug
- Para usuários logados, redirecionar direto para `/criar-igreja/wizard?slug=xxx`
- Para não logados, mesmo comportamento atual

### 2.7 Persistência de Dados do Wizard
O wizard já salva em `localStorage`, mas precisa incluir:
- Slug escolhido na landing page
- Plano selecionado
- Dados do usuário (para pré-preencher após login)
- Status do pagamento (pendente/confirmado)

### 2.8 Página de Retorno do Checkout
Criar/modificar `CheckoutSuccess.tsx` para:
- Verificar se igreja foi ativada (polling ou realtime)
- Se ativada, redirecionar para Passo 3 do wizard (cadastro da igreja)
- Se já cadastrada, redirecionar para admin

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/usePushNotifications.ts` | Atualizar VAPID_PUBLIC_KEY |
| `supabase/functions/send-push-notification/index.ts` | Implementar envio real de push |
| `src/pages/onboarding/ChurchWizard.tsx` | Reestruturar fluxo de passos |
| `src/components/onboarding/WizardStepPlan.tsx` | Integrar checkout no passo |
| `src/components/onboarding/WizardStepChurch.tsx` | Verificar pagamento antes de exibir |
| `src/components/landing/LandingHero.tsx` | Passar slug para wizard |
| `supabase/functions/asaas-webhook/index.ts` | Adicionar lógica de role + notificações |
| `src/pages/CheckoutSuccess.tsx` | Verificar status e redirecionar |

## Novos Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `src/components/onboarding/WizardStepCheckout.tsx` | Formulário de checkout integrado (se opção A) |

---

## Detalhes Técnicos

### Implementação do Web Push (Edge Function)

A edge function precisará usar uma implementação de Web Push para Deno. Exemplo de estrutura:

```typescript
// Usando jose para JWT e crypto para assinatura
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

async function sendWebPush(subscription, payload, vapidKeys) {
  // 1. Gerar JWT para autorização VAPID
  // 2. Criptografar payload com chaves da subscription
  // 3. Fazer POST para endpoint da subscription
}
```

### Atribuição de Role church_owner

Adicionar no webhook após pagamento confirmado:

```typescript
// Adicionar role church_owner ao owner
await supabase.from("user_roles").upsert({
  user_id: church.owner_id,
  role: "church_owner"
}, { onConflict: "user_id,role" });
```

### Verificação de Pagamento no Wizard

O wizard verificará se o pagamento foi confirmado através de:
1. Parâmetro `?payment=success` na URL de retorno
2. Consulta ao status da igreja no banco de dados

---

## Próximos Passos Após Implementação

1. Testar fluxo completo com usuário não logado
2. Testar fluxo com usuário já logado
3. Testar cenário de conta gratuita pré-aprovada
4. Verificar recebimento de notificações push reais
5. Validar tratamento de erros (pagamento falhou, timeout, etc.)
