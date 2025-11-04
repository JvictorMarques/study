# Web App Deploy - FastAPI + React

Este projeto é um dashboard de monitoramento fullstack com o objetivo de aprofundar em conhecimentos sobre o Kubernetes, composto por um backend em FastAPI e um frontend em React. O sistema monitora a saúde do backend, banco de dados PostgreSQL e cache Redis, além de fornecer documentação interativa da API.

## Estrutura do Projeto

```
.
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
│   └── __pycache__/
├── compose.yaml
├── LICENSE
├── README.md
```

## Variáveis de Ambiente

### Backend (`backend/`)
Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
# Frontend Configuration
VITE_API_URL=http://localhost:8000/

# Database Configuration
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=postgres

# Backend Database Connection
DB_HOST=db
DB_PORT=5432

# Redis Configuration  
REDIS_HOST=cache
REDIS_PORT=6379

# GitHub Repository for Versioning
GITHUB_REPO=owner/repository_name
```
É necessário ter uma tag criada, caso haja um fork do projeto, para que a aplicação consiga se conectar a API do Github.

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

2. O cluster local é configurado via arquivo [`k8s/kind-config.yaml`](k8s/kind-config.yaml).

3. Para criar e inicializar o cluster com todos os recursos de desenvolvimento, execute o script:
   ```sh
   ./scripts/startup.sh
   ```
   - Para iniciar apenas o cluster: `./scripts/startup.sh --cluster ou -c`
   - Para reiniciar o cluster: `./scripts/startup.sh --restart ou -r`
   - Para deletar o cluster: `./scripts/startup.sh --delete ou -d`

4. Acesse o frontend e backend pelos endpoints:
   - Dev: 
      - Frontend:[http://localhost:8081](http://localhost:8081) 
      - Backend:[http://localhost:8001](http://localhost:8001)
   - Prod: 
      - Frontend:[http://localhost:8080](http://localhost:8080) 
      - Backend:[http://localhost:8000](http://localhost:8000)

> O script aplica todos os manifests do diretório `k8s/dev/` após criar o cluster Kind.

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
- **Orquestração:** Kubernetes

## Licença

Este projeto está sob a licença MIT.

---

> Para dúvidas ou sugestões, abra uma issue ou envie um pull request!
