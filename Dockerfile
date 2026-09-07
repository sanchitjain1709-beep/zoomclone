FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy python dependencies from backend
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install uvicorn shim to intercept and fix unexpanded $PORT arguments from cloud start commands
COPY uvicorn_shim.py /usr/local/bin/uvicorn
RUN chmod +x /usr/local/bin/uvicorn

# Copy backend source code into container
COPY backend/ .

# Expose default port
EXPOSE 8000

# Start FastAPI backend
CMD ["python", "run.py"]
