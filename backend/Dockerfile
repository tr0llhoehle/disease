FROM node:4.6-slim

ARG DEPLOY_TYPE
ARG NODE_VERSION

RUN mkdir -p /usr/local/src/app
COPY . /usr/local/src/app
WORKDIR /usr/local/src/app
RUN npm install
