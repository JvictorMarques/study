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


@app.get("/ready")
def readiness_probe():
    return {"status": "ready"}

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
            dbname=os.environ["DB_NAME"],
            user=os.environ["DB_USER"],
            password=os.environ["DB_PASSWORD"],
            host=os.environ["DB_HOST"],
            port=os.environ["DB_PORT"]
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
            host=os.environ["REDIS_HOST"],
            port=int(os.environ["REDIS_PORT"]),
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
            dbname=os.environ["DB_NAME"],
            user=os.environ["DB_USER"],
            password=os.environ["DB_PASSWORD"],
            host=os.environ["DB_HOST"],
            port=os.environ["DB_PORT"]
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
            host=os.environ["REDIS_HOST"],
            port=int(os.environ["REDIS_PORT"]),
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
