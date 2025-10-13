# Stage 1: Builder - Instalar dependências
FROM python:3.14.0-slim AS build
WORKDIR /app

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install -r requirements.txt

FROM python:3.14.0-slim
WORKDIR /app

RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r python && useradd -r -g python python

USER python

COPY --from=build /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "curl", "-f", "http://localhost:8000/health" ]

EXPOSE 8000

COPY main.py main.py
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
