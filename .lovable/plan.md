
# Plano: Criar Trigger para Perfil Automático de Usuário

## Problema Identificado

A tabela `profiles` existe no banco de dados, mas está vazia. O trigger que deveria criar automaticamente um perfil quando um usuário se registra **não está configurado**.

A função `handle_new_user()` existe e está correta, porém não está conectada ao evento de criação de usuário no sistema de autenticação.

## Solução Proposta

### 1. Criar o Trigger no Banco de Dados

Executar uma migração SQL para criar o trigger que conecta a função `handle_new_user()` à tabela de usuários:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Criar Perfil para Usuários Existentes

Como você já se registrou antes do trigger existir, precisamos criar manualmente o perfil para o usuário atual:

```sql
INSERT INTO public.profiles (user_id, full_name, phone, gender, birth_date)
SELECT 
  id as user_id,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'phone' as phone,
  raw_user_meta_data->>'gender' as gender,
  CASE 
    WHEN raw_user_meta_data->>'birth_date' IS NOT NULL 
    AND raw_user_meta_data->>'birth_date' != ''
    THEN (raw_user_meta_data->>'birth_date')::date
    ELSE NULL
  END as birth_date
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles);
```

## Resultado Esperado

- Novos usuários terão perfis criados automaticamente ao se registrar
- O usuário atual (Phelipe Coelho) terá seu perfil criado com os dados do cadastro
- A área de membros funcionará corretamente exibindo nome e informações do usuário

## Sequência de Implementação

1. Executar migração para criar o trigger
2. Inserir perfis para usuários já existentes
3. Verificar se os dados aparecem corretamente na interface
