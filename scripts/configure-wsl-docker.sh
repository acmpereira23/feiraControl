#!/usr/bin/env bash

set -euo pipefail

if [ "${EUID}" -eq 0 ]; then
  echo "Run this script as your regular user, not as root."
  exit 1
fi

if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is required but was not found."
  exit 1
fi

echo "== Configuring WSL for local Docker daemon =="
echo

echo "Writing /etc/wsl.conf with systemd enabled..."
sudo tee /etc/wsl.conf >/dev/null <<'EOF'
[boot]
systemd=true

[network]
generateResolvConf=false
EOF

echo
echo "Configuration written."
echo "Next steps:"
echo "1. In a Windows terminal, run: wsl --shutdown"
echo "2. Reopen this Ubuntu distro."
echo "3. Run: sudo systemctl enable --now docker"
echo "4. Run: sudo usermod -aG docker \$USER"
echo "5. Run: newgrp docker"
echo "6. Validate with: docker version"

