
# Correção do Erro "supabaseUrl is required" no Deploy Docker

## Diagnóstico

O erro ocorre porque as variáveis de ambiente `VITE_*` não estão sendo injetadas durante o build do Docker. O Vite substitui essas variáveis em tempo de compilação, não em runtime.

### Problema Identificado

```text
+------------------+           +------------------+
|   docker-compose |           |    Dockerfile    |
|                  |           |                  |
| env_file: .env   |--runtime->| Variáveis só     |
|      (errado)    |           | disponíveis após |
|                  |           | o build terminar |
+------------------+           +------------------+
                                       |
                                       v
                               +------------------+
                               | Build falha pois |
                               | VITE_* é undefined|
                               +------------------+
```

## Solução

### 1. Atualizar docker-compose.yml

Adicionar `build.args` para passar as variáveis durante o build:

```yaml
services:
  portal-igrejas:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
        VITE_SUPABASE_PUBLISHABLE_KEY: ${VITE_SUPABASE_PUBLISHABLE_KEY}
        VITE_SUPABASE_PROJECT_ID: ${VITE_SUPABASE_PROJECT_ID}
```

### 2. Criar arquivo .env para Docker

Criar um arquivo `.env` (não `.env.local`) na raiz do projeto com as variáveis:

```env
VITE_SUPABASE_URL=https://nyxnvsaivmvllqevgmeh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=nyxnvsaivmvllqevgmeh
```

### 3. Comando de Build Atualizado

Se estiver fazendo build manual do Docker:

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://nyxnvsaivmvllqevgmeh.supabase.co \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJI... \
  --build-arg VITE_SUPABASE_PROJECT_ID=nyxnvsaivmvllqevgmeh \
  -t portal-igrejas .
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `docker-compose.yml` | Adicionar seção `build.args` para passar variáveis em build-time |

## Código Atualizado para docker-compose.yml

```yaml
version: '3.8'

services:
  portal-igrejas:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
        VITE_SUPABASE_PUBLISHABLE_KEY: ${VITE_SUPABASE_PUBLISHABLE_KEY}
        VITE_SUPABASE_PROJECT_ID: ${VITE_SUPABASE_PROJECT_ID}
    container_name: portal-igrejas
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portal-igrejas.rule=Host(`portaligrejas.com.br`)"
      - "traefik.http.services.portal-igrejas.loadbalancer.server.port=3000"

# Para fazer o deploy, crie um arquivo .env com:
# VITE_SUPABASE_URL=https://nyxnvsaivmvllqevgmeh.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=sua-anon-key
# VITE_SUPABASE_PROJECT_ID=nyxnvsaivmvllqevgmeh
```

## Instruções de Deploy

1. Criar arquivo `.env` na raiz com as variáveis do Supabase
2. Executar `docker-compose build --no-cache`
3. Executar `docker-compose up -d`

## Observação

O deploy nativo do Lovable (https://portaligrejas.lovable.app) funciona corretamente. Este ajuste é necessário apenas para deploys customizados via Docker.
