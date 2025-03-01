#Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

#Serve
FROM node:22-alpine AS serve
WORKDIR /app
COPY --from=build /app/package.json .
COPY --from=build /app/yarn.lock .
RUN yarn install --production --frozen-lockfile
COPY --from=build /app/dist .
EXPOSE 3001
CMD ["node", "dist/main.js"]
