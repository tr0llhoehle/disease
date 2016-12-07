#!/bin/bash

set -e

APP_DB="/var/db/db.sqlite"
APP_KEY="/var/ssl/privkey.pem"
APP_CERT="/var/ssl/fullchain.pem"
REV=$(git rev-list --max-count=1 HEAD | cut -c1-8)
VERSION=$(node -e "console.log(require('`pwd`/package.json').version)")
IMAGE=tr0llhoehle/disease:${VERSION}-${REV}
DEPLOY_TYPE=${1:-"Staging"}
PORT=5000
PORT_SSL=5001

RUN_CMD="docker run -d -p ${PORT}:${PORT} -p ${PORT_SSL}:${PORT_SSL} -v /home/patrick/disease:/var/db -v /home/patrick/disease.tr0llhoehle.de:/var/ssl --env APP_DB=${APP_DB} --env APP_CERT=${APP_CERT} --evn APP_KEY=${APP_KEY} --restart=on-failure ${IMAGE} npm run start"

sudo docker build -t ${IMAGE} .
sudo docker save ${IMAGE} | bzip2 | pv | ssh tr0llhoehle.de 'bunzip2 | docker load'
ssh tr0llhoehle.de "docker stop \$(docker ps | cut -f 1 -d ' ' | tail -n1)"
ssh tr0llhoehle.de "${RUN_CMD}"

