import os
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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


@app.get("/")
def root():
    return {"message": "Hello from FastAPI 🚀"}


@app.get("/health")
def healthcheck():
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "uptime": "Running",
        "services": {
            "database": "unknown",
            "cache": "unknown"
        },
        "issues": []
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
    except Exception as e:
        health_status["services"]["database"] = "unhealthy"
        health_status["status"] = "unhealthy"
        health_status["issues"].append({
            "service": "database",
            "message": "Falha na conexão com PostgreSQL",
            "error": str(e)
        })
    
    try:
        r = redis.Redis(
            host=os.environ.get("REDIS_HOST", "cache"), 
            port=int(os.environ.get("REDIS_PORT", "6379")), 
            decode_responses=True
        )
        r.ping()
        health_status["services"]["cache"] = "healthy"
    except Exception as e:
        health_status["services"]["cache"] = "unhealthy"
        health_status["status"] = "unhealthy"
        health_status["issues"].append({
            "service": "cache",
            "message": "Falha na conexão com Redis",
            "error": str(e)
        })
    
    if health_status["status"] == "unhealthy":
        return JSONResponse(
            status_code=503,
            content=health_status
        )
    
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
        return {"status": "✅ DB conectado", "service": "database", "healthy": True}
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "❌ Erro DB", 
                "service": "database",
                "healthy": False,
                "error": str(e)
            }
        )


@app.get("/cache-check")
def cache_check():
    try:
        r = redis.Redis(
            host=os.environ.get("REDIS_HOST", "cache"), 
            port=int(os.environ.get("REDIS_PORT", "6379")), 
            decode_responses=True
        )
        r.set("teste", "ok")
        result = r.get("teste")
        return {
            "status": "✅ Redis conectado", 
            "service": "cache",
            "healthy": True,
            "value": result
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "❌ Erro Redis", 
                "service": "cache",
                "healthy": False,
                "error": str(e)
            }
        )
