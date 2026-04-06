PROTO_DIR=packages/proto

.PHONY: proto dev test

proto:
	bash $(PROTO_DIR)/generate.sh

dev:
	docker compose --profile dev up --build

test:
	docker compose --profile dev run --rm api-dev uv run --project /app/apps/api pytest -q && npm run test:web
