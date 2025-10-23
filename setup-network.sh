#!/bin/bash
# Setup shared network for Angular migration project
# Run this script after recreating podman machine or initial project setup

NETWORK_NAME="project-angular-migration_app-network"

echo "Creating shared network: $NETWORK_NAME"

# Check if network already exists
if podman network exists "$NETWORK_NAME" 2>/dev/null; then
    echo "✅ Network '$NETWORK_NAME' already exists"
else
    podman network create "$NETWORK_NAME"
    echo "✅ Network '$NETWORK_NAME' created successfully"
fi

echo ""
echo "Network is ready. Both containers will use this network:"
echo "  - angularjs2 (API on port 8000)"
echo "  - angular20-dev (Angular 20 dev container on port 4200)"
