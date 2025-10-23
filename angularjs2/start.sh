#!/bin/bash
# Wrapper script to ensure network exists before starting containers

cd "$(dirname "$0")"

# Run network setup from parent directory
bash ../setup-network.sh

echo ""
echo "Starting AngularJS containers..."
podman compose up -d

echo ""
echo "✅ Containers started"
echo "API available at: http://localhost:8000"
echo "MongoDB available at: mongodb://localhost:27017"
