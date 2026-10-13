#!/bin/sh

cd /app

if [ "$NODE_ENV" = "production" ]; then
  echo "BUILD PRODUCTION"
  npm run build
  npm run preview -- --host 0.0.0.0 --port "$APP_PORT"
else
  npm start -- --host 0.0.0.0 --port "$APP_PORT"
fi
