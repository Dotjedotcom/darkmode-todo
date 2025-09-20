.PHONY: install dev build preview format f ff lint l lf test docker/build docker/run

IMAGE ?= darkmode-todo

install:
	yarn install

i: install

dev: i
	yarn dev

build:
	yarn build

preview:
	yarn preview

format:
	yarn format

f: format

ff:
	yarn format:fix

lint:
	yarn lint

l: lint
	
lf:
	yarn lint:fix

test:
	yarn test

t: test

docker/build:
	@# Prefer BuildKit via buildx; otherwise use classic builder (no BuildKit)
	@if docker buildx version >/dev/null 2>&1 && docker buildx inspect >/dev/null 2>&1; then \
		docker buildx build --load -t $(IMAGE) .; \
	else \
		echo "Note: docker buildx unavailable; using classic builder (may show deprecation)."; \
		docker build -t $(IMAGE) .; \
	fi

docker/run:
	docker run -p 8080:80 $(IMAGE)
