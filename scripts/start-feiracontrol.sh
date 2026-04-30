#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/.runtime"
BACKEND_PID_FILE="$RUNTIME_DIR/backend.pid"
FRONTEND_PID_FILE="$RUNTIME_DIR/frontend.pid"
BACKEND_LOG_FILE="$RUNTIME_DIR/backend.log"
FRONTEND_LOG_FILE="$RUNTIME_DIR/frontend.log"

BACKEND_PORT="${BACKEND_PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
POSTGRES_DB="${POSTGRES_DB:-feiracontrol}"
POSTGRES_USER="${POSTGRES_USER:-feiracontrol}"

mkdir -p "$RUNTIME_DIR"

log() {
  printf '[feiracontrol] %s\n' "$1"
}

fail() {
  printf '[feiracontrol] erro: %s\n' "$1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "comando obrigatorio ausente: $1"
}

is_pid_running() {
  local pid="$1"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

read_pid() {
  local pid_file="$1"
  [[ -f "$pid_file" ]] || return 1
  tr -d '[:space:]' <"$pid_file"
}

wait_for_http() {
  local name="$1"
  local url="$2"
  local attempts="${3:-30}"
  local sleep_seconds="${4:-2}"

  for ((attempt = 1; attempt <= attempts; attempt++)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      log "$name pronto em $url"
      return 0
    fi
    sleep "$sleep_seconds"
  done

  return 1
}

start_background() {
  local name="$1"
  local pid_file="$2"
  local log_file="$3"
  local workdir="$4"
  shift 4

  local current_pid=""
  if current_pid="$(read_pid "$pid_file" 2>/dev/null)"; then
    if is_pid_running "$current_pid"; then
      log "$name ja esta rodando com PID $current_pid"
      return 0
    fi
    rm -f "$pid_file"
  fi

  log "subindo $name"
  (
    cd "$workdir"
    nohup "$@" >"$log_file" 2>&1 &
    echo $! >"$pid_file"
  )
}

require_command docker
require_command mvn
require_command npm
require_command curl
require_command nohup

[[ -d "$ROOT_DIR/frontend/node_modules" ]] || fail "dependencias do frontend ausentes. Rode 'cd frontend && npm install' antes do alias."

log "subindo Postgres"
(
  cd "$ROOT_DIR"
  docker compose up -d postgres
)

for attempt in {1..30}; do
  if (
    cd "$ROOT_DIR"
    docker compose exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1
  ); then
    log "Postgres pronto"
    break
  fi

  if [[ "$attempt" == "30" ]]; then
    fail "Postgres nao respondeu a tempo"
  fi

  sleep 2
done

if ! wait_for_http "backend" "http://127.0.0.1:${BACKEND_PORT}/api/health" 1 1; then
  start_background "backend" "$BACKEND_PID_FILE" "$BACKEND_LOG_FILE" "$ROOT_DIR/backend" mvn spring-boot:run
  wait_for_http "backend" "http://127.0.0.1:${BACKEND_PORT}/api/health" 60 2 || fail "backend nao respondeu. Veja $BACKEND_LOG_FILE"
else
  log "backend ja estava disponivel"
fi

if ! wait_for_http "frontend" "http://127.0.0.1:${FRONTEND_PORT}" 1 1; then
  start_background "frontend" "$FRONTEND_PID_FILE" "$FRONTEND_LOG_FILE" "$ROOT_DIR/frontend" npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT"
  wait_for_http "frontend" "http://127.0.0.1:${FRONTEND_PORT}" 60 2 || fail "frontend nao respondeu. Veja $FRONTEND_LOG_FILE"
else
  log "frontend ja estava disponivel"
fi

cat <<EOF
[feiracontrol] plataforma pronta
- frontend: http://localhost:${FRONTEND_PORT}
- backend: http://localhost:${BACKEND_PORT}
- logs backend: $BACKEND_LOG_FILE
- logs frontend: $FRONTEND_LOG_FILE

Para parar tudo:
  bash "$ROOT_DIR/scripts/stop-feiracontrol.sh"
EOF
