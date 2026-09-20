FROM node:20-alpine

ARG APP_PORT=4200
ENV APP_PORT=${APP_PORT}

WORKDIR /app

# Копируем зависимости из новой директории приложения
COPY app/package*.json ./

# Кэш и повторы делают сборку устойчивой к кратковременным сбоям npm registry.
RUN --mount=type=cache,target=/root/.npm \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000 && \
    for attempt in 1 2 3; do \
        if [ -f package-lock.json ]; then \
            npm ci --prefer-offline --no-audit --no-fund && break; \
        else \
            npm install --prefer-offline --no-audit --no-fund && break; \
        fi; \
        if [ "$attempt" = "3" ]; then exit 1; fi; \
        echo "npm install failed (attempt $attempt/3), retrying..."; \
        sleep 5; \
    done

# Копируем приложение
COPY app/ ./

# Копируем и делаем исполняемым скрипт запуска
COPY ./docker/run.sh /bin/run.sh
RUN chmod +x /bin/run.sh

# Открываем порт
EXPOSE $APP_PORT

# Запускаем
CMD ["sh", "/bin/run.sh"]
