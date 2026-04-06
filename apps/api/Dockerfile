FROM python:3.14-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir uv

COPY apps/api/pyproject.toml /app/apps/api/pyproject.toml
COPY apps/api/.python-version /app/apps/api/.python-version
RUN uv sync --project /app/apps/api

COPY packages/proto /app/packages/proto
RUN uv run --project /app/apps/api python -m grpc_tools.protoc \
  -I/app/packages/proto \
  --python_out=/app/packages/proto/gen/python \
  --grpc_python_out=/app/packages/proto/gen/python \
  /app/packages/proto/library/v1/library.proto

COPY apps/api /app/apps/api
COPY packages/db /app/packages/db

ENV PYTHONPATH="/app/apps/api:/app/packages/proto/gen/python"
CMD ["uv", "run", "--project", "/app/apps/api", "python", "/app/apps/api/main.py"]
