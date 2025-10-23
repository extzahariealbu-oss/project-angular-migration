#!/bin/bash
# init-mongo.sh

echo "Extracting database dump..."
cd /tmp
tar -xzf /docker-entrypoint-initdb.d/install.tgz

echo "Restoring database..."
mongorestore --db tomanage /tmp/install/

echo "Database initialization complete!"