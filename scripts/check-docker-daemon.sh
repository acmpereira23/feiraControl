#!/usr/bin/env bash

set -euo pipefail

echo "== Docker environment check =="
echo

echo "User:"
id
echo

echo "Relevant groups:"
getent group docker || echo "docker group not found"
getent group nogroup || true
echo

echo "Kernel:"
uname -a
echo

echo "Docker CLI:"
if command -v docker >/dev/null 2>&1; then
  docker --version
else
  echo "docker not found"
  exit 1
fi
echo

echo "Docker context:"
docker context ls || true
echo

echo "DOCKER_HOST:"
echo "${DOCKER_HOST:-<unset>}"
echo

echo "Socket:"
if [ -S /var/run/docker.sock ]; then
  ls -l /var/run/docker.sock
  socket_group="$(stat -c '%G' /var/run/docker.sock)"
  echo "Socket group: ${socket_group}"
else
  echo "/var/run/docker.sock not found"
fi
echo

echo "WSL config:"
if [ -f /etc/wsl.conf ]; then
  sed -n '1,120p' /etc/wsl.conf
else
  echo "/etc/wsl.conf not found"
fi
echo

echo "Docker version probe:"
if docker version >/tmp/docker-version-check.log 2>&1; then
  cat /tmp/docker-version-check.log
  echo
  echo "Result: Docker daemon is reachable."
else
  cat /tmp/docker-version-check.log
  echo
  if grep -qi "permission denied while trying to connect to the docker API" /tmp/docker-version-check.log; then
    echo "Result: Docker daemon exists, but the current user has no permission to access the socket."
    if [ -S /var/run/docker.sock ] && [ "$(stat -c '%G' /var/run/docker.sock)" != "docker" ]; then
      echo "Observation: /var/run/docker.sock is not owned by the docker group."
      echo "This usually indicates a Docker Desktop WSL integration issue or a nonstandard daemon/socket setup."
    fi
    echo "Next steps:"
    echo "1. If you use a local daemon in WSL, run:"
    echo "   sudo usermod -aG docker \$USER"
    echo "   newgrp docker"
    echo "2. If you use Docker Desktop, confirm WSL integration is enabled for this distro and reopen WSL."
    echo "3. Validate the socket owner with: ls -l /var/run/docker.sock"
    echo "4. Validate with: docker version"
  else
    echo "Result: Docker daemon is NOT reachable."
    echo "Next step: follow the WSL setup section in README.md."
  fi
  exit 1
fi
