
# Plano de Implementação: Sistema de Membros, Chat e Comunicação Segmentada

Este plano abrange três grandes funcionalidades: **animações de drag-and-drop**, **sistema completo de autenticação de membros** e **chat em tempo real por ministério**.

---

## Visão Geral da Arquitetura

```text
+------------------+     +------------------+     +------------------+
|   Página Pública |     |  Área do Membro  |     | Painel Admin     |
|   (Landing Page) |     |  (App Mobile-    |     | (Gestão)         |
|                  |     |   friendly)      |     |                  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         +------------------------+------------------------+
                                  |
                          +-------v-------+
                          |   Supabase    |
                          | - Auth        |
                          | - Database    |
                          | - Realtime    |
                          | - Storage     |
                          +---------------+
```

---

## Fase 1: Animações de Feedback no Drag-and-Drop

**Objetivo:** Melhorar a experiência visual ao reordenar itens.

### 1.1 Atualização do Hook `useDragReorder.ts`
- Adicionar estado `isDropping` para controlar animação pós-drop
- Expor função de callback para animação

### 1.2 Atualização do CSS (`src/index.css`)
- Adicionar keyframes para animação de "bounce" e "glow"
- Classes: `animate-drop-success`, `animate-drag-placeholder`

### 1.3 Atualização dos Componentes Admin
- Aplicar classes de animação em `Ministries.tsx` e `Schedules.tsx`
- Feedback visual: item brilha brevemente ao ser solto

---

## Fase 2: Sistema de Autenticação e Perfil de Membros

**Objetivo:** Permitir cadastro público, login e edição de perfil com dados de segmentação.

### 2.1 Atualização do Schema do Banco de Dados

**Novas colunas na tabela `profiles`:**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `phone` | text | Telefone do membro |
| `gender` | text | Masculino/Feminino |
| `birth_date` | date | Data de nascimento (para faixa etária) |
| `bio` | text | Descrição pessoal (opcional) |
| `is_public_member` | boolean | Se é membro público (não admin) |

**Nova tabela `ministry_members`:**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | Identificador único |
| `user_id` | uuid | Referência ao usuário |
| `ministry_id` | uuid | Referência ao ministério |
| `joined_at` | timestamp | Data de entrada |
| `is_active` | boolean | Se está ativo no ministério |

**Políticas RLS:**
- Membros podem ver/editar apenas seu próprio perfil
- Admins podem visualizar todos os perfis para segmentação

### 2.2 Atualização do Trigger `handle_new_user`
- Incluir campos de segmentação do `raw_user_meta_data`

### 2.3 Novas Páginas e Componentes

**Páginas:**
- `/cadastro` - Formulário de registro com campos de segmentação
- `/membro` - Dashboard do membro (mensagens, grupos)
- `/membro/perfil` - Edição de perfil
- `/membro/ministerios` - Lista de ministérios para participar

**Componentes:**
- `src/pages/Register.tsx` - Formulário de cadastro
- `src/pages/member/MemberDashboard.tsx` - Área do membro
- `src/pages/member/MemberProfile.tsx` - Edição de perfil
- `src/pages/member/MemberMinistries.tsx` - Ministérios

### 2.4 Atualização do `AuthContext.tsx`
- Incluir campos de segmentação no `signUp`
- Função para atualizar perfil

### 2.5 Atualização da Página de Login
- Adicionar link para cadastro
- Redirecionar membros para `/membro` e admins para `/admin`

---

## Fase 3: Sistema de Mensagens e Grupos em Tempo Real

**Objetivo:** Chat por ministério com mídia e segmentação.

### 3.1 Novas Tabelas no Banco de Dados

**Tabela `chat_messages`:**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | Identificador único |
| `ministry_id` | uuid | Grupo do ministério (null = mensagem direta) |
| `sender_id` | uuid | Quem enviou |
| `content` | text | Conteúdo da mensagem |
| `message_type` | text | text/image/audio/video |
| `media_url` | text | URL do arquivo (se houver) |
| `created_at` | timestamp | Data/hora de envio |
| `is_announcement` | boolean | Se é anúncio oficial |

**Tabela `direct_messages`:**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | Identificador único |
| `sender_id` | uuid | Remetente |
| `recipient_id` | uuid | Destinatário |
| `content` | text | Conteúdo |
| `message_type` | text | Tipo de mídia |
| `media_url` | text | URL do arquivo |
| `is_read` | boolean | Se foi lida |
| `created_at` | timestamp | Data/hora |

**Tabela `broadcast_messages`:**

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | Identificador único |
| `sender_id` | uuid | Admin/Líder que enviou |
| `target_type` | text | ministry/gender/age_range/all |
| `target_value` | text | ID do ministério ou valor do filtro |
| `content` | text | Conteúdo |
| `message_type` | text | Tipo de mídia |
| `media_url` | text | URL do arquivo |
| `created_at` | timestamp | Data/hora |

**Políticas RLS:**
- Membros do ministério podem ver mensagens do grupo
- Apenas líderes/admins podem enviar anúncios
- Mensagens diretas visíveis apenas para remetente/destinatário

### 3.2 Configuração do Supabase Realtime
- Habilitar realtime nas tabelas de mensagens
- Configurar canais por ministério

### 3.3 Bucket de Storage para Mídias
- `chat-media` - Bucket para imagens, áudios e vídeos do chat
- Políticas: membros autenticados podem fazer upload

### 3.4 Componentes de Chat

**Componentes:**
- `src/components/chat/ChatRoom.tsx` - Sala de chat principal
- `src/components/chat/MessageBubble.tsx` - Bolha de mensagem
- `src/components/chat/MessageInput.tsx` - Campo de entrada com emojis
- `src/components/chat/EmojiPicker.tsx` - Seletor de emojis (cristãos + tradicionais)
- `src/components/chat/MediaUploader.tsx` - Upload de mídia
- `src/components/chat/MediaPreview.tsx` - Preview de imagem/vídeo/áudio

**Páginas de Membro:**
- `src/pages/member/MinistryChat.tsx` - Chat do ministério
- `src/pages/member/DirectMessages.tsx` - Mensagens diretas

### 3.5 Emojis Cristãos
- Set customizado com: ✝️ 🙏 ⛪ 📖 🕊️ 👼 🙌 ❤️‍🔥 🫂 🌟 👑 🔥 💒 🎵 🎶

### 3.6 Upload de Mídia
- Compressão de imagens (como já existe em `useImageUpload`)
- Limite de tamanho para vídeos/áudios
- Preview antes de enviar

---

## Fase 4: Painel Admin - Comunicação Segmentada

**Objetivo:** Permitir envio de mensagens direcionadas.

### 4.1 Nova Página Admin
- `src/pages/admin/Broadcast.tsx` - Envio de mensagens em massa

### 4.2 Funcionalidades
- Selecionar destinatários por:
  - Todos os membros
  - Por ministério específico
  - Por gênero (Masculino/Feminino)
  - Por faixa etária (Jovens 13-30, Adultos 31-50, Terceira Idade 50+)
- Preview de quantos membros serão alcançados
- Envio de texto, imagem, áudio ou vídeo

### 4.3 Atualização do Layout Admin
- Adicionar item "Comunicação" no menu lateral

---

## Resumo de Arquivos a Criar/Modificar

### Novos Arquivos:
```text
src/pages/Register.tsx
src/pages/member/MemberDashboard.tsx
src/pages/member/MemberProfile.tsx
src/pages/member/MemberMinistries.tsx
src/pages/member/MinistryChat.tsx
src/pages/member/DirectMessages.tsx
src/pages/admin/Broadcast.tsx
src/components/chat/ChatRoom.tsx
src/components/chat/MessageBubble.tsx
src/components/chat/MessageInput.tsx
src/components/chat/EmojiPicker.tsx
src/components/chat/MediaUploader.tsx
src/components/chat/MediaPreview.tsx
src/components/member/MemberLayout.tsx
```

### Arquivos a Modificar:
```text
src/index.css (animações drag-drop)
src/hooks/useDragReorder.ts (estado de animação)
src/pages/admin/Ministries.tsx (animações)
src/pages/admin/Schedules.tsx (animações)
src/contexts/AuthContext.tsx (campos de segmentação)
src/pages/Login.tsx (link cadastro, redirect)
src/components/admin/AdminLayout.tsx (menu Comunicação)
src/App.tsx (novas rotas)
```

### Migrações de Banco:
- Atualização da tabela `profiles` (novos campos)
- Criação da tabela `ministry_members`
- Criação da tabela `chat_messages`
- Criação da tabela `direct_messages`
- Criação da tabela `broadcast_messages`
- Habilitação do Realtime
- Criação do bucket `chat-media`

---

## Ordem de Implementação Sugerida

1. **Animações de Drag-and-Drop** (rápido, melhoria imediata)
2. **Schema do banco + migrações** (fundação para o resto)
3. **Cadastro e Login de membros** (autenticação)
4. **Área do membro + edição de perfil**
5. **Participação em ministérios**
6. **Chat em tempo real por ministério**
7. **Sistema de mensagens diretas**
8. **Painel de broadcast para admins**

---

## Detalhes Técnicos

### Realtime com Supabase
```typescript
// Exemplo de subscrição ao chat
const channel = supabase
  .channel(`ministry-${ministryId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `ministry_id=eq.${ministryId}`
  }, (payload) => {
    // Adicionar nova mensagem ao estado
  })
  .subscribe();
```

### Segmentação por Faixa Etária
```sql
-- Função para calcular idade
CREATE FUNCTION public.get_age_range(birth_date date)
RETURNS text AS $$
  SELECT CASE
    WHEN EXTRACT(YEAR FROM age(birth_date)) < 13 THEN 'crianca'
    WHEN EXTRACT(YEAR FROM age(birth_date)) BETWEEN 13 AND 30 THEN 'jovem'
    WHEN EXTRACT(YEAR FROM age(birth_date)) BETWEEN 31 AND 50 THEN 'adulto'
    ELSE 'terceira_idade'
  END;
$$ LANGUAGE sql STABLE;
```

Este é um projeto extenso que transformará a plataforma em um aplicativo completo de comunidade para a igreja.
