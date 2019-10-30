FROM node:10.17.0-jessie-slim

RUN mkdir /app
WORKDIR /app

COPY jest.config.js ./
COPY lerna.json ./
COPY babel.config.js ./

# Following lines allow to speed up the MongoDB unit tests
RUN npm install mongodb-prebuilt
RUN npm install mongodb-download
RUN mkdir -p /root/.mongodb-prebuilt/
RUN npx mongodb-download --downloadDir=/root/.mongodb-prebuilt/

# Following lines allow to generate & install node_modules
COPY package.json ./
RUN npm install
RUN npx lerna bootstrap
