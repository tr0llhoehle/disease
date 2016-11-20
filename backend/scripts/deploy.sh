#!/bin/bash

set -e

REV=$(git rev-list --max-count=1 HEAD | cut -c1-8)
VERSION=$(node -e "console.log(require('`pwd`/package.json').version)")
IMAGE=tr0llhoehle/disease:${VERSION}-${REV}
DEPLOY_TYPE=${1:-"Staging"}
PORT=5000

sudo docker build -t ${IMAGE} --build-arg DEPLOY_TYPE=${DEPLOY_TYPE} .
docker save tr0llhoehle/disease:${VERSION} | bzip2 | pv | ssh tr0llhoehle.de 'bunzip2 | docker load'
ssh tr0llhoehle.de -c "docker run ${IMAGE} --expose ${PORT}"

