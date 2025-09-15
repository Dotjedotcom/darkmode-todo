.PHONY: docker/build docker/run

IMAGE ?= darkmode-todo

install:
	npm i

dev: install
	npm run dev

build:
	npm run build

preview:
	npm run preview

f:
	npm run format

ff:
	npm run format:fix

l:
	npm run lint

lf:
	npm run lint:fix

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

