$ErrorActionPreference = "Stop"

Write-Host "== Docker Desktop / WSL check =="
Write-Host ""

$dockerDesktop = Get-ChildItem `
  -Path "C:\Program Files", "C:\Program Files (x86)" `
  -Filter "Docker Desktop.exe" `
  -File `
  -Recurse `
  -ErrorAction SilentlyContinue |
  Select-Object -First 1

if ($null -eq $dockerDesktop) {
  Write-Host "Docker Desktop.exe was not found in the default installation paths."
  Write-Host "Install Docker Desktop first, then rerun this script."
  exit 1
}

Write-Host "Docker Desktop found at: $($dockerDesktop.FullName)"
Write-Host "Starting Docker Desktop..."
Start-Process -FilePath $dockerDesktop.FullName

Write-Host ""
Write-Host "Docker Desktop start requested."
Write-Host "Next steps:"
Write-Host "1. Open Docker Desktop and wait until it reports that Docker is running."
Write-Host "2. Go to Settings > Resources > WSL Integration."
Write-Host "3. Enable integration for your Ubuntu distro."
Write-Host "4. Run: wsl --shutdown"
Write-Host "5. Reopen WSL and validate with: docker version"

