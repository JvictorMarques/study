# Web App Deploy - FastAPI + React

Este projeto é um dashboard de monitoramento fullstack, composto por um backend em FastAPI e um frontend em React. O sistema monitora a saúde do backend, banco de dados PostgreSQL e cache Redis, além de fornecer documentação interativa da API.

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
├── compose.yaml
├── .env.example
└── .gitignore
```

## Variáveis de Ambiente

### Backend (raiz do projeto)
Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=postgres

# Backend Database Connection
DB_HOST=db
DB_PORT=5432

# Redis Configuration  
REDIS_HOST=cache
REDIS_PORT=6379
```

### Frontend (`frontend/.env`)
Crie um arquivo `.env` dentro da pasta `frontend` para configurar a URL da API:

```env
VITE_API_URL=http://localhost:8000
```

O endereço base da API é centralizado em `frontend/src/config.js` na constante `API_BASE_URL`. Todo o frontend importa essa constante para acessar a API, garantindo que a configuração seja única e fácil de manter. Se a variável de ambiente não for definida, será usado automaticamente `http://localhost:8000`.

## Scripts Disponíveis

### Frontend

No diretório `frontend`:

- `npm install` — Instala as dependências.
- `npm run dev` — Inicia o servidor de desenvolvimento (Vite) em `http://localhost:8080`.
- `npm run build` — Gera a build de produção.
- `npm run preview` — Visualiza a build de produção localmente.

> **Nota:** O endereço da API consumida pelo frontend é definido pela variável `VITE_API_URL` no arquivo `.env` do frontend e centralizado na constante `API_BASE_URL` (`src/config.js`). Compile novamente o Vite após alterar esta variável.

### Backend

No diretório `backend`:

- `pip install -r requirements.txt` — Instala as dependências Python.
- `uvicorn main:app --host 0.0.0.0 --port 8000` — Inicia o backend FastAPI.

### Docker Compose

Na raiz do projeto:

- `docker compose up --build` — Sobe todos os serviços (frontend, backend, db, cache).
- `docker compose down` — Para e remove os containers.

## Como Rodar o Projeto

1. **Configure as variáveis de ambiente**  
   Copie `.env.example` para `.env` e ajuste conforme necessário.

2. **Suba os serviços com Docker Compose**  
   ```sh
   docker compose up --build
   ```

3. **Acesse o frontend**  
   - Dashboard: [http://localhost:8080](http://localhost:8080)

4. **Acesse o backend**  
   - API: [http://localhost:8000](http://localhost:8000)
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Endpoints Principais

- `GET /` — Mensagem de boas-vindas.
- `GET /health` — Verifica a saúde do backend, banco e cache.
- `GET /db-check` — Verifica conexão com o banco de dados.
- `GET /cache-check` — Verifica conexão com o Redis.

## Tecnologias Utilizadas

- **Frontend:** React + Vite
- **Backend:** FastAPI
- **Banco de Dados:** PostgreSQL
- **Cache:** Redis
- **Orquestração:** Docker Compose

## Licença

Este projeto está sob a licença MIT.

---

> Para dúvidas ou sugestões, abra uma issue ou envie um pull request!
