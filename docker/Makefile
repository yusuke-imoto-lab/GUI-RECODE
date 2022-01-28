CI_REGISTRY_IMAGE  ?= registry.ritc.jp/ricos/recode-gui

all: build
login:
ifeq ($(CI_BUILD_TOKEN),)
	docker login $(CI_REGISTRY_IMAGE)
else
	docker login -u gitlab-ci-token -p $(CI_BUILD_TOKEN) $(CI_REGISTRY_IMAGE)
endif

build:
	docker build -t $(CI_REGISTRY_IMAGE)/electron-app   -f Dockerfile . --target app
	docker build -t $(CI_REGISTRY_IMAGE)/electron-cache -f Dockerfile . --target cache

push: login
	-docker push $(CI_REGISTRY_IMAGE)/electron-app
	-docker push $(CI_REGISTRY_IMAGE)/electron-cache

