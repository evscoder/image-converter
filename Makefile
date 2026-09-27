APP_DIR := app
DOCKER_COMPOSE := docker compose
SERVICE := app

ifneq (,$(wildcard .env))
include .env
export
endif

.DEFAULT_GOAL := help

.PHONY: help install dev build preview test lint clean server-install server-dev server-build server-start \
	docker-config docker-build docker-up docker-up-prod docker-down docker-restart \
	docker-logs docker-shell docker-install docker-reinstall docker-clean

help:
	@printf "Available commands:\n"
	@printf "  make install        Install app dependencies\n"
	@printf "  make dev            Run Vite locally\n"
	@printf "  make build          Build app locally\n"
	@printf "  make preview        Preview local production build\n"
	@printf "  make test           Run tests locally\n"
	@printf "  make lint           Run lint locally\n"
	@printf "  make clean          Remove local build artifacts\n"
	@printf "  make server-install Install Express server dependencies\n"
	@printf "  make server-dev     Run Express server locally\n"
	@printf "  make server-build   Build Express server bundle\n"
	@printf "  make server-start   Build and run Express server without watch mode\n"
	@printf "  make docker-config  Validate docker compose config\n"
	@printf "  make docker-build   Build docker image\n"
	@printf "  make docker-up      Start docker dev container\n"
	@printf "  make docker-up-prod Start docker production preview\n"
	@printf "  make docker-down    Stop docker containers\n"
	@printf "  make docker-restart Restart docker container\n"
	@printf "  make docker-logs    Follow docker logs\n"
	@printf "  make docker-shell   Open shell in docker container\n"
	@printf "  make docker-install Install dependencies in docker volume\n"
	@printf "  make docker-reinstall Recreate docker dependencies volume\n"
	@printf "  make docker-clean   Stop containers and remove volumes\n"

install:
	cd $(APP_DIR) && npm install

dev:
	cd $(APP_DIR) && npm run dev -- --host 0.0.0.0 --port $${VITE_PORT:-4200}

build:
	cd $(APP_DIR) && npm run build

preview:
	cd $(APP_DIR) && npm run preview -- --host 0.0.0.0 --port $${VITE_PORT:-4200}

test:
	cd $(APP_DIR) && npm run test

lint:
	cd $(APP_DIR) && npm run lint

clean:
	rm -rf $(APP_DIR)/dist $(APP_DIR)/coverage

server-install:
	cd server && npm install

server-dev:
	cd server && npm run dev

server-build:
	cd server && npm run build

server-start: server-build
	cd server && npm start

docker-config:
	$(DOCKER_COMPOSE) config

docker-build:
	$(DOCKER_COMPOSE) build

docker-up:
	$(DOCKER_COMPOSE) up

docker-up-prod:
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml up --build

docker-down:
	$(DOCKER_COMPOSE) down

docker-restart:
	$(DOCKER_COMPOSE) restart $(SERVICE)

docker-logs:
	$(DOCKER_COMPOSE) logs -f $(SERVICE)

docker-shell:
	$(DOCKER_COMPOSE) exec $(SERVICE) sh

docker-install:
	$(DOCKER_COMPOSE) run --rm $(SERVICE) npm install

docker-reinstall:
	$(DOCKER_COMPOSE) down -v --remove-orphans
	$(DOCKER_COMPOSE) run --rm $(SERVICE) npm install

docker-clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans
