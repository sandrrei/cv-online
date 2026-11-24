# --- Stage 1: build ---
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# --- Stage 2: production ---
FROM node:24-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install --production && npm cache clean --force

# Compiled app and views from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/views ./views
# Example CV, used when no data/cv.json is mounted
COPY --from=builder /usr/src/app/data/cv.example.json ./data/cv.example.json

EXPOSE 3000

CMD ["node", "dist/main"]
