.PHONY: install dev build preview format f ff lint l lf test docker/build docker/run

IMAGE ?= darkmode-todo

install:
	npm i

dev: install
	npm run dev

build:
	npm run build

preview:
	npm run preview

format:
	npm run format

f: format

ff:
	npm run format:fix

lint:
	npm run lint

l: lint
	
lf:
	npm run lint:fix

test:
	npm run test

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

