FROM alpine:3.4

ARG DEPLOY_TYPE
ARG NODE_VERSION

RUN mkdir /opt
WORKDIR /opt
ENTRYPOINT ["/bin/bash"]
RUN apk update && \
    apk upgrade && \
    apk add git wget bash && \
    wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash && \
    echo "[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh" >> /etc/profile.d/npm.sh && \
    echo "[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh" >> $HOME/.bashrc && \
    . $HOME/.nvm/nvm.sh && \
    nvm install ${NODE_VERSION} && \
    nvm use ${NODE_VERSION}

RUN npm install
