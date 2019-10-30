.PHONY: test help
.DEFAULT_GOAL: help

default: help

help: ## Output available commands
	@echo
	@echo "Available commands:"
	@grep -P '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

test: build-test ## run all tests
	@docker-compose -f ./docker-compose.yml run --rm test

test-mongo: build-test ## test only mongo statements
	@docker-compose -f ./docker-compose.yml run --rm test ./packages/lodex/test/mongoQueries.spec.js

test-core: build-test ## test only mongo statements
	@docker-compose -f ./docker-compose.yml run --rm test ./packages/core/test

build-test:
	@docker-compose build test

