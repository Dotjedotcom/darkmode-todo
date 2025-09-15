.PHONY: docker/build docker/run

IMAGE ?= darkmode-todo

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

