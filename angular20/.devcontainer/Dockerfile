# Angular 20 Dev Container with Amp
# FROM node:20-bookworm

# # Install Angular CLI and Amp CLI globally
# RUN npm install -g @angular/cli@latest @sourcegraph/amp
# # Set working directory
# WORKDIR /workspace/project-angular-migration/angular20

# Run as root (Podman on Windows doesn't support UID/GID mapping for volume mounts)
# FROM ghcr.io/puppeteer/puppeteer:23.11.1

# RUN npm install -g @angular/cli@latest @sourcegraph/amp

# WORKDIR /workspace/project-angular-migration/angular20

# Angular 20 Dev Container
# FROM node:20-bookworm

# # Use Debian snapshot (immutable packages, no hash mismatches)
# RUN rm -f /etc/apt/sources.list.d/debian.sources \
#     && echo "deb [check-valid-until=no] http://snapshot.debian.org/archive/debian/20250901T000000Z bookworm main" > /etc/apt/sources.list \
#     && echo "deb [check-valid-until=no] http://snapshot.debian.org/archive/debian-security/20250901T000000Z bookworm-security main" >> /etc/apt/sources.list

# # Install Chrome dependencies for Puppeteer
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
#     libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
#     libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
#     && rm -rf /var/lib/apt/lists/*

# # Install Angular CLI and Amp CLI
# RUN npm install -g @angular/cli@latest @sourcegraph/amp

# # Set working directory
# WORKDIR /workspace/project-angular-migration/angular20
# Use Microsoft's pre-built devcontainer with Chrome already configured
# FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bookworm

# # Install Python 3 (required for Amp automation scripts)
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     python3 \
#     python3-pip \
#     && rm -rf /var/lib/apt/lists/*

# # Install Angular CLI and Amp CLI
# RUN npm install -g @angular/cli@latest @sourcegraph/amp

# # Set working directory
# WORKDIR /workspace/project-angular-migration/angular20

# This file is no longer used by the podman-compose.yml.
# You can delete it or keep it for reference.
# The functionality has been moved into the devcontainer.json's 'postCreateCommand'
# and by using a pre-built base image in podman-compose.yml.
# Start from the official Playwright image.
# It includes Node.js, npm, and pre-installed browsers (Chromium, Firefox, WebKit).
FROM mcr.microsoft.com/playwright:v1.56.0-jammy

# Temporarily switch to the root user to install system packages and global npm modules.
USER root

# Install Python 3 and the global CLIs.
# This runs during the image build, so sudo is not needed.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g @angular/cli@latest @sourcegraph/amp

# Switch back to the non-root user for security and best practices.
# This will be the default user when you connect to the container.
USER pwuser

# Set the working directory for the user.
WORKDIR /workspace/project-angular-migration/angular20

