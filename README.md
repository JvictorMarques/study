# Web App Deploy - FastAPI + React

This project is a fullstack monitoring dashboard aimed at deepening knowledge about Kubernetes, consisting of a FastAPI backend and a React frontend. The system monitors the health of the backend, PostgreSQL database, and Redis cache, and provides interactive API documentation.

## System Requirements

- **Docker** >= 20.10
- **Docker Compose** >= 2.0 (for Docker Compose deployment)
- **Kind** >= 0.20 (for Kubernetes deployment)
- **Kubectl** >= 1.28 (for Kubernetes deployment)
- **Helm** >= 3.12 (for Kubernetes deployment)
- **Minimum recommended resources:**
  - 4GB available RAM
  - 2 CPUs
  - 10GB disk space

## Project Structure

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

## Environment Variables

### For Docker Compose

Create a `.env` file at the project root based on `.env.example`:

```env
# Frontend Configuration
VITE_API_URL=http://localhost:8000/

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=postgres

# Backend Database Connection (used internally by the backend)
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

> **⚠️ Important:** You must have a **release/tag** created in the GitHub repository set in `GITHUB_REPO` for the application to fetch the version via the GitHub API.

### For Local Development (without Docker)

### Backend (`backend/`)

- `pip install -r requirements.txt` — Installs Python dependencies.
- `uvicorn main:app --host 0.0.0.0 --port 8000` — Starts the FastAPI backend.

### Frontend (`frontend/`)

Create a `.env` file inside the `frontend` folder to set the API URL:

```env
VITE_API_URL=http://localhost:8000
```

- `npm install` — Installs dependencies.
- `npm run dev` — Starts the development server (Vite) at `http://localhost:8080`.
- `npm run build` — Builds the production bundle.
- `npm run preview` — Previews the production build locally.

> **Note:** The API address consumed by the frontend is set by the `VITE_API_URL` variable in the frontend `.env` file and centralized in the `API_BASE_URL` constant (`src/config.js`). Rebuild Vite after changing this variable.


## How to Run the Project with (`docker-compose`)

1. Make sure Docker and Docker Compose are installed on your machine [Docker installation documentation](https://docs.docker.com/engine/install/)

2. **Configure environment variables**  
   Copy `.env.example` to `.env` and adjust as needed.

3. **Start services with Docker Compose**

   ```sh
   docker compose up -d
   ```

4. **Access the frontend**  
   - Dashboard: [http://localhost:8080](http://localhost:8080)

5. **Access the backend**  
   - API: [http://localhost:8000](http://localhost:8000)
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)


## How to Run the Project with (`Kubernetes`)

1. Make sure Docker, Kind, and Kubectl are installed on your machine. See each tool's documentation:
   - [Docker](https://docs.docker.com/engine/install/)
   - [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/)
   - [Kubectl](https://kubernetes.io/docs/tasks/tools/)
   - [Helm](https://helm.sh/docs/intro/install/)

2. The local cluster is configured via the [`k8s/kind-config.yaml`](k8s/kind-config.yaml) file.

3. To create and initialize the cluster with all development resources, run the script:

   ```sh
   ./scripts/startup.sh
   ```

   - To start only the cluster: `./scripts/startup.sh --cluster` or `-c`
   - To restart the cluster: `./scripts/startup.sh --restart` or `-r`
   - To delete the cluster: `./scripts/startup.sh --delete` or `-d`

4. Access the frontend and backend via the endpoints:
   - **Dev:**
      - Frontend: [http://localhost:8081](http://localhost:8081)
      - Backend: [http://localhost:8001](http://localhost:8001)
   - **Prod:**
      - Frontend: [http://localhost:8080](http://localhost:8080)
      - Backend: [http://localhost:8000](http://localhost:8000)

> The script applies all charts from the `k8s/` directory after creating the Kind cluster. Ports are exposed via **NodePort** configured in `kind-config.yaml`.

### Notes on Docker Images

If you want to use custom images, remember to upload them to a container registry accessible by the Kubernetes cluster (e.g., Docker Hub, GitHub Container Registry).

### Useful Kubernetes Commands

```sh
# List all pods
kubectl get pods -n dev
kubectl get pods -n prod

# View logs of a specific pod
kubectl logs -f <pod-name> -n dev

# List all services
kubectl get svc -n <namespace>

# Describe a pod (useful for debugging)
kubectl describe pod <pod-name> -n <namespace>

# List deployments
kubectl get deployments -n <namespace>

# Manual port-forward (if needed)
kubectl port-forward svc/backend 8000:8000 -n <namespace>
```

## Load Testing with Locust

The project includes a load test file using [Locust](https://locust.io/) to validate the [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/).

### Installing Locust

```sh
pip install locust
```

### Run Load Tests

```sh
# Run Locust against the local environment
locust -f scripts/locustfile.py --host=http://localhost:8000

# Run in headless mode (no web UI)
locust -f scripts/locustfile.py --host=http://localhost:8000 --users 100 --spawn-rate 10 --run-time 1m --headless
```

Access the Locust web UI at: [http://localhost:8089](http://localhost:8089)

The `locustfile.py` tests the following endpoints:

- `GET /ready` (weight 10)
- `GET /` (weight 1)

## Main Endpoints

- `GET /` — Welcome message.
- `GET /health` — Checks application health.
- `GET /ready` — Checks if the application is ready to receive load.
- `GET /db-check` — Checks database connection.
- `GET /cache-check` — Checks Redis connection.

## Technologies Used

- **Frontend:** React + Vite
- **Backend:** FastAPI
- **Database:** PostgreSQL
- **Cache:** Redis
- **Orchestration:** Kubernetes + Helm
- **Load Testing:** Locust

## Troubleshooting

### Problem: Kind Cluster does not start

**Solution:**

```sh
# Check for port conflicts
sudo lsof -i :8080
sudo lsof -i :8000

# Delete and recreate the cluster
./scripts/startup.sh --delete
./scripts/startup.sh
```

### Problem: Pods do not start in Kubernetes

**Solution:**

```sh
# Check pod status
kubectl get pods -n dev

# View detailed logs
kubectl describe pod <pod-name> -n dev

# Check namespace events
kubectl get events -n dev --sort-by='.lastTimestamp'
```

### Problem: Connection error with PostgreSQL/Redis

**Solution:**

- Check if PostgreSQL and Redis pods are running
- Make sure environment variables are set correctly
- Wait for health checks to complete (may take a few seconds)

### Problem: GitHub API does not return version

**Solution:**

- Check if the `GITHUB_REPO` variable is set correctly in the format `owner/repository_name`
- Make sure there is at least one release/tag in the repository
- Check for GitHub API rate limiting (limit: 60 requests/hour unauthenticated)

## Final Considerations

This project was developed with a focus on Kubernetes best practices and distributed application architecture. Each component was carefully planned and implemented to ensure performance, scalability, and maintainability.

It was made with great care and attention to detail. Feel free to explore the project and, if you have any questions or suggestions, open an issue.

### Improvement Ideas

This project is open to contributions! Some ideas for evolution:

- 🔐 **Advanced Security:**
  - Implement Service Mesh (Istio/Linkerd)
  - Add mTLS between services

- 📊 **Observability:**
  - Integration with Prometheus and Grafana

- 🚀 **Scalability:**
  - Use KEDA (Kubernetes Event-Driven Autoscaling) for event-based HPA
  - Implement Master/Slave architecture for PostgreSQL with replication
  - Add Redis Cluster for high cache availability

- 🌐 **Infrastructure:**
  - Implement Service Discovery
  - Add Ingress Controller (NGINX/Traefik)

### Contributing

Contributions are welcome! Feel free to:

- Open issues reporting bugs or suggesting improvements
- Submit pull requests with new features
- Use this project as a study base and share your learning
- Improve the documentation

## License

This project is under the MIT license.

---

> For questions or suggestions, open an issue or submit a pull request!
