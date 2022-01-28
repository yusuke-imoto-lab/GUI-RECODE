FROM debian as app
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get -y update \
&&  apt-get -y install curl make wine zip \
&&  apt-get clean \
&&  rm -rf /var/lib/apt/lists/*
RUN  apt-get -y update \
&&  dpkg --add-architecture i386 && apt-get update && apt-get -y install wine32 \
&&  apt-get clean \
&&  rm -rf /var/lib/apt/lists/*
RUN  apt-get -y update \
&&  curl -sL https://deb.nodesource.com/setup_lts.x | bash - \
&&  apt-get install -y nodejs \
&&  apt-get clean \
&&  rm -rf /var/lib/apt/lists/*
RUN npm update -g npm \
&&  npm -g install electron electron-builder --allow-root --unsafe-perm=true

FROM app as cache
COPY helloworld /tmp
RUN cd /tmp \
&&  ln -s /usr/lib/node_modules \
&&  electron-builder -wml; true \
&&  rm -rf /tmp/*
