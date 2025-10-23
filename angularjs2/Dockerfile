FROM node:10-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --production

COPY config.sample config
COPY . .

EXPOSE 8000
CMD ["node", "debug.js"]