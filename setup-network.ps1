# Setup shared network for Angular migration project
# Run this script after recreating podman machine or initial project setup

$NETWORK_NAME = "project-angular-migration_app-network"

Write-Host "Creating shared network: $NETWORK_NAME" -ForegroundColor Cyan

# Check if network already exists
$networkExists = podman network exists $NETWORK_NAME 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Network '$NETWORK_NAME' already exists" -ForegroundColor Green
} else {
    podman network create $NETWORK_NAME
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Network '$NETWORK_NAME' created successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create network" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Network is ready. Both containers will use this network:" -ForegroundColor White
Write-Host "  - angularjs2 (API on port 8000)" -ForegroundColor Gray
Write-Host "  - angular20-dev (Angular 20 dev container on port 4200)" -ForegroundColor Gray
