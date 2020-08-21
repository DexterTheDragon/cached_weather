FROM node:12-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
RUN yarn install

COPY tsconfig*.json ./
COPY src ./src

RUN yarn build

# FINAL
FROM node:12-alpine

ENV NODE_ENV=production

RUN apk add --no-cache tini

WORKDIR /usr/src/app
RUN chown node:node .

USER node

COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

COPY --from=builder /usr/src/app/build/ ./

EXPOSE 8080

CMD ["/sbin/tini", "--", "node", "index.js"]
