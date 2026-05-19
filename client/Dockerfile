# Build
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

#ENV variables
ARG VITE_API_URL
ARG VITE_APP_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_URL=${VITE_APP_URL}

COPY . .
RUN npm run build

# Static hosting (Railway sets PORT)
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN npm install -g serve@14

COPY --from=build /app/dist ./dist

EXPOSE 8080

CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT}"]
