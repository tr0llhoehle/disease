#!/bin/bash

set -e

APP_DB="/var/db/db.sqlite"
REV=$(git rev-list --max-count=1 HEAD | cut -c1-8)
VERSION=$(node -e "console.log(require('`pwd`/package.json').version)")
IMAGE=tr0llhoehle/disease:${VERSION}-${REV}
DEPLOY_TYPE=${1:-"Staging"}
PORT=5000

#sudo docker build -t ${IMAGE} .
#sudo docker save ${IMAGE} | bzip2 | pv | ssh tr0llhoehle.de 'bunzip2 | docker load'
ssh tr0llhoehle.de "docker run -d -p ${PORT}:${PORT} -v /home/patrick/disease:/var/db --env APP_DB=${APP_DB} --restart=on-failure ${IMAGE} npm run start"

