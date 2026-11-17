FROM node:20

RUN mkdir /app
WORKDIR /app

COPY babel.config.js ./
COPY jest.config.js ./

# Following lines allow to generate & install node_modules
COPY package.json ./
RUN npm install
