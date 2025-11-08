# Web App Deploy - FastAPI + React

Este projeto é um dashboard de monitoramento fullstack com o objetivo de aprofundar em conhecimentos sobre o Kubernetes, composto por um backend em FastAPI e um frontend em React. O sistema monitora a saúde do backend, banco de dados PostgreSQL e cache Redis, além de fornecer documentação interativa da API.

## Requisitos do Sistema

- **Docker** >= 20.10
- **Docker Compose** >= 2.0 (para deploy com Docker Compose)
- **Kind** >= 0.20 (para deploy com Kubernetes)
- **Kubectl** >= 1.28 (para deploy com Kubernetes)
- **Helm** >= 3.12 (para deploy com Kubernetes)
- **Recursos mínimos recomendados:**
  - 4GB RAM disponível
  - 2 CPUs
  - 10GB de espaço em disco

## Estrutura do Projeto

```
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── ApiDocumentation.jsx
│       ├── App.css
│       ├── App.jsx
│       ├── config.js
│       ├── HealthMonitor.jsx
│       └── main.jsx
├── k8s/
│   ├── kind-config.yaml
│   ├── app/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   ├── templates/
│   │   │   ├── _NOTES.txt
│   │   │   ├── backend.yaml
│   │   │   ├── frontend.yaml
│   │   │   ├── limit-range.yaml
│   │   │   ├── network-policy.yaml
│   │   │   ├── postgres.yaml
│   │   │   ├── redis.yaml
│   │   │   └── resource-quota.yaml
│   │   └── values/
│   │       ├── dev.yaml
│   │       └── prod.yaml
│   ├── cluster/
│   │   ├── calico.yaml
│   │   ├── components.yaml
├── scripts/
│   ├── locustfile.py
│   ├── startup.sh
├── compose.yaml
├── LICENSE
├── README.md
```

## Variáveis de Ambiente

### Para Docker Compose

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
# Frontend Configuration
VITE_API_URL=http://localhost:8000/

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=postgres

# Backend Database Connection (usado internamente pelo backend)
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=postgres
DB_HOST=postgres
DB_PORT=5432

# Redis Configuration  
REDIS_HOST=redis
REDIS_PORT=6379

# GitHub Repository for Versioning
GITHUB_REPO=owner/repository_name
```

> **⚠️ Importante:** É necessário ter uma **release/tag** criada no repositório GitHub configurado em `GITHUB_REPO` para que a aplicação consiga obter a versão via API do GitHub.

### Para Desenvolvimento Local (sem Docker)

### Backend (`backend/`)

- `pip install -r requirements.txt` — Instala as dependências Python.
- `uvicorn main:app --host 0.0.0.0 --port 8000` — Inicia o backend FastAPI.

### Frontend (`frontend/`)

Crie um arquivo `.env` dentro da pasta `frontend` para configurar a URL da API:

```env
VITE_API_URL=http://localhost:8000
```

- `npm install` — Instala as dependências.
- `npm run dev` — Inicia o servidor de desenvolvimento (Vite) em `http://localhost:8080`.
- `npm run build` — Gera a build de produção.
- `npm run preview` — Visualiza a build de produção localmente.

> **Nota:** O endereço da API consumida pelo frontend é definido pela variável `VITE_API_URL` no arquivo `.env` do frontend e centralizado na constante `API_BASE_URL` (`src/config.js`). Compile novamente o Vite após alterar esta variável.


## Como Rodar o Projeto com (`docker-compose`)

1. Tenha instalado o Docker e o Docker-compose na sua máquina [Documentação de instalação do Docker](https://docs.docker.com/engine/install/)  

2. **Configure as variáveis de ambiente**  
   Copie `.env.example` para `.env` e ajuste conforme necessário.

3. **Subindo os serviços com Docker Compose**

   ```sh
   docker compose up -d
   ```

4. **Acesse o frontend**  
   - Dashboard: [http://localhost:8080](http://localhost:8080)

5. **Acesse o backend**  
   - API: [http://localhost:8000](http://localhost:8000)
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)


## Como Rodar o Projeto com (`Kubernetes`)

1. Tenha instalado o Docker, Kind e Kubectl na sua máquina. Veja a documentação de cada ferramenta:
   - [Docker](https://docs.docker.com/engine/install/)
   - [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/)
   - [Kubectl](https://kubernetes.io/docs/tasks/tools/)
   - [Helm](https://helm.sh/docs/intro/install/)

2. O cluster local é configurado via arquivo [`k8s/kind-config.yaml`](k8s/kind-config.yaml).

3. Para criar e inicializar o cluster com todos os recursos de desenvolvimento, execute o script:

   ```sh
   ./scripts/startup.sh
   ```

   - Para iniciar apenas o cluster: `./scripts/startup.sh --cluster` ou `-c`
   - Para reiniciar o cluster: `./scripts/startup.sh --restart` ou `-r`
   - Para deletar o cluster: `./scripts/startup.sh --delete` ou `-d`

4. Acesse o frontend e backend pelos endpoints:
   - **Dev:**
      - Frontend: [http://localhost:8081](http://localhost:8081)
      - Backend: [http://localhost:8001](http://localhost:8001)
   - **Prod:**
      - Frontend: [http://localhost:8080](http://localhost:8080)
      - Backend: [http://localhost:8000](http://localhost:8000)

> O script aplica todos os charts do diretório `k8s/` após criar o cluster Kind. As portas são expostas via **NodePort** configurado no `kind-config.yaml`.

### Observações sobre Imagens Docker

Se desejar utilizar imagens personalizadas, lembre-se de fazer o upload delas para um container registry acessível pelo cluster Kubernetes (ex: Docker Hub, GitHub Container Registry).

### Comandos Úteis do Kubernetes

```sh
# Ver todos os pods
kubectl get pods -n dev
kubectl get pods -n prod

# Ver logs de um pod específico
kubectl logs -f <nome-do-pod> -n dev

# Ver todos os serviços
kubectl get svc -n <namespace>

# Descrever um pod (útil para debugging)
kubectl describe pod <nome-do-pod> -n <namespace>

# Ver os deployments
kubectl get deployments -n <namespace>

# Fazer port-forward manual (se necessário)
kubectl port-forward svc/backend 8000:8000 -n <namespace>
```

## Testes de Carga com Locust

O projeto inclui um arquivo de teste de carga usando [Locust](https://locust.io/), para validar o [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/).

### Instalação do Locust

```sh
pip install locust
```

### Executar Testes de Carga

```sh
# Executar Locust contra o ambiente local
locust -f scripts/locustfile.py --host=http://localhost:8000

# Executar em modo headless (sem interface web)
locust -f scripts/locustfile.py --host=http://localhost:8000 --users 100 --spawn-rate 10 --run-time 1m --headless
```

Acesse a interface web do Locust em: [http://localhost:8089](http://localhost:8089)

O arquivo `locustfile.py` testa os seguintes endpoints:

- `GET /ready` (peso 10)
- `GET /` (peso 1)

## Endpoints Principais

- `GET /` — Mensagem de boas-vindas.
- `GET /health` — Verifica a saúde da aplicação.
- `GET /ready` — Verifica se a aplicação está pronta para receber carga.
- `GET /db-check` — Verifica conexão com o banco de dados.
- `GET /cache-check` — Verifica conexão com o Redis.

## Tecnologias Utilizadas

- **Frontend:** React + Vite
- **Backend:** FastAPI
- **Banco de Dados:** PostgreSQL
- **Cache:** Redis
- **Orquestração:** Kubernetes + Helm
- **Testes de Carga:** Locust

## Troubleshooting

### Problema: Cluster Kind não inicia

**Solução:**

```sh
# Verificar se há conflito de portas
sudo lsof -i :8080
sudo lsof -i :8000

# Deletar e recriar o cluster
./scripts/startup.sh --delete
./scripts/startup.sh
```

### Problema: Pods não iniciam no Kubernetes

**Solução:**

```sh
# Verificar status dos pods
kubectl get pods -n dev

# Ver logs detalhados
kubectl describe pod <nome-do-pod> -n dev

# Verificar eventos do namespace
kubectl get events -n dev --sort-by='.lastTimestamp'
```

### Problema: Erro de conexão com PostgreSQL/Redis

**Solução:**

- Verifique se os pods do PostgreSQL e Redis estão rodando
- Certifique-se de que as variáveis de ambiente estão configuradas corretamente
- Aguarde os health checks completarem (pode levar alguns segundos)

### Problema: GitHub API não retorna versão

**Solução:**

- Verifique se a variável `GITHUB_REPO` está configurada corretamente no formato `owner/repository_name`
- Certifique-se de que existe pelo menos uma release/tag no repositório
- Verifique se há rate limiting da API do GitHub (limite: 60 requests/hora sem autenticação)

## Considerações Finais

Este projeto foi desenvolvido com atenção a boas práticas de Kubernetes e arquitetura de aplicações distribuídas. Alguns destaques técnicos:

### Ideias de Melhorias

Este projeto está aberto a contribuições! Algumas ideias para evolução:

- 🔐 **Segurança Avançada:**
  - Implementar Service Mesh (Istio/Linkerd)
  - Adicionar mTLS entre serviços

- 📊 **Observabilidade:**
  - Integração com Prometheus e Grafana

- 🚀 **Escalabilidade:**
  - Utilizar KEDA (Kubernetes Event-Driven Autoscaling) para HPA baseado em eventos
  - Implementar arquitetura Master/Slave para PostgreSQL com replicação
  - Adicionar Redis Cluster para alta disponibilidade do cache

- 🌐 **Infraestrutura:**
  - Implementar Service Discovery
  - Adicionar Ingress Controller (NGINX/Traefik)

### Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

- Abrir issues reportando bugs ou sugerindo melhorias
- Submeter pull requests com novas features
- Usar este projeto como base de estudos e compartilhar seu aprendizado
- Melhorar a documentação

## Licença

Este projeto está sob a licença MIT.

---

> Para dúvidas ou sugestões, abra uma issue ou envie um pull request!
