

# Plano: Recriar Landing Page - PRD Portal Igrejas

## Resumo das Mudanças

Recriar a landing page completa seguindo o PRD fornecido, com foco em conversão para planos pagos (Prata, Ouro, Diamante), verificacao de slug em tempo real, e estrutura otimizada para alta conversao.

---

## 1. Alteracoes no Hero Section

### Arquivo: `src/components/landing/LandingHero.tsx`

**Alteracoes:**
- Atualizar headline para: "Um site profissional para sua igreja, sem complicacao"
- Atualizar subheadline para: "Crie agora o site da sua igreja com dominio personalizado, design moderno e suporte completo."
- Campo de verificacao: "Escolha o endereco do seu site: portaligrejas.com/[__]"
- Botao CTA: "Criar meu site agora"
- Mensagens dinamicas:
  - Disponivel: "portaligrejas.com/[slug] esta disponivel!"
  - Indisponivel: "Este nome ja esta em uso. Tente outro."
- Remover indicadores de "Gratis para comecar" e "Sem cartao de credito"

---

## 2. Alteracoes no Features/Beneficios

### Arquivo: `src/components/landing/Features.tsx`

**Alteracoes:**
- Titulo: "Tudo que sua igreja precisa"
- Subtitulo: "Recursos completos para gerenciar sua comunidade e manter todos conectados."
- Lista de 12 beneficios com icones:
  1. Gestao de Eventos com confirmacao online
  2. Ministerios e Grupos organizados
  3. Blog Integrado para reflexoes e estudos
  4. Galeria de Fotos
  5. Notificacoes para membros
  6. Personalizacao visual
  7. Area do Membro
  8. Site 100% Responsivo
  9. Chat de Ministerios
  10. Pedidos de Oracao
  11. Web Radio
  12. Painel Administrativo intuitivo

---

## 3. Nova Secao: Demonstracao do Template

### Novo Arquivo: `src/components/landing/TemplateDemo.tsx`

**Conteudo:**
- Titulo: "Design moderno e pensado para igrejas evangelicas"
- Subtitulo: "Seu site sera bonito, funcional e adaptado para celular, com secoes especificas para sua missao."
- Mockup do template (desktop + mobile)
- Botao: "Ver exemplo de site ao vivo"
- Destaques visuais: agenda de cultos, mensagens, ministerios, formulario de contato

---

## 4. Alteracoes nos Planos e Precos

### Arquivo: `src/components/landing/PricingCards.tsx`

**Novos Planos (somente pagos):**

| Recurso | Prata R$ 69/mes | Ouro R$ 119/mes | Diamante R$ 189/mes |
|---------|-----------------|-----------------|---------------------|
| Site 100% Responsivo | Sim | Sim | Sim |
| Painel Administrativo | Sim | Sim | Sim |
| Personalizacao Visual | Sim | Sim | Sim |
| Galeria de Fotos | Sim | Sim | Sim |
| Gestao de Eventos | Sim | Sim | Sim |
| Pedidos de Oracao | Sim | Sim | Sim |
| Blog Integrado | Nao | Sim | Sim |
| Ministerios e Grupos | Nao | Sim | Sim |
| Area do Membro | Nao | Sim | Sim |
| Notificacoes Push | Nao | Sim | Sim |
| Chat de Ministerios | Nao | Nao | Sim |
| Web Radio / Streaming | Nao | Nao | Sim |

**CTAs dos Planos:**
- Prata: "Quero o Plano Prata"
- Ouro: "Quero o Plano Ouro" (destacado como mais popular)
- Diamante: "Quero o Plano Diamante"

---

## 5. Nova Secao: Como Funciona

### Novo Arquivo: `src/components/landing/HowItWorks.tsx`

**Conteudo:**
- Titulo: "Crie seu site em 3 passos simples"
- Passos com icones:
  1. Escolha o nome do seu site (ex: portaligrejas.com/igrejaviva)
  2. Personalize com logo, textos e imagens
  3. Publique e compartilhe com sua comunidade
- Frase final: "Tudo isso sem precisar saber programar!"

---

## 6. Alteracoes nos Depoimentos

### Arquivo: `src/components/landing/Testimonials.tsx`

**Alteracoes:**
- Titulo: "Igrejas que ja confiam no Portal Igrejas"
- Depoimentos atualizados conforme PRD:
  1. "Agora temos um site lindo e recebemos doacoes online. Foi um divisor de aguas!" - Pr. Joao, Igreja Vida Plena (SP)
  2. "Facil de usar, rapido de publicar. Nossa agenda de cultos esta sempre atualizada." - Pastora Ana, Ministerio Luz do Mundo (MG)
- Adicionar mais 1-2 depoimentos para equilibrar

---

## 7. Nova Secao: FAQ

### Novo Arquivo: `src/components/landing/FAQ.tsx`

**Conteudo:**
- Titulo: "Duvidas Frequentes"
- Perguntas e respostas:
  1. "Preciso saber programar?" - "Nao. A plataforma e 100% visual e facil de usar."
  2. "Posso usar meu dominio proprio?" - "Sim. Voce pode usar um dominio personalizado ou manter o endereco portaligrejas.com/nomedaigreja."
  3. "O site funciona no celular?" - "Sim. Seu site sera 100% responsivo."
  4. "Posso cancelar quando quiser?" - "Sim. Nao ha fidelidade. Voce pode cancelar a qualquer momento."
  5. "Tem suporte tecnico?" - "Sim. Nossa equipe esta disponivel por WhatsApp e e-mail para te ajudar."

---

## 8. Alteracoes no Rodape

### Arquivo: `src/components/landing/LandingFooter.tsx`

**Alteracoes:**
- Adicionar links para: Termos de uso | Politica de privacidade | Suporte
- Adicionar contato: WhatsApp, E-mail
- Adicionar redes sociais: Instagram, YouTube
- Adicionar selo de seguranca (SSL, pagamento seguro)
- Adicionar aviso de cookies (LGPD)

---

## 9. Atualizacao da Pagina Principal

### Arquivo: `src/pages/landing/LandingPage.tsx`

**Alteracoes na Navegacao:**
- Desktop: Recursos, Como Funciona, Precos, Depoimentos, FAQ
- Adicionar link "Suporte" ou "Contato"

**Ordem das Secoes:**
1. Hero (verificacao de slug)
2. Features (Beneficios)
3. TemplateDemo (Demonstracao)
4. PricingCards (Planos Prata/Ouro/Diamante)
5. HowItWorks (Como Funciona)
6. Testimonials (Depoimentos)
7. FAQ
8. Footer

---

## 10. Tabela Comparativa de Planos

### Novo Arquivo: `src/components/landing/PricingTable.tsx`

**Conteudo:**
- Tabela responsiva com comparativo completo
- Colunas: Recurso, Prata, Ouro, Diamante
- Icones de check/x para indicar disponibilidade
- Sticky header para mobile
- CTA no final de cada coluna

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/components/landing/TemplateDemo.tsx` | Secao de demonstracao do template |
| `src/components/landing/HowItWorks.tsx` | Secao "Como Funciona" |
| `src/components/landing/FAQ.tsx` | Secao de perguntas frequentes |
| `src/components/landing/PricingTable.tsx` | Tabela comparativa de planos |

---

## Arquivos a Modificar

| Arquivo | Alteracoes |
|---------|-----------|
| `src/pages/landing/LandingPage.tsx` | Nova estrutura, ordem das secoes, navegacao |
| `src/components/landing/LandingHero.tsx` | Novo copy conforme PRD |
| `src/components/landing/Features.tsx` | Lista atualizada de beneficios |
| `src/components/landing/PricingCards.tsx` | Novos planos Prata/Ouro/Diamante |
| `src/components/landing/Testimonials.tsx` | Depoimentos atualizados |
| `src/components/landing/LandingFooter.tsx` | Links, contato, selos, LGPD |

---

## Detalhes Tecnicos

### Verificacao de Slug (LandingHero)
- Validacao AJAX em tempo real (ja implementado)
- Sugestoes automaticas se slug estiver indisponivel
- Slug aceita apenas letras, numeros e hifens (ja implementado)
- Debounce de 500ms para evitar requests excessivos

### Responsividade
- Mobile-first design
- Tabela de precos com scroll horizontal em mobile
- Cards de planos empilhados em mobile
- Menu hamburger (ja implementado)

### Animacoes
- Fade-in nas secoes ao scroll
- Hover effects nos cards
- Transicoes suaves nos botoes

---

## Resultado Esperado

- Landing page profissional focada em conversao
- Planos pagos claros (Prata R$69, Ouro R$119, Diamante R$189)
- Verificacao de URL em tempo real
- FAQ para eliminar objecoes
- Prova social com depoimentos
- Design moderno e responsivo
- Conformidade com LGPD (aviso de cookies)

