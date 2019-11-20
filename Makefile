.PHONY: test help clean
.DEFAULT_GOAL: help clean

default: help

help: ## Output available commands
	@echo
	@echo "Available commands:"
	@grep -P '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

test: build-test ## run all tests
	@docker-compose -f ./docker-compose.yml run --rm test

test-mongo: build-test ## test only mongo statements
	@docker-compose -f ./docker-compose.yml run --rm test ./packages/lodex/test/mongoQueries.spec.js

test-lodex: build-test ## test only lodex statements
	@docker-compose -f ./docker-compose.yml run --rm test ./packages/lodex/test
test-core: build-test ## test only mongo statements
	@docker-compose -f ./docker-compose.yml run --rm test ./packages/core/test

build-test:
	@docker-compose build test

clean:
	@rm -Rf ./node_modules/ ./packages/*/node_modules/ ./packages/*/lib/ ./package-lock.json ./packages/*/package-lock.json
