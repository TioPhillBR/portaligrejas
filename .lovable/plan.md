

# Plano: Gerenciamento Completo da Homepage via Admin

## Resumo

Este plano implementa um sistema completo de gerenciamento da homepage pelo painel administrativo, permitindo editar, atualizar, ordenar e personalizar TODOS os elementos de cada secao, alem de um sistema de temas com cores personalizaveis para modo claro e escuro.

---

## Analise Atual vs Requisitos

### Elementos HARDCODED que precisam ser dinamicos:

| Secao | Elementos Estaticos Encontrados |
|-------|--------------------------------|
| Hero | Badge, slogan/versiculo, botao 2 (textos fixos no codigo) |
| Quem Somos | Todo o conteudo das 4 abas (Historia, Missao, Visao, Valores) |
| Horarios de Culto | Badge, titulo, descricao, cards de horarios (lista fixa) |
| Eventos | Badge, titulo, descricao (eventos vem do banco, mas textos fixos) |
| Ministerios | Badge, titulo, descricao (ministerios vem do banco, mas textos fixos) |
| Galeria | Badge, titulo, descricao, categorias (imagens fixas no codigo) |
| Video | Funciona via banco (OK) |
| Web Radio | Badge, titulo, nome da radio, URL do stream (fixos) |
| Doacoes | Badge, titulo, versiculo (dados bancarios vem do banco) |
| Pedido de Oracao | Badge, versiculo (titulo/descricao parcialmente dinamicos) |
| Contato | Badge, titulo, descricao, dados de contato, link do mapa (fixos) |

---

## Arquitetura da Solucao

### 1. Estrutura do Banco de Dados

Utilizaremos a tabela existente `home_sections` com o campo JSONB `content` expandido para armazenar TODOS os elementos de cada secao.

**Estrutura do `content` por secao:**

```text
hero:
  - badge: "string"
  - title: "string"
  - slogan: "string"
  - bible_verse: "string"
  - bible_reference: "string"
  - background_image: "url"
  - cta_button_1_text: "string"
  - cta_button_1_link: "string"
  - cta_button_2_text: "string"
  - cta_button_2_link: "string"

about:
  - badge: "string"
  - tabs: [
      { id, label, icon, title, content (texto ou lista de valores) }
    ]

services:
  - badge: "string"
  (os cards vem da tabela service_schedules)

events:
  - badge: "string"
  - button_text: "string"
  - button_link: "string"

ministries:
  - badge: "string"

gallery:
  - badge: "string"
  - items_per_page: 8
  - categories: ["Todos", "Cultos", ...]
  (imagens vem da tabela gallery)

radio:
  - badge: "string"
  - radio_name: "string"
  - stream_url: "string"

donations:
  - badge: "string"
  - bible_verse: "string"
  - bible_reference: "string"

prayer:
  - badge: "string"
  - placeholder: "string"
  - bible_verse: "string"
  - bible_reference: "string"

contact:
  - badge: "string"
  - info: [{ icon, title, content }]
  - map_embed_url: "string"
```

### 2. Nova Tabela: `theme_settings`

```sql
CREATE TABLE theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active_theme TEXT NOT NULL DEFAULT 'royal-blue-gold',
  light_colors JSONB NOT NULL DEFAULT '{}',
  dark_colors JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
```

**Paletas Pre-definidas:**

1. **Azul Royal e Dourado** (atual)
   - Primary: #1E40AF / Gold: #D4AF37

2. **Verde Floresta e Bronze**
   - Primary: #166534 / Accent: #CD7F32

3. **Roxo Ametista e Prata**
   - Primary: #7C3AED / Accent: #C0C0C0

---

## Implementacao por Fase

### Fase 1: Expandir Editor de Secoes da Home

**Arquivo:** `src/pages/admin/HomeSections.tsx`

Adicionar casos no `renderContentEditor()` para TODAS as secoes:

```text
case "hero":
  - Input: Badge
  - Input: Titulo
  - Textarea: Slogan/Versiculo
  - Input: Referencia Biblica
  - ImageUpload: Imagem de Fundo
  - Grupo Botao 1: Texto + Link
  - Grupo Botao 2: Texto + Link

case "about":
  - Input: Badge
  - Accordion para cada aba:
    - Input: Label
    - Input: Titulo
    - RichTextEditor ou Textarea: Conteudo
    - (para Valores: lista editavel de items)

case "services":
  - Input: Badge
  - Link para gerenciar horarios (/admin/schedules)

case "events":
  - Input: Badge
  - Input: Texto do Botao
  - Input: Link do Botao

case "ministries":
  - Input: Badge

case "gallery":
  - Input: Badge
  - Number: Itens por Pagina
  - Lista editavel: Categorias
  - Link para gerenciar fotos (/admin/gallery)

case "radio":
  - Input: Badge
  - Input: Nome da Radio
  - Input: URL do Stream
  - Player de preview

case "donations":
  - Input: Badge
  - Input: Versiculo
  - Input: Referencia
  - Link para config de dados bancarios

case "prayer":
  - Input: Badge
  - Input: Placeholder
  - Input: Versiculo
  - Input: Referencia

case "contact":
  - Input: Badge
  - Lista editavel: Informacoes de Contato
  - Input: URL do Mapa (embed)
```

### Fase 2: Atualizar Componentes da Home

Cada componente sera atualizado para receber `sectionData` e usar valores dinamicos:

**Arquivos a modificar:**
- `src/components/sections/HeroSection.tsx`
- `src/components/sections/AboutSection.tsx`
- `src/components/sections/ServiceScheduleSection.tsx`
- `src/components/sections/EventsSection.tsx`
- `src/components/sections/MinistriesSection.tsx`
- `src/components/sections/GallerySection.tsx`
- `src/components/sections/WebRadioSection.tsx`
- `src/components/sections/DonationsSection.tsx`
- `src/components/sections/PrayerRequestSection.tsx`
- `src/components/sections/ContactSection.tsx`

**Padrao de implementacao:**
```typescript
const badge = sectionData?.content?.badge || "Valor Padrao";
const title = sectionData?.title || "Titulo Padrao";
```

### Fase 3: Galeria com Paginacao

**Arquivo:** `src/components/sections/GallerySection.tsx`

- Buscar imagens da tabela `gallery` ao inves de lista estatica
- Implementar paginacao:
  - "Anterior" / "Proxima"
  - "Pagina 1 de X"
  - Itens por pagina configuravel via admin

### Fase 4: Sistema de Temas

**Novos arquivos:**
- `src/pages/admin/ThemeSettings.tsx`
- `src/hooks/useThemeSettings.ts`
- `src/components/admin/ColorPicker.tsx`

**Funcionalidades:**

1. **Paletas Pre-definidas (3 opcoes):**
   - Selecionar tema com preview ao vivo
   - Aplicar com um clique

2. **Personalizacao Avancada:**
   - Color picker para cada variavel CSS:
     - Background / Foreground
     - Primary / Primary Foreground
     - Gold/Accent
     - Secondary
     - Muted
     - Border
     - Card
   - Separado por tema claro e escuro

3. **Persistencia:**
   - Salvar cores em `theme_settings`
   - Gerar CSS dinamico ou aplicar via CSS Variables

**Estrutura do Editor:**
```text
Tabs: [Paletas Prontas] [Tema Claro] [Tema Escuro]

Paletas Prontas:
  - Card: Azul Royal e Dourado [Aplicar]
  - Card: Verde Floresta e Bronze [Aplicar]
  - Card: Roxo Ametista e Prata [Aplicar]

Tema Claro / Escuro:
  - Secao: Cores Principais
    - Background: [color picker]
    - Texto Principal: [color picker]
    - Cor Primaria: [color picker]
    - Cor Destaque (Gold): [color picker]
  
  - Secao: Componentes
    - Card Background: [color picker]
    - Borda: [color picker]
    - Texto Secundario: [color picker]

  [Resetar para Padrao] [Salvar]
```

### Fase 5: Aplicar Tema Dinamicamente

**Arquivo:** `src/App.tsx` ou `src/main.tsx`

- Hook `useThemeSettings()` busca cores do banco
- Aplica CSS Variables no `:root` e `.dark`
- Atualiza em tempo real quando admin altera

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/admin/ThemeSettings.tsx` | Pagina de gerenciamento de temas |
| `src/hooks/useThemeSettings.ts` | Hook para buscar/aplicar temas |
| `src/components/admin/ColorPicker.tsx` | Componente de selecao de cor |
| `src/components/admin/EditableList.tsx` | Lista editavel generica (para valores, categorias, etc) |
| Migracao SQL | Criar tabela `theme_settings` e popular dados iniciais |

## Arquivos a Modificar

| Arquivo | Alteracoes |
|---------|------------|
| `src/pages/admin/HomeSections.tsx` | Expandir todos os editores de conteudo |
| `src/components/sections/*.tsx` (10 arquivos) | Tornar dinamicos |
| `src/components/admin/AdminLayout.tsx` | Adicionar link "Temas" |
| `src/App.tsx` | Adicionar rota /admin/themes |
| `src/index.css` | Possivelmente ajustar para temas dinamicos |
| `src/main.tsx` | Aplicar tema no carregamento |

---

## Resumo de Entregaveis

1. **Editor completo de TODAS as secoes** da home no admin
2. **10 componentes atualizados** para conteudo dinamico
3. **Galeria com paginacao** em portugues
4. **Sistema de 3 paletas pre-definidas**
5. **Editor de cores personalizado** para claro/escuro
6. **Aplicacao dinamica de tema** em tempo real

---

## Detalhes Tecnicos

### Migracao SQL

```sql
-- Criar tabela de temas
CREATE TABLE theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active_theme TEXT NOT NULL DEFAULT 'royal-blue-gold',
  light_colors JSONB NOT NULL DEFAULT '{
    "background": "0 0% 100%",
    "foreground": "220 30% 10%",
    "primary": "224 76% 37%",
    "gold": "43 74% 52%",
    "secondary": "220 20% 96%",
    "muted": "220 14% 96%",
    "border": "220 14% 90%",
    "card": "0 0% 100%"
  }',
  dark_colors JSONB NOT NULL DEFAULT '{
    "background": "220 30% 6%",
    "foreground": "0 0% 98%",
    "primary": "224 76% 55%",
    "gold": "43 80% 55%",
    "secondary": "220 25% 15%",
    "muted": "220 25% 15%",
    "border": "220 25% 18%",
    "card": "220 30% 10%"
  }',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Inserir registro inicial
INSERT INTO theme_settings (id) VALUES (gen_random_uuid());

-- RLS
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view theme" ON theme_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can update theme" ON theme_settings
  FOR UPDATE USING (has_any_admin_role(auth.uid()));
```

### Paletas Pre-definidas (objeto JS)

```typescript
const presetThemes = {
  'royal-blue-gold': {
    name: 'Azul Royal e Dourado',
    light: { primary: '224 76% 37%', gold: '43 74% 52%', ... },
    dark: { primary: '224 76% 55%', gold: '43 80% 55%', ... }
  },
  'forest-bronze': {
    name: 'Verde Floresta e Bronze',
    light: { primary: '142 76% 36%', gold: '30 60% 50%', ... },
    dark: { primary: '142 76% 46%', gold: '30 70% 55%', ... }
  },
  'amethyst-silver': {
    name: 'Roxo Ametista e Prata',
    light: { primary: '262 83% 58%', gold: '0 0% 75%', ... },
    dark: { primary: '262 83% 68%', gold: '0 0% 80%', ... }
  }
};
```

