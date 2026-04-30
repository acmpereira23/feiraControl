#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
START_SCRIPT="$ROOT_DIR/scripts/start-feiracontrol.sh"
STOP_SCRIPT="$ROOT_DIR/scripts/stop-feiracontrol.sh"

resolve_rc_file() {
  local shell_name
  shell_name="$(basename "${SHELL:-bash}")"

  case "$shell_name" in
    zsh)
      printf '%s/.zshrc' "$HOME"
      ;;
    *)
      printf '%s/.bashrc' "$HOME"
      ;;
  esac
}

RC_FILE="${1:-$(resolve_rc_file)}"
START_ALIAS="alias feiracontrol='bash $START_SCRIPT'"
STOP_ALIAS="alias feiracontrol-stop='bash $STOP_SCRIPT'"

touch "$RC_FILE"

if ! grep -Fqx "$START_ALIAS" "$RC_FILE"; then
  printf '\n%s\n' "$START_ALIAS" >>"$RC_FILE"
fi

if ! grep -Fqx "$STOP_ALIAS" "$RC_FILE"; then
  printf '%s\n' "$STOP_ALIAS" >>"$RC_FILE"
fi

cat <<EOF
Alias instalados em $RC_FILE

Recarregue o shell:
  source "$RC_FILE"

Depois use:
  feiracontrol
  feiracontrol-stop
EOF
