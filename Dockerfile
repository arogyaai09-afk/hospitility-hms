FROM node:20-alpine AS dependencies
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm ci

FROM dependencies AS build
COPY . .
RUN npm run build

FROM dependencies AS development
COPY . .
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS production
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=build /usr/src/app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/app.js"]
