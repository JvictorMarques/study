import os
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from github import Github
import redis
import psycopg2


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
g = Github()
repo = g.get_repo("jvictormarques/k8s-study")


def get_db_connection():
    conn = psycopg2.connect(
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        host=os.environ["DB_HOST"],
        port=os.environ["DB_PORT"]
    )
    return conn

def get_redis_connection():
    r = redis.Redis(
        host=os.environ["REDIS_HOST"],
        port=int(os.environ["REDIS_PORT"]),
        decode_responses=True
    )
    return r


@app.get("/health")
def liveness_probe():
    return {"status": "healthy"}


@app.get("/")
def root():
    return {"message": "Hello from FastAPI 🚀"}


@app.get("/ready")
def readiness_probe():

    ready_status = {
        "status": "ready",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": repo.get_latest_release().tag_name,
        "uptime": "Running",
        "services": {
            "database": "unknown",
            "cache": "unknown"
        },
        "issues": []
    }
    try:
        conn = get_db_connection()
        conn.close()
        ready_status["services"]["database"] = "ready"
    except Exception as e:
        ready_status["services"]["database"] = "unready"
        ready_status["status"] = "unready"
        ready_status["issues"].append({
            "service": "database",
            "message": "Falha na conexão com PostgreSQL",
            "error": str(e)
        })
    try:
        r = get_redis_connection()
        r.ping()
        ready_status["services"]["cache"] = "ready"
    except Exception as e:
        ready_status["services"]["cache"] = "unready"
        ready_status["status"] = "unready"
        ready_status["issues"].append({
            "service": "cache",
            "message": "Falha na conexão com Redis",
            "error": str(e)
        })
    if ready_status["status"] != "ready":
        return JSONResponse(
            status_code=503,
            content=ready_status
        )
    return ready_status


@app.get("/db-check")
def db_check():
    try:
        conn = get_db_connection()
        conn.close()
        return {
            "status": "Database conectado",
            "service": "database",
            "healthy": True
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "Erro ao se conectar ao banco de dados",
                "service": "database",
                "healthy": False,
                "error": str(e)
            }
        )


@app.get("/cache-check")
def cache_check():
    try:
        r = get_redis_connection()
        r.set("teste", "ok")
        result = r.get("teste")
        return {
            "status": "Redis conectado", 
            "service": "cache",
            "healthy": True,
            "value": result
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "Erro ao se conectar ao Redis",
                "service": "cache",
                "healthy": False,
                "error": str(e)
            }
        )
