#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/.runtime"
BACKEND_PID_FILE="$RUNTIME_DIR/backend.pid"
FRONTEND_PID_FILE="$RUNTIME_DIR/frontend.pid"

log() {
  printf '[feiracontrol] %s\n' "$1"
}

stop_pid_file() {
  local name="$1"
  local pid_file="$2"

  if [[ ! -f "$pid_file" ]]; then
    log "$name nao tinha PID registrado"
    return 0
  fi

  local pid
  pid="$(tr -d '[:space:]' <"$pid_file")"

  if [[ -z "$pid" ]]; then
    rm -f "$pid_file"
    log "$name tinha PID vazio e foi limpo"
    return 0
  fi

  if kill -0 "$pid" 2>/dev/null; then
    log "parando $name (PID $pid)"
    kill "$pid" 2>/dev/null || true

    for _ in {1..15}; do
      if ! kill -0 "$pid" 2>/dev/null; then
        break
      fi
      sleep 1
    done

    if kill -0 "$pid" 2>/dev/null; then
      log "$name nao encerrou a tempo; forçando parada"
      kill -9 "$pid" 2>/dev/null || true
    fi
  else
    log "$name nao estava mais rodando"
  fi

  rm -f "$pid_file"
}

stop_pid_file "frontend" "$FRONTEND_PID_FILE"
stop_pid_file "backend" "$BACKEND_PID_FILE"

(
  cd "$ROOT_DIR"
  docker compose stop postgres >/dev/null 2>&1 || true
)

log "Postgres parado"
log "plataforma encerrada"
