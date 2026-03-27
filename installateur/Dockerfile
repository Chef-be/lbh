# ============================================================
# Dockerfile — Installateur par navigateur
# Plateforme — Service autonome Flask
# ============================================================

FROM python:3.11-slim-bookworm

LABEL description="Installateur par navigateur"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /installateur

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5099

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:5099/sante || exit 1

CMD ["python", "app.py", "--port", "5099"]
