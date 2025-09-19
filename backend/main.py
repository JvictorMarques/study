from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis
import psycopg2
import os
from datetime import datetime, timezone

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Hello from FastAPI 🚀"}

@app.get("/health")
def healthcheck():
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).time(),
        "services": {
            "database": "unknown",
            "cache": "unknown"
        }
    }
    
    try:
        conn = psycopg2.connect(
            dbname=os.environ.get("POSTGRES_DB", "postgres"),
            user=os.environ.get("POSTGRES_USER", "postgres"), 
            password=os.environ.get("POSTGRES_PASSWORD", "postgres"),
            host=os.environ.get("DB_HOST", "db"),
            port=os.environ.get("DB_PORT", "5432")
        )
        conn.close()
        health_status["services"]["database"] = "healthy"
    except Exception:
        health_status["services"]["database"] = "unhealthy"
        health_status["status"] = "unhealthy"
    
    try:
        r = redis.Redis(
            host=os.environ.get("REDIS_HOST", "cache"), 
            port=int(os.environ.get("REDIS_PORT", "6379")), 
            decode_responses=True
        )
        r.ping()
        health_status["services"]["cache"] = "healthy"
    except Exception:
        health_status["services"]["cache"] = "unhealthy"
        health_status["status"] = "unhealthy"
    
    return health_status

@app.get("/db-check")
def db_check():
    try:
        conn = psycopg2.connect(
            dbname=os.environ.get("POSTGRES_DB", "postgres"),
            user=os.environ.get("POSTGRES_USER", "postgres"),
            password=os.environ.get("POSTGRES_PASSWORD", "postgres"),
            host=os.environ.get("DB_HOST", "db"),
            port=os.environ.get("DB_PORT", "5432")
        )
        conn.close()
        return {"status": "✅ DB conectado"}
    except Exception as e:
        return {"status": "❌ Erro DB", "error": str(e)}

@app.get("/cache-check")
def cache_check():
    try:
        r = redis.Redis(
            host=os.environ.get("REDIS_HOST", "cache"), 
            port=int(os.environ.get("REDIS_PORT", "6379")), 
            decode_responses=True
        )
        r.set("teste", "ok")
        return {"status": "✅ Redis conectado", "value": r.get("teste")}
    except Exception as e:
        return {"status": "❌ Erro Redis", "error": str(e)}
