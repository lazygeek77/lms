#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROTO_DIR="${ROOT_DIR}/packages/proto/library/v1"
PY_OUT="${ROOT_DIR}/packages/proto/gen/python"
TS_OUT="${ROOT_DIR}/packages/proto/gen/ts"

mkdir -p "${PY_OUT}" "${TS_OUT}"

auto_python() {
  python3 -m grpc_tools.protoc \
    -I"${ROOT_DIR}/packages/proto" \
    --python_out="${PY_OUT}" \
    --grpc_python_out="${PY_OUT}" \
    "${PROTO_DIR}/library.proto"
}

auto_typescript() {
  if ! command -v npx >/dev/null 2>&1; then
    echo "npx not found; skipping TypeScript generation"
    return 0
  fi

  npx --yes grpc_tools_node_protoc \
    --proto_path="${ROOT_DIR}/packages/proto" \
    --js_out=import_style=commonjs,binary:"${TS_OUT}" \
    --grpc_out=grpc_js:"${TS_OUT}" \
    --plugin=protoc-gen-grpc="$(npx --yes which grpc_tools_node_protoc_plugin)" \
    "${PROTO_DIR}/library.proto" || true
}

auto_python
auto_typescript

echo "Proto generation completed."
