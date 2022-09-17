FROM node:16-alpine as build

ENV NODE_ENV=production

WORKDIR /build-dir

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

########################################################################################################################

FROM node:16-alpine

LABEL maintainer="github.com/aguglie" \
      name="voip-e2e-test" \
      description=""

ENV NODE_ENV=production
ENV LOG_LEVEL=info

WORKDIR /home/node/app

COPY --from=build /build-dir ./

USER node

CMD ["npm", "-s", "start"]
